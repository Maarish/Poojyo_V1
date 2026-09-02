/**
 * Snapshot what is in public/images and public/brand, for the runtime to use
 * when it cannot read the disk itself.
 *
 *   node scripts/build-image-manifest.mjs      (runs automatically on `npm run build`)
 *
 * `lib/images.ts` normally scans `public/` directly, which is what lets a photo
 * dropped in during `next dev` appear on the next reload. On a serverless host
 * that scan finds nothing: `public/` is served from the CDN and is not on the
 * function's filesystem. Without this snapshot, a photo saved as `premium-1.png`
 * would resolve locally and quietly fall back to the literal `.jpg` path in
 * production — a swap that works on your machine and not on the site.
 *
 * The output is committed so `tsc` and a build without this step still work.
 */
import fs from "node:fs";
import path from "node:path";
import { readManifest, ROOT, sha1 } from "./image-slots.mjs";

const OUT = path.join(ROOT, "lib/image-manifest.json");
const PUBLIC = path.join(ROOT, "public");
const ROOTS = ["images", "brand"];
const WEB_SAFE = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"];

const placeholderHashes = readManifest();

/** @type {{u: string, v: string, p: boolean}[]} */
const files = [];

const walk = (rel) => {
  let entries;
  try {
    entries = fs.readdirSync(path.join(PUBLIC, rel), { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const childRel = `${rel}/${entry.name}`;
    if (entry.isDirectory()) {
      walk(childRel);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!WEB_SAFE.includes(path.extname(entry.name).toLowerCase())) continue;

    const abs = path.join(PUBLIC, childRel);
    let hash;
    try {
      hash = sha1(fs.readFileSync(abs));
    } catch {
      continue;
    }

    // A content hash, not the mtime: git does not preserve timestamps, so an
    // mtime here would differ on every clone and rewrite this file on every
    // build. The hash changes only when the photo actually does.
    files.push({
      u: `/${childRel}`,
      v: hash.slice(0, 8),
      p: hash === placeholderHashes[childRel],
    });
  }
};

for (const root of ROOTS) walk(root);
files.sort((a, b) => a.u.localeCompare(b.u)); // stable output, so the diff is real changes only

fs.writeFileSync(OUT, JSON.stringify({ files }, null, 2) + "\n");
console.log(`${files.length} images snapshotted to ${path.relative(process.cwd(), OUT)}`);
