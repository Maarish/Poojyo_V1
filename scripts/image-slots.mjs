/**
 * Where photographs go, and how to tell a real one from a placeholder.
 *
 * Shared by `build-placeholders.mjs` (which draws the slates) and `images.mjs`
 * (which reports on and repairs what has been dropped in). Nothing here is
 * enforced at runtime — `lib/images.ts` will happily serve a file that matches
 * no slot. This list exists so the tooling can say something useful about what
 * is still missing.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const IMAGES = path.join(ROOT, "public/images");
export const MANIFEST = path.join(IMAGES, ".placeholders.json");
/** originals are kept here before anything rewrites them; outside public/ */
export const ORIGINALS = path.join(ROOT, "image-originals");

/** formats a browser can display; everything else has to be converted */
export const WEB_SAFE = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"];
/** common camera/phone formats that look fine on a desktop and load nowhere */
export const CONVERTIBLE = [".heic", ".heif", ".tif", ".tiff", ".bmp"];

/** @type {{file: string, ratio: [number, number], min: [number, number], label: string, brief: string}[]} */
export const SLOTS = [
  { file: "hero/hero-garland.jpg", ratio: [4, 5], min: [1200, 1500], label: "Hero garland", brief: "One garland, shot close, natural light" },

  { file: "garlands/premium-1.jpg", ratio: [4, 3], min: [1200, 900], label: "Premium Ganpati garland", brief: "Full length" },
  { file: "garlands/premium-2.jpg", ratio: [4, 3], min: [1200, 900], label: "Premium rose garland", brief: "Full length" },
  { file: "garlands/ganpati-1.jpg", ratio: [4, 3], min: [1200, 900], label: "Classic Ganpati garland", brief: "Full length" },
  { file: "garlands/ganpati-2.jpg", ratio: [4, 3], min: [1200, 900], label: "Mogra garland", brief: "Full length" },
  { file: "garlands/custom-1.jpg", ratio: [4, 3], min: [1200, 900], label: "Custom garland", brief: "A commission, ideally in situ" },

  // Each package shows several garland designs. `pkg-N.jpg` is design 1 and
  // doubles as the fallback whenever the `images` list is empty; `pkg-N-1..3`
  // are the other designs in that package's set.
  { file: "packages/pkg-1-5.jpg", ratio: [4, 3], min: [1200, 900], label: "1.5-day package · design 1", brief: "Daily garlands laid out together" },
  { file: "packages/pkg-1-5-1.jpg", ratio: [4, 3], min: [1200, 900], label: "1.5-day package · design 2", brief: "A different garland design" },
  { file: "packages/pkg-1-5-2.jpg", ratio: [4, 3], min: [1200, 900], label: "1.5-day package · design 3", brief: "A different garland design" },
  { file: "packages/pkg-1-5-3.jpg", ratio: [4, 3], min: [1200, 900], label: "1.5-day package · design 4", brief: "A different garland design" },

  { file: "packages/pkg-3.jpg", ratio: [4, 3], min: [1200, 900], label: "3-day package · design 1", brief: "Daily garlands laid out together" },
  { file: "packages/pkg-3-1.jpg", ratio: [4, 3], min: [1200, 900], label: "3-day package · design 2", brief: "A different garland design" },
  { file: "packages/pkg-3-2.jpg", ratio: [4, 3], min: [1200, 900], label: "3-day package · design 3", brief: "A different garland design" },
  { file: "packages/pkg-3-3.jpg", ratio: [4, 3], min: [1200, 900], label: "3-day package · design 4", brief: "A different garland design" },

  { file: "packages/pkg-5.jpg", ratio: [4, 3], min: [1200, 900], label: "5-day package · design 1", brief: "Daily garlands laid out together" },
  { file: "packages/pkg-5-1.jpg", ratio: [4, 3], min: [1200, 900], label: "5-day package · design 2", brief: "A different garland design" },
  { file: "packages/pkg-5-2.jpg", ratio: [4, 3], min: [1200, 900], label: "5-day package · design 3", brief: "A different garland design" },
  { file: "packages/pkg-5-3.jpg", ratio: [4, 3], min: [1200, 900], label: "5-day package · design 4", brief: "A different garland design" },

  { file: "packages/pkg-7.jpg", ratio: [4, 3], min: [1200, 900], label: "7-day package · design 1", brief: "Daily garlands laid out together" },
  { file: "packages/pkg-7-1.jpg", ratio: [4, 3], min: [1200, 900], label: "7-day package · design 2", brief: "A different garland design" },
  { file: "packages/pkg-7-2.jpg", ratio: [4, 3], min: [1200, 900], label: "7-day package · design 3", brief: "A different garland design" },
  { file: "packages/pkg-7-3.jpg", ratio: [4, 3], min: [1200, 900], label: "7-day package · design 4", brief: "A different garland design" },

  { file: "packages/pkg-10.jpg", ratio: [4, 3], min: [1200, 900], label: "10-day package · design 1", brief: "Daily garlands laid out together" },
  { file: "packages/pkg-10-1.jpg", ratio: [4, 3], min: [1200, 900], label: "10-day package · design 2", brief: "A different garland design" },
  { file: "packages/pkg-10-2.jpg", ratio: [4, 3], min: [1200, 900], label: "10-day package · design 3", brief: "A different garland design" },
  { file: "packages/pkg-10-3.jpg", ratio: [4, 3], min: [1200, 900], label: "10-day package · design 4", brief: "A different garland design" },

  { file: "essentials/durva.jpg", ratio: [1, 1], min: [800, 800], label: "Durva", brief: "Pooja essential" },
  { file: "essentials/flowers.jpg", ratio: [1, 1], min: [800, 800], label: "Loose flowers", brief: "Pooja essential" },
  { file: "essentials/kumkum.jpg", ratio: [1, 1], min: [800, 800], label: "Kumkum", brief: "Pooja essential" },
  { file: "essentials/camphor.jpg", ratio: [1, 1], min: [800, 800], label: "Camphor", brief: "Pooja essential" },
  { file: "essentials/agarbathi.jpg", ratio: [1, 1], min: [800, 800], label: "Agarbathi", brief: "Pooja essential" },
  { file: "essentials/haldi.jpg", ratio: [1, 1], min: [800, 800], label: "Haldi", brief: "Pooja essential" },

  { file: "decor/home-1.jpg", ratio: [4, 3], min: [1200, 900], label: "Home Ganpati decoration", brief: "A finished home setup" },
  { file: "decor/mandap-1.jpg", ratio: [4, 3], min: [1200, 900], label: "Mandap & backdrop", brief: "Backdrop work" },
  { file: "decor/chowki-1.jpg", ratio: [4, 3], min: [1200, 900], label: "Chowki decoration", brief: "Where Bappa is seated" },
  { file: "decor/door-1.jpg", ratio: [4, 3], min: [1200, 900], label: "Door & entrance flowers", brief: "Toran / entrance" },

  { file: "store/store-1.jpg", ratio: [4, 3], min: [1200, 900], label: "Store front", brief: "Chembur shopfront, signage legible" },
  { file: "store/store-2.jpg", ratio: [4, 3], min: [1200, 900], label: "Inside the store", brief: "Ideally garlands being made" },

  // One photo, not a pair: the mandal block is a single supporting shot beside
  // the copy, so this is the only mandal slot the site asks for.
  { file: "mandal/mandal-garland-large.jpg", ratio: [4, 3], min: [1200, 900], label: "Large mandal garland", brief: "One large garland for a mandal or sarvajanik Ganpati — include a person for scale, that is the whole point of the shot" },

  // No Instagram slots: that section is a single outbound button now, with no
  // imagery of its own. Anything still sitting in `public/images/instagram/` is
  // simply unused — `lib/images.ts` will not serve what nothing asks for.
];

/* --- helpers, shared so both scripts agree with lib/images.ts -------------- */

export const sha1 = (buf) => crypto.createHash("sha1").update(buf).digest("hex");

/**
 * The same reduction `lib/images.ts` uses: strip the extension and treat
 * capitals, spaces, dots and underscores as noise.
 * `Premium 1.PNG` -> `premium-1`
 */
export const slugify = (name) =>
  name.replace(/\.[a-z0-9]+$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const titleCase = (s) =>
  s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();

/** `{ "images/hero/hero-garland.jpg": "<sha1 of the slate we drew>" }` */
export function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, "utf8")).files ?? {};
  } catch {
    return {}; // first run, or somebody deleted it — then nothing is a placeholder
  }
}

/** anything that is plausibly a photograph, servable or not */
const IMAGE_EXTS = [...WEB_SAFE, ...CONVERTIBLE, ".svg"];

/** every image file under public/images, as paths relative to that folder */
export function listImageFiles(dir = IMAGES, prefix = "") {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...listImageFiles(path.join(dir, entry.name), rel));
    else if (entry.isFile() && IMAGE_EXTS.includes(path.extname(entry.name).toLowerCase())) {
      out.push(rel);
    }
  }
  return out;
}

/** the image paths content.json points at, relative to public/images */
export function referencedInContent() {
  const referenced = new Set();
  let content;
  try {
    content = JSON.parse(fs.readFileSync(path.join(ROOT, "content/content.json"), "utf8"));
  } catch {
    return referenced;
  }
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (node && typeof node === "object") {
      for (const [key, value] of Object.entries(node)) {
        if ((key === "image" || key === "images") && value) {
          for (const v of [value].flat()) {
            if (typeof v === "string" && v.startsWith("/images/")) {
              referenced.add(v.replace(/^\/images\//, ""));
            }
          }
        } else walk(value);
      }
    }
  };
  walk(content);
  return referenced;
}

/** the shape a folder is shot at, used when a slot has to be guessed */
const FOLDER_SHAPE = {
  hero: { ratio: [4, 5], min: [1200, 1500] },
  instagram: { ratio: [9, 16], min: [720, 1280] },
  essentials: { ratio: [1, 1], min: [800, 800] },
};
export const DEFAULT_SHAPE = { ratio: [4, 3], min: [1200, 900] };

export const shapeFor = (file) => {
  const folder = file.includes("/") ? file.slice(0, file.indexOf("/")) : "";
  return FOLDER_SHAPE[folder] ?? DEFAULT_SHAPE;
};

/**
 * SLOTS, plus a slot for any path content.json references that has no entry —
 * adding an image to the content should never mean editing this file first.
 */
export function allSlots() {
  const slots = [...SLOTS];
  const covered = new Set(slots.map((s) => s.file));
  for (const file of referencedInContent()) {
    if (covered.has(file)) continue;
    const folder = file.includes("/") ? file.slice(0, file.indexOf("/")) : "";
    slots.push({
      ...shapeFor(file),
      file,
      label: titleCase(path.basename(file, path.extname(file))),
      brief: `${titleCase(folder) || "Photo"} — add a real photo`,
      inferred: true,
    });
    covered.add(file);
  }
  return slots;
}
