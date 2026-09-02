import fs from "node:fs";
import path from "node:path";
import snapshot from "./image-manifest.json";

/**
 * Forgiving image resolution.
 *
 * Replacing a photo used to mean matching the old file *exactly* — same folder,
 * same name, same `.jpg` extension — and then clearing the dev image cache by
 * hand because the optimizer kept serving the previous bytes. Both of those are
 * gone. Whatever the content points at, this module finds the file that is
 * actually on disk:
 *
 *   /images/garlands/premium-1.jpg   (what content.json says)
 *   Premium 1.PNG                    (what was dropped into the folder)
 *
 * ...resolve to the same photo. Extension, capitalisation, spaces, underscores
 * and the folder itself are all treated as noise. When two files could match,
 * the most recently modified one wins — the one just dropped in is the one the
 * editor means.
 *
 * Every resolved path carries a `?v=<mtime>` stamp, so a replaced file is a new
 * URL to `next/image` and to the browser. That is what makes a swap show up on
 * reload instead of after a cache purge.
 *
 * Server-only. Content is resolved once in `normalize()`, so client components
 * receive plain, already-resolved strings.
 *
 * Two sources, in that order: a live scan of `public/`, which is what lets a
 * file dropped in during `next dev` appear on the next reload; and
 * `image-manifest.json`, a build-time snapshot, for serverless hosts where
 * `public/` is served from a CDN and is not on the function's filesystem.
 */

/** folders under `public/` that are scanned for photography */
const ROOTS = ["images", "brand"];

/** anything a browser can actually display; other files are indexed too so the
 *  status script can flag them, but they are never silently served */
const WEB_SAFE = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]);

/** folders under `public/` that are scanned for video (see resolveVideo) */
const VIDEO_ROOTS = ["video", "videos"];

/** containers a browser will play inline; `.mov` only sometimes, but a phone
 *  recording dropped in unconverted should at least resolve rather than vanish */
const VIDEO_SAFE = new Set([".mp4", ".webm", ".m4v", ".mov", ".ogv"]);

/**
 * Written by `scripts/build-placeholders.mjs`; lists every file it generated.
 * A real photo always wins over a generated slate, whatever the timestamps say
 * — otherwise re-running that script would bury a photo dropped in under a
 * different extension.
 */
const PLACEHOLDER_MANIFEST = "images/.placeholders.json";

type Entry = {
  /** public URL, original casing, e.g. `/images/garlands/Premium 1.PNG` */
  url: string;
  /** cache-buster: changes whenever the file's bytes do */
  version: string;
  /** live scans only; 0 from the snapshot, which carries no timestamps */
  mtimeMs: number;
  /** true for a generated ivory slate awaiting real photography */
  placeholder: boolean;
};

type Index = {
  /** `images/garlands/premium-1` -> entries, best match first */
  byFolderSlug: Map<string, Entry[]>;
  /** `premium-1` -> entries anywhere in the tree, best match first */
  bySlug: Map<string, Entry[]>;
  /** false when `public/` could not be read — callers then pass paths through */
  usable: boolean;
};

/**
 * Strip a filename down to what an editor actually meant by it.
 * `Premium 1.PNG` -> `premium-1`, `pkg_1.5.jpeg` -> `pkg-1-5`
 */
function slugify(basename: string): string {
  return basename
    .replace(/\.[a-z0-9]+$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function push(map: Map<string, Entry[]>, key: string, entry: Entry) {
  const list = map.get(key);
  if (list) list.push(entry);
  else map.set(key, [entry]);
}

function buildIndex(): Index {
  const index: Index = { byFolderSlug: new Map(), bySlug: new Map(), usable: false };

  const publicDir = path.join(process.cwd(), "public");

  /** relative paths (`images/hero/hero-garland.jpg`) of generated slates */
  let placeholders = new Set<string>();
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(publicDir, PLACEHOLDER_MANIFEST), "utf8"));
    placeholders = new Set(Object.keys(manifest?.files ?? {}).map((k) => k.toLowerCase()));
  } catch {
    // no manifest yet — every file simply counts as real
  }

  /** depth-first walk; `rel` is the URL-shaped path below public/ */
  const walk = (rel: string) => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(path.join(publicDir, rel), { withFileTypes: true });
    } catch {
      return; // folder absent (or an unusual deploy layout) — not an error
    }
    index.usable = true;

    for (const dirent of entries) {
      if (dirent.name.startsWith(".")) continue;
      const childRel = `${rel}/${dirent.name}`;

      if (dirent.isDirectory()) {
        walk(childRel);
        continue;
      }
      if (!dirent.isFile()) continue;
      if (!WEB_SAFE.has(path.extname(dirent.name).toLowerCase())) continue;

      let mtimeMs = 0;
      try {
        mtimeMs = fs.statSync(path.join(publicDir, childRel)).mtimeMs;
      } catch {
        continue;
      }

      const entry: Entry = {
        url: `/${childRel}`,
        version: Math.round(mtimeMs).toString(36),
        mtimeMs,
        placeholder: placeholders.has(childRel.toLowerCase()),
      };
      const slug = slugify(dirent.name);

      push(index.byFolderSlug, `${rel.toLowerCase()}/${slug}`, entry);
      push(index.bySlug, slug, entry);
    }
  };

  for (const root of ROOTS) walk(root);

  if (!index.usable) return indexFromSnapshot();

  sortIndex(index);
  return index;
}

/**
 * The same index, built from the committed build-time snapshot. Used wherever
 * `public/` is not readable at runtime — without it a photo saved under a
 * different extension would resolve in dev and silently fall back to the
 * literal path once deployed.
 */
function indexFromSnapshot(): Index {
  const index: Index = { byFolderSlug: new Map(), bySlug: new Map(), usable: false };

  for (const file of snapshot.files) {
    const rel = file.u.replace(/^\//, "");
    const folder = rel.slice(0, rel.lastIndexOf("/"));
    const slug = slugify(rel.slice(rel.lastIndexOf("/") + 1));
    if (!slug) continue;

    const entry: Entry = { url: file.u, version: file.v, mtimeMs: 0, placeholder: file.p };
    push(index.byFolderSlug, `${folder.toLowerCase()}/${slug}`, entry);
    push(index.bySlug, slug, entry);
    index.usable = true;
  }

  sortIndex(index);
  return index;
}

/** real photos ahead of generated slates, then newest first — so a freshly
 *  dropped file beats the one it replaces */
function sortIndex(index: Index) {
  for (const list of [...index.byFolderSlug.values(), ...index.bySlug.values()]) {
    list.sort((a, b) => Number(a.placeholder) - Number(b.placeholder) || b.mtimeMs - a.mtimeMs);
  }
}

/* ---------------------------------------------------------------------------
 * Index caching.
 *
 * Production scans once. Dev re-scans at most once a second, so dropping a file
 * into `public/images/` shows up on the next reload without restarting `next
 * dev` — the whole point of the exercise.
 * ------------------------------------------------------------------------- */

const DEV = process.env.NODE_ENV !== "production";
const DEV_TTL_MS = 1000;

let cached: Index | null = null;
let cachedAt = 0;

function getIndex(): Index {
  if (cached && (!DEV || Date.now() - cachedAt < DEV_TTL_MS)) return cached;
  try {
    cached = buildIndex();
  } catch {
    cached = indexFromSnapshot();
  }
  cachedAt = Date.now();
  return cached;
}

/* ---------------------------------------------------------------------------
 * Remote URLs
 * ------------------------------------------------------------------------- */

const DRIVE_ID = [
  /drive\.google\.com\/file\/d\/([\w-]{10,})/i,
  /drive\.google\.com\/open\?id=([\w-]{10,})/i,
  /drive\.google\.com\/uc\?(?:export=\w+&)?id=([\w-]{10,})/i,
];

/**
 * Turn the link an editor actually has in their clipboard into one that serves
 * image bytes. A Google Drive "share" link renders an HTML viewer page, not a
 * photo, and pasting one into the Sheet is the single most common way a remote
 * image ends up broken.
 */
function normalizeRemote(url: string): string {
  for (const pattern of DRIVE_ID) {
    const match = url.match(pattern);
    if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  if (/dropbox\.com/i.test(url)) {
    return url.replace(/([?&])dl=0\b/, "$1raw=1").replace(/([?&])dl=1\b/, "$1raw=1");
  }
  return url;
}

/* ---------------------------------------------------------------------------
 * Resolution
 * ------------------------------------------------------------------------- */

const REMOTE = /^(https?:)?\/\//i;

function stamp(entry: Entry): string {
  // encodeURI so a filename with spaces ("Premium 1.png") is a valid URL
  return `${encodeURI(entry.url)}?v=${entry.version}`;
}

/**
 * Resolve a content or component image reference to something that will load.
 *
 * Accepts, and treats as the same photo:
 *   `/images/garlands/premium-1.jpg`, `images/garlands/premium-1.png`,
 *   `public/images/garlands/Premium 1.JPG`, `garlands/premium_1.webp`,
 *   `premium-1.jpg`, or any http(s) URL.
 *
 * Returns `undefined` when nothing on disk matches, which makes `MediaFrame`
 * draw its calm placeholder rather than a broken image icon.
 */
export function resolveImage(src?: string | null): string | undefined {
  const raw = (src ?? "").trim();
  if (!raw) return undefined;
  if (raw.startsWith("data:")) return raw;
  if (REMOTE.test(raw)) return normalizeRemote(raw);

  const index = getIndex();
  // Nothing to match against (unusual deploy layout) — pass the path through
  // untouched rather than blanking every photo on the site.
  if (!index.usable) return raw.startsWith("/") ? raw : `/${raw}`;

  // Tolerate `public/` prefixes, backslashes, leading slashes, query junk.
  const cleaned = raw
    .split(/[?#]/)[0]
    .replace(/\\/g, "/")
    .replace(/^\/?public\//i, "")
    .replace(/^\/+/, "");
  if (!cleaned) return undefined;

  const basename = cleaned.slice(cleaned.lastIndexOf("/") + 1);
  const slug = slugify(basename);
  if (!slug) return undefined;

  const folder = cleaned.includes("/") ? cleaned.slice(0, cleaned.lastIndexOf("/")) : "";
  // a bare `garlands/premium-1.jpg` is understood as living under images/
  const folders = folder
    ? ROOTS.some((r) => folder.toLowerCase() === r || folder.toLowerCase().startsWith(`${r}/`))
      ? [folder]
      : [`images/${folder}`, folder]
    : [];

  // 1. the named folder, any extension or capitalisation
  for (const dir of folders) {
    const inFolder = index.byFolderSlug.get(`${dir.toLowerCase()}/${slug}`);
    const hit = pick(inFolder, `/${dir}/${basename}`.toLowerCase());
    if (hit) return stamp(hit);
  }

  // 2. that name anywhere under public/images — covers a file dropped into the
  //    wrong sub-folder, which is otherwise a silent, baffling blank slot
  const hit = pick(index.bySlug.get(slug));
  if (hit) return stamp(hit);

  return undefined;
}

/* ---------------------------------------------------------------------------
 * Video
 *
 * The hero video gets the same forgiving treatment as the photography: whatever
 * the config points at, this finds the file that is actually in `public/video/`,
 * whatever extension or capitalisation it was saved under, and stamps it with
 * the file's mtime so replacing the clip is a new URL rather than a cache purge.
 *
 * Separate index from the photos because the extension sets are disjoint and
 * `public/video/` is deliberately outside the folders the image tooling walks —
 * a 6 MB mp4 must never be picked up as a candidate for a photo slot.
 * ------------------------------------------------------------------------- */

let videoCached: Index | null = null;
let videoCachedAt = 0;

/** true when `public/` is on this process's filesystem at all */
function publicIsReadable(): boolean {
  try {
    return fs.statSync(path.join(process.cwd(), "public")).isDirectory();
  } catch {
    return false;
  }
}

function buildVideoIndex(): Index {
  const index: Index = { byFolderSlug: new Map(), bySlug: new Map(), usable: false };
  const publicDir = path.join(process.cwd(), "public");

  const walk = (rel: string) => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(path.join(publicDir, rel), { withFileTypes: true });
    } catch {
      return; // no video folder yet — not an error, the poster simply stands alone
    }
    index.usable = true;

    for (const dirent of entries) {
      if (dirent.name.startsWith(".")) continue;
      const childRel = `${rel}/${dirent.name}`;

      if (dirent.isDirectory()) {
        walk(childRel);
        continue;
      }
      if (!dirent.isFile()) continue;
      if (!VIDEO_SAFE.has(path.extname(dirent.name).toLowerCase())) continue;

      let mtimeMs = 0;
      try {
        mtimeMs = fs.statSync(path.join(publicDir, childRel)).mtimeMs;
      } catch {
        continue;
      }

      const entry: Entry = {
        url: `/${childRel}`,
        version: Math.round(mtimeMs).toString(36),
        mtimeMs,
        placeholder: false, // there is no such thing as a generated stand-in clip
      };
      const slug = slugify(dirent.name);

      push(index.byFolderSlug, `${rel.toLowerCase()}/${slug}`, entry);
      push(index.bySlug, slug, entry);
    }
  };

  for (const root of VIDEO_ROOTS) walk(root);

  sortIndex(index);
  return index;
}

function getVideoIndex(): Index {
  if (videoCached && (!DEV || Date.now() - videoCachedAt < DEV_TTL_MS)) return videoCached;
  try {
    videoCached = buildVideoIndex();
  } catch {
    videoCached = { byFolderSlug: new Map(), bySlug: new Map(), usable: false };
  }
  videoCachedAt = Date.now();
  return videoCached;
}

/**
 * Resolve a video reference to something that will play.
 *
 * Accepts, and treats as the same clip: `/video/hero-garland.mp4`,
 * `video/Hero Garland.MP4`, `hero-garland.webm`, or any http(s) URL.
 *
 * Returns `undefined` when no such clip exists, which is what makes the hero
 * degrade to its poster image rather than to a broken <video> — so the site is
 * correct both before the film is shot and after it is dropped in.
 *
 * The one exception is a host that does not serve `public/` from the function's
 * own filesystem: there nothing can be found by scanning, so the literal path
 * is passed through and the CDN answers for it.
 */
export function resolveVideo(src?: string | null): string | undefined {
  const raw = (src ?? "").trim();
  if (!raw) return undefined;
  if (REMOTE.test(raw)) return normalizeRemote(raw);

  const cleaned = raw
    .split(/[?#]/)[0]
    .replace(/\\/g, "/")
    .replace(/^\/?public\//i, "")
    .replace(/^\/+/, "");
  if (!cleaned) return undefined;

  const index = getVideoIndex();
  // `public/` itself unreadable (serverless / CDN-served) — trust the path.
  // `public/` readable but no video folder in it simply means no clip yet.
  if (!index.usable) return publicIsReadable() ? undefined : `/${cleaned}`;

  const basename = cleaned.slice(cleaned.lastIndexOf("/") + 1);
  const slug = slugify(basename);
  if (!slug) return undefined;

  const folder = cleaned.includes("/") ? cleaned.slice(0, cleaned.lastIndexOf("/")) : "";
  // a bare `hero-garland.mp4` is understood as living under video/
  const folders = folder
    ? VIDEO_ROOTS.some((r) => folder.toLowerCase() === r || folder.toLowerCase().startsWith(`${r}/`))
      ? [folder]
      : [`video/${folder}`, folder]
    : ["video"];

  for (const dir of folders) {
    const inFolder = index.byFolderSlug.get(`${dir.toLowerCase()}/${slug}`);
    const hit = pick(inFolder, `/${dir}/${basename}`.toLowerCase());
    if (hit) return stamp(hit);
  }

  const hit = pick(index.bySlug.get(slug));
  return hit ? stamp(hit) : undefined;
}

/**
 * Choose between files that all answer to the same name. A real photo always
 * beats a generated placeholder; within that, the exact filename asked for wins
 * if it is there, otherwise the most recently modified file does.
 */
function pick(candidates: Entry[] | undefined, exactUrl?: string): Entry | undefined {
  if (!candidates?.length) return undefined;
  const real = candidates.filter((c) => !c.placeholder);
  const pool = real.length ? real : candidates;
  if (exactUrl) {
    const exact = pool.find((c) => c.url.toLowerCase() === exactUrl);
    if (exact) return exact;
  }
  return pool[0]; // already sorted: real first, then newest
}

/**
 * Say so when the content asks for a photo that is not there.
 *
 * A path that matches nothing resolves to `undefined`, and the caller below
 * quietly drops it — which is the right runtime behaviour (a calm slate, or one
 * fewer tile, beats a broken icon) but a miserable way to find out that a Sheet
 * cell and the filesystem have drifted apart. Once per distinct path per
 * process, so a rebuild is noisy and a busy page is not.
 */
const missing = new Set<string>();
function warnMissing(value: string) {
  if (process.env.NODE_ENV === "production" || missing.has(value)) return;
  missing.add(value);
  // eslint-disable-next-line no-console
  console.warn(
    `[poojyo/images] "${value}" matched no file under public/images or public/brand — ` +
      `that slot will render empty. Check the path in the Sheet (or content.json) ` +
      `against what is actually on disk.`
  );
}

/**
 * Rewrite every `image` / `images` value in a content tree through
 * {@link resolveImage}. Keys are matched by name, so a new image-bearing field
 * added to the schema is resolved without touching this file.
 */
export function resolveContentImages<T>(node: T): T {
  if (Array.isArray(node)) {
    return node.map((item) => resolveContentImages(item)) as unknown as T;
  }
  if (!node || typeof node !== "object") return node;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (key === "image" && typeof value === "string") {
      const hit = resolveImage(value);
      if (!hit && value.trim()) warnMissing(value);
      out[key] = hit ?? "";
    } else if (key === "images" && Array.isArray(value)) {
      out[key] = value
        .map((v) => {
          if (typeof v !== "string") return undefined;
          const hit = resolveImage(v);
          if (!hit && v.trim()) warnMissing(v);
          return hit;
        })
        .filter((v): v is string => Boolean(v));
    } else {
      out[key] = resolveContentImages(value);
    }
  }
  return out as T;
}
