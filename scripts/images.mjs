/**
 * Photography status, and one-command repair.
 *
 *   npm run images          what is in place, what is still a placeholder
 *   npm run images -- --fix convert, shrink and tidy the files that need it
 *
 * Dropping a photo into `public/images/` is all it takes for the site to pick
 * it up — `lib/images.ts` matches on the name alone, ignoring extension,
 * capitalisation and punctuation. This script exists for the two things that
 * still cannot resolve themselves:
 *
 *   - telling you whether your file landed where you thought it did, and
 *   - a `.HEIC` straight off a phone, or an 8 MB export, which will load
 *     nowhere or load slowly. `--fix` converts and shrinks those.
 *
 * `--fix` never destroys anything: the untouched original is copied to
 * `image-originals/` first.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  allSlots,
  CONVERTIBLE,
  IMAGES,
  listImageFiles,
  ORIGINALS,
  readManifest,
  sha1,
  slugify,
  WEB_SAFE,
} from "./image-slots.mjs";

const FIX = process.argv.includes("--fix");

/** past this, a photo is bigger than any phone screen can use */
const MAX_EDGE = 2400;
/** past this, the page pays for bytes nobody can see */
const MAX_BYTES = 900 * 1024;

const recorded = readManifest();
const rel = (file) => `images/${file}`.replace(/\\/g, "/");
const kb = (n) => `${Math.round(n / 1024)} KB`;

/* --- gather ---------------------------------------------------------------- */

/** @type {Map<string, {file: string, bytes: number, mtimeMs: number, placeholder: boolean, width?: number, height?: number, unusable: boolean}>} */
const files = new Map();

for (const file of listImageFiles()) {
  const abs = path.join(IMAGES, file);
  const ext = path.extname(file).toLowerCase();
  let stat;
  try {
    stat = fs.statSync(abs);
  } catch {
    continue;
  }

  const usable = WEB_SAFE.includes(ext);
  let placeholder = false;
  if (usable) {
    try {
      placeholder = sha1(fs.readFileSync(abs)) === recorded[rel(file)];
    } catch {
      /* unreadable — reported as an error below */
    }
  }

  let width, height;
  try {
    ({ width, height } = await sharp(abs).metadata());
  } catch {
    /* sharp cannot read it; still worth listing */
  }

  files.set(file, {
    file,
    bytes: stat.size,
    mtimeMs: stat.mtimeMs,
    placeholder,
    width,
    height,
    unusable: !usable,
  });
}

/**
 * The files that answer to a slot's name, ordered the way `lib/images.ts`
 * orders them: servable files first, then real photos over placeholders, then
 * most recently modified.
 */
function candidatesFor(slot) {
  const folder = path.dirname(slot.file).replace(/\\/g, "/");
  const want = slugify(path.basename(slot.file));
  return [...files.values()]
    .filter((f) => path.dirname(f.file).replace(/\\/g, "/") === folder && slugify(path.basename(f.file)) === want)
    .sort(
      (a, b) =>
        Number(a.unusable) - Number(b.unusable) ||
        Number(a.placeholder) - Number(b.placeholder) ||
        b.mtimeMs - a.mtimeMs
    );
}

/* --- repair ---------------------------------------------------------------- */

/** keep the untouched original outside public/ before rewriting a file */
function backup(file) {
  const dest = path.join(ORIGINALS, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!fs.existsSync(dest)) fs.copyFileSync(path.join(IMAGES, file), dest);
  return path.relative(process.cwd(), dest);
}

const fixes = [];

if (FIX) {
  for (const entry of [...files.values()]) {
    const abs = path.join(IMAGES, entry.file);
    const ext = path.extname(entry.file).toLowerCase();

    // 1. a format no browser will render — convert it to jpg beside itself
    if (CONVERTIBLE.includes(ext)) {
      const target = entry.file.replace(/\.[^.]+$/, ".jpg");
      try {
        const buf = await sharp(abs)
          .rotate() // honour the phone's orientation tag before it is dropped
          .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 82, progressive: true })
          .toBuffer();
        backup(entry.file);
        fs.writeFileSync(path.join(IMAGES, target), buf);
        fs.rmSync(abs);
        fixes.push(`converted  ${entry.file} -> ${path.basename(target)} (${kb(buf.length)})`);
      } catch (error) {
        fixes.push(`FAILED     ${entry.file} — ${error.message}`);
      }
      continue;
    }

    if (!WEB_SAFE.includes(ext) || entry.placeholder) continue;

    // 2. far larger than any layout uses, or simply heavy
    const tooBig = (entry.width ?? 0) > MAX_EDGE || (entry.height ?? 0) > MAX_EDGE;
    if (!tooBig && entry.bytes <= MAX_BYTES) continue;
    if (ext === ".gif" || ext === ".svg") continue; // resizing these loses more than it saves

    try {
      let pipeline = sharp(abs).rotate();
      if (tooBig) pipeline = pipeline.resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true });
      pipeline =
        ext === ".png"
          ? pipeline.png({ compressionLevel: 9 })
          : ext === ".webp"
            ? pipeline.webp({ quality: 82 })
            : ext === ".avif"
              ? pipeline.avif({ quality: 60 })
              : pipeline.jpeg({ quality: 82, progressive: true });
      const buf = await pipeline.toBuffer();
      if (buf.length >= entry.bytes && !tooBig) continue; // no gain — leave it alone
      backup(entry.file);
      fs.writeFileSync(abs, buf);
      fixes.push(`shrank     ${entry.file}  ${kb(entry.bytes)} -> ${kb(buf.length)}`);
    } catch (error) {
      fixes.push(`FAILED     ${entry.file} — ${error.message}`);
    }
  }

  // 3. slates a real photo has taken over from — dead weight in the repo
  for (const slot of allSlots()) {
    const candidates = candidatesFor(slot);
    if (!candidates.some((c) => !c.placeholder)) continue;
    for (const stale of candidates.filter((c) => c.placeholder)) {
      fs.rmSync(path.join(IMAGES, stale.file));
      fixes.push(`removed    ${stale.file} — superseded placeholder`);
    }
  }

  if (fixes.length) {
    console.log(fixes.map((f) => `  ${f}`).join("\n"));
    if (fs.existsSync(ORIGINALS)) {
      console.log(`\nUntouched originals kept in ${path.relative(process.cwd(), ORIGINALS)}/`);
    }
    // the scan above is now stale, so stop rather than report on old numbers
    console.log("\nRe-run `npm run images` to see the result.\n");
    process.exit(0);
  }
  console.log("Nothing to fix — every photo is already web-ready.\n");
}

/* --- report ---------------------------------------------------------------- */

const slots = allSlots();
const claimed = new Set();
let real = 0;
let waiting = 0;
const notes = [];

console.log(`\nPOOJYO photography — ${slots.length} slots\n`);

for (const slot of slots) {
  const candidates = candidatesFor(slot);
  for (const c of candidates) claimed.add(c.file);

  const used = candidates[0];
  const label = slot.file.padEnd(30);
  const [rw, rh] = slot.ratio;

  if (!used) {
    waiting++;
    console.log(`  ✗  ${label} missing — nothing in this folder answers to that name`);
    continue;
  }

  if (used.unusable) {
    waiting++;
    console.log(
      `  !  ${label} ${path.basename(used.file).padEnd(24)} ${path.extname(used.file)} cannot be shown in a browser — run \`npm run images -- --fix\``
    );
    continue;
  }

  if (used.placeholder) {
    waiting++;
    console.log(`  ·  ${label} placeholder — ${rw}:${rh}, shoot at least ${slot.min.join("×")}`);
    continue;
  }

  real++;
  const size = used.width && used.height ? `${used.width}×${used.height}` : "?";
  const shown = path.basename(used.file);
  console.log(`  ✔  ${label} ${shown.padEnd(24)} ${size.padEnd(11)} ${kb(used.bytes)}`);

  if (used.width && used.height) {
    const off = Math.abs(used.width / used.height - rw / rh) / (rw / rh);
    if (off > 0.12) {
      notes.push(`${used.file} is ${size}; the slot is ${rw}:${rh}, so the photo will be cropped to fit.`);
    }
    if (used.width < slot.min[0] || used.height < slot.min[1]) {
      notes.push(`${used.file} is ${size}, below the ${slot.min.join("×")} this slot wants — it will look soft on phones.`);
    }
  }
  if (used.bytes > MAX_BYTES) {
    notes.push(`${used.file} is ${kb(used.bytes)}. Run \`npm run images -- --fix\` to shrink it.`);
  }
}

const strays = [...files.values()].filter((f) => !claimed.has(f.file));
if (strays.length) {
  console.log(`\nNot used by any slot (${strays.length}):`);
  for (const stray of strays) {
    const folder = path.dirname(stray.file).replace(/\\/g, "/");
    const nearby = slots
      .filter((s) => path.dirname(s.file).replace(/\\/g, "/") === folder)
      .slice(0, 3)
      .map((s) => path.basename(s.file));
    const hint = nearby.length ? `rename it to one of: ${nearby.join(", ")}…` : "no slots in this folder";
    console.log(`  ?  ${stray.file.padEnd(30)} ${hint}`);
  }
}

if (notes.length) {
  console.log("\nWorth a look:");
  for (const note of [...new Set(notes)]) console.log(`  ! ${note}`);
}

console.log(
  `\n${real} real photo${real === 1 ? "" : "s"}, ${waiting} slot${waiting === 1 ? "" : "s"} still waiting.` +
    (waiting ? `\nDrop a file into public/images/<folder>/ named after the slot — any extension, any capitalisation.` : "") +
    "\n"
);
