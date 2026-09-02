/**
 * Generate the temporary photography placeholders.
 *
 *   npm run images:placeholders          fill empty slots only
 *   npm run images:placeholders -- --force   redraw everything, real photos included
 *
 * Every image slot on the site gets a calm ivory slate at the slot's real
 * aspect ratio and minimum resolution, captioned with what belongs there. The
 * point is that the layout is already correct and dimensioned before the real
 * photography exists — dropping a real photo in at the same path needs no code
 * change, and causes no layout shift, because `next/image` is already sizing
 * against that ratio.
 *
 * **It will not touch real photography.** Every slate it writes is recorded in
 * `public/images/.placeholders.json` with a hash; a file that is missing from
 * that record, or whose bytes no longer match it, is somebody's photo and is
 * skipped. `--force` overrides that, and is the only destructive path here.
 *
 * SLOTS below is the starting point, not a fence: an image path in
 * content.json that has no slot gets one inferred from its folder rather than
 * failing the run.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  allSlots,
  IMAGES,
  MANIFEST,
  readManifest,
  ROOT,
  sha1,
  slugify,
  WEB_SAFE,
} from "./image-slots.mjs";

const WATERMARK = path.join(ROOT, "public/brand/lotus-mark.png");
const FORCE = process.argv.includes("--force");

/** the fixed list, plus a slot for anything new content.json points at */
const SLOTS = allSlots();
for (const slot of SLOTS) {
  if (slot.inferred) {
    console.log(`+ slot inferred from content.json: ${slot.file} (${slot.ratio.join(":")})`);
  }
}

/** hashes of the slates written by the last run: `images/hero/x.jpg` -> sha1 */
const recorded = readManifest();

/**
 * Real photos sitting in this slot — under its own name or any other extension
 * or capitalisation, which is how `lib/images.ts` matches them at runtime.
 *
 * A file counts as a placeholder only if its bytes are one we generated: either
 * the hash recorded for it last run, or `slateHash`, the slate this run would
 * write. Anything else is treated as photography and left alone. When in doubt
 * the answer is "real" — the cost of being wrong that way is a stale slate, and
 * the cost of being wrong the other way is a deleted photo.
 */
function realPhotosFor(slot, slateHash) {
  const dir = path.join(IMAGES, path.dirname(slot.file));
  const want = slugify(path.basename(slot.file));
  let names = [];
  try {
    names = fs.readdirSync(dir);
  } catch {
    return [];
  }
  return names.filter((name) => {
    if (!WEB_SAFE.includes(path.extname(name).toLowerCase())) return false;
    if (slugify(name) !== want) return false;
    const rel = `images/${path.dirname(slot.file)}/${name}`.replace(/\\/g, "/");
    let hash;
    try {
      hash = sha1(fs.readFileSync(path.join(dir, name)));
    } catch {
      return false;
    }
    return hash !== slateHash && hash !== recorded[rel];
  });
}

/* --- render --------------------------------------------------------------- */
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function render(slot) {
  const [w, h] = slot.min;
  const scale = w / 1200;
  const markW = Math.round(Math.min(w, h) * 0.34);

  const mark = await sharp(WATERMARK)
    .resize(markW, markW, { fit: "inside" })
    .composite([{ input: Buffer.from([255, 255, 255, 26]), raw: { width: 1, height: 1, channels: 4 }, tile: true, blend: "dest-in" }])
    .toBuffer();
  const markMeta = await sharp(mark).metadata();

  const titleSize = Math.round(38 * scale);
  const briefSize = Math.round(26 * scale);
  const specSize = Math.round(23 * scale);
  // centre the mark + caption as one optical group
  const gap = Math.round(46 * scale);
  const groupH = markMeta.height + gap + Math.round(84 * scale) + specSize;
  const markTop = Math.round((h - groupH) / 2);
  const textTop = markTop + markMeta.height + gap;

  const caption = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <text x="${w / 2}" y="${textTop + titleSize}" text-anchor="middle"
          font-family="Georgia, 'Times New Roman', serif" font-size="${titleSize}" fill="#a2907f">${esc(slot.label)}</text>
    <text x="${w / 2}" y="${textTop + titleSize + Math.round(40 * scale)}" text-anchor="middle"
          font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="${briefSize}" fill="#bcac9c">${esc(slot.brief)}</text>
    <text x="${w / 2}" y="${textTop + titleSize + Math.round(84 * scale)}" text-anchor="middle"
          font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="${specSize}" letter-spacing="${1.6 * scale}"
          fill="#c9bbac">${slot.ratio.join(":")} &#183; ${w}&#215;${h} min</text>
  </svg>`);

  const base = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0%" stop-color="#FBF7F0"/>
        <stop offset="100%" stop-color="#F1E7D8"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
  </svg>`);

  // returned rather than written, so the caller can compare it against what is
  // already on disk before deciding to overwrite anything
  return sharp(base)
    .composite([
      { input: mark, left: Math.round((w - markMeta.width) / 2), top: markTop },
      { input: caption, left: 0, top: 0 },
    ])
    .jpeg({ quality: 82, progressive: true, chromaSubsampling: "4:4:4" })
    .toBuffer();
}

const files = {};
let written = 0;
let kept = 0;

for (const slot of SLOTS) {
  const slate = await render(slot);
  const slateHash = sha1(slate);

  const photos = FORCE ? [] : realPhotosFor(slot, slateHash);
  if (photos.length) {
    kept++;
    console.log(
      `${slot.file.padEnd(30)} kept — real photo (${photos.join(", ")}); --force to overwrite`
    );
    continue;
  }

  const out = path.join(IMAGES, slot.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, slate);
  files[`images/${slot.file}`] = slateHash;
  written++;
  console.log(
    `${slot.file.padEnd(30)} ${slot.min.join("x").padEnd(10)} ${(slate.length / 1024).toFixed(1)} KB`
  );
}

// Carry forward hashes for slots we skipped, so a later run still recognises
// their slate if the photo is removed again.
for (const [rel, hash] of Object.entries(recorded)) if (!(rel in files)) files[rel] = hash;

fs.writeFileSync(
  MANIFEST,
  JSON.stringify({ generatedAt: new Date().toISOString(), files }, null, 2) + "\n"
);

console.log(
  `\n${written} placeholder${written === 1 ? "" : "s"} written` +
    (kept ? `, ${kept} slot${kept === 1 ? "" : "s"} left alone (real photography)` : "")
);
