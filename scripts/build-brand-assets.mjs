/**
 * Re-cut the POOJYO logo assets from the supplied brand sheet.
 *
 *   node scripts/build-brand-assets.mjs
 *
 * `public/brand/poojyo-logo.png` (1040x1024) is the artwork POOJYO supplied. It
 * is a *raster* sheet showing the logo at several sizes on a grid background,
 * so every asset the site uses has to be cut out of it. The large medallion in
 * the middle is by far the biggest instance of the artwork, so both the lotus
 * and the `poojyo` wordmark are lifted from there:
 *
 *   lotus     sheet x 353..686, y 294..509   (334 x 216)
 *   wordmark  sheet x 319..715, y 527..647   (397 x 121)
 *
 * The horizontal lockup is then laid out using the proportions of the sheet's
 * own "2) SLIM/HEADER" version (measured at sheet x 442..650, y 120..172), and
 * the stacked lockup reproduces the medallion's own arrangement. Nothing is
 * redrawn or reinterpreted — the artwork is only re-cut and re-composed.
 *
 * If POOJYO ever supplies vector originals, this script becomes unnecessary:
 * drop the .svg files into public/brand/ and repoint components/Logo.tsx.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHEET = path.join(root, "public/brand/poojyo-logo.png");
const BRAND = path.join(root, "public/brand");
const APP = path.join(root, "app");

const LOTUS = { left: 353, top: 294, width: 334, height: 216 };
const WORD = { left: 319, top: 527, width: 397, height: 121 };

/**
 * The medallion's gold ring, in sheet coordinates. Both crops clip a corner of
 * it, so anything at a greater radius than this is forced to background. The
 * ring's inner edge measures ~260px from the centre; 256 clears it without
 * touching the wordmark's lowest descender (247px out).
 */
const RING = { cx: 528, cy: 515, clear: 256 };

/**
 * Lift a crop off the sheet's grid background.
 *
 * Background is identified by colour rather than by connectivity, because the
 * grid also shows through the enclosed counters of the `p`, `o`, `j` and `y` —
 * a flood fill from the crop border can never reach those.
 */
async function lift(region, pad = 8) {
  const box = {
    left: region.left - pad,
    top: region.top - pad,
    width: region.width + pad * 2,
    height: region.height + pad * 2,
  };
  const { data, info } = await sharp(SHEET)
    .extract(box)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;

  const outside = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) {
    const i = p * ch;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;

    // Paper and its blue-grey grid run cool (247,251,254) while the artwork —
    // including the near-white flame inside the lotus (255,254,245) — runs
    // warm. That red-vs-blue tilt is what separates the two, because a
    // brightness test alone would eat the flame.
    const cool = b >= r - 2;
    if (a < 40 || (sat < 0.22 && max > 185 && cool)) outside[p] = 1;

    // clip whatever the crop caught of the medallion's gold ring
    const dx = box.left + (p % w) - RING.cx;
    const dy = box.top + ((p / w) | 0) - RING.cy;
    if (dx * dx + dy * dy > RING.clear * RING.clear) outside[p] = 1;
  }

  // Pixels on the artwork's edge are a blend of ink and white paper. Holding
  // them at partial alpha instead of full keeps a pale halo from showing when
  // the logo sits on the ivory page.
  const alpha = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (outside[p]) continue;
      const edge =
        (x > 0 && outside[p - 1]) ||
        (x < w - 1 && outside[p + 1]) ||
        (y > 0 && outside[p - w]) ||
        (y < h - 1 && outside[p + w]);
      alpha[p] = edge ? 150 : 255;
    }
  }

  // 3x3 box blur on alpha only, to take the stair-stepping off the outline
  const soft = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          sum += alpha[ny * w + nx];
          n++;
        }
      }
      soft[y * w + x] = Math.round(sum / n);
    }
  }

  const rgba = Buffer.alloc(w * h * 4);
  for (let p = 0; p < w * h; p++) {
    rgba[p * 4] = data[p * ch];
    rgba[p * 4 + 1] = data[p * ch + 1];
    rgba[p * 4 + 2] = data[p * ch + 2];
    rgba[p * 4 + 3] = soft[p];
  }

  const png = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toBuffer();

  // drop the transparent margin the padding introduced
  return sharp(png).trim({ threshold: 8 }).png().toBuffer();
}

/** alpha at or above this counts as glyph ink rather than an antialiased edge */
const INK = 24;

/**
 * Split a wordmark cut into its glyph runs, with each run's tight vertical
 * extent. A run is a maximal band of columns that carry ink, so glyphs that
 * touch (here: the `y` and the final `o`) come back as one run — which is
 * exactly what we want, since a merged pair must be left alone.
 */
function glyphRuns(data, w, h, ch) {
  const alphaAt = (x, y) => data[(y * w + x) * ch + 3];

  const inked = [];
  for (let x = 0; x < w; x++) {
    let on = false;
    for (let y = 0; y < h && !on; y++) if (alphaAt(x, y) > INK) on = true;
    inked.push(on);
  }

  const runs = [];
  let start = null;
  inked.forEach((on, x) => {
    if (on && start === null) start = x;
    if (!on && start !== null) { runs.push({ left: start, right: x - 1 }); start = null; }
  });
  if (start !== null) runs.push({ left: start, right: w - 1 });

  for (const r of runs) {
    let top = h;
    let bottom = -1;
    for (let x = r.left; x <= r.right; x++) {
      for (let y = 0; y < h; y++) {
        if (alphaAt(x, y) <= INK) continue;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
    r.top = top;
    r.bottom = bottom;
    r.width = r.right - r.left + 1;
    r.height = bottom - top + 1;
  }
  return runs;
}

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

/**
 * Find the runs that are a standalone lowercase `o`.
 *
 * An `o` is the only letter in `poojyo` that both starts at the x-height and
 * sits on the baseline — `p` and `y` descend below it, and `j` adds a dot above
 * — so that pair of edges identifies one without knowing anything about where
 * the letters fall. The baseline is taken as the highest bottom edge among the
 * x-height runs, because the descenders in this word all reach lower.
 */
function findOGlyphs(runs) {
  const BAND = 3; // px of slack, for antialiasing on the outermost row
  const xHeightTop = median(runs.map((r) => r.top));
  const onXHeight = runs.filter((r) => Math.abs(r.top - xHeightTop) <= BAND);
  if (onXHeight.length === 0) return [];
  const baseline = Math.min(...onXHeight.map((r) => r.bottom));
  return onXHeight.filter((r) => Math.abs(r.bottom - baseline) <= BAND);
}

/**
 * Rebuild the wordmark: one `o` design, and even letter-spacing.
 *
 * Two defects in the source cut, both fixed here by moving and re-stamping the
 * sheet's own pixels — nothing is redrawn, recoloured or rescaled.
 *
 * 1. THE SECOND `o` IS A DIFFERENT GLYPH. In the medallion artwork the first
 *    and last `o` are a narrow, high-contrast serif `o` (66x68, aspect 0.97)
 *    while the middle one is a wide, nearly circular `o` (84x69, aspect 1.22).
 *    So: take the first `o`'s bitmap and stamp it, unaltered, over every other
 *    standalone `o` whose shape does not match it, aligned on the baseline.
 *    The final `o` is fused to the `y`, but it is already the narrow design, so
 *    it needs no substitution — and leaving that run untouched is also what
 *    keeps the `y` exactly as drawn.
 *
 * 2. THE TRACKING IS UNEVEN. As a share of the wordmark's width the four gaps
 *    run 2.3% / 3.5% / 1.5% / 1.8%, where every other lockup on the sheet
 *    (SLIM/HEADER, and both bottom-row versions) holds ~2%. That 3.5% gap is
 *    what made the logo read as "poo jyo". So: clamp any gap wider than the
 *    median down to the median, and leave the rest exactly as drawn.
 *
 * Substituting a 66px `o` for an 84px one makes the wordmark ~18px narrower.
 * That is inherent — the correct glyph simply takes less room — and both
 * lockups measure the wordmark at composition time, so their proportions
 * follow it rather than having to be re-tuned.
 */
async function normalizeWordmark(png) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;

  const runs = glyphRuns(data, w, h, ch);
  if (runs.length < 3) return png; // nothing separable — leave the cut alone

  /* --- 1. one `o` design ------------------------------------------------- */
  const oRuns = findOGlyphs(runs);
  const canonical = oRuns[0];
  let stamped = 0;

  if (!canonical) {
    console.warn("wordmark: no standalone `o` found — glyph unification skipped");
  } else {
    const canonicalBitmap = await sharp(png)
      .extract({ left: canonical.left, top: canonical.top, width: canonical.width, height: canonical.height })
      .png()
      .toBuffer();

    for (const r of oRuns) {
      if (r === canonical) continue;
      // same width AND height means it is already the same drawing
      if (r.width === canonical.width && r.height === canonical.height) continue;
      r.substitute = canonicalBitmap;
      r.substituteWidth = canonical.width;
      // baseline-aligned, so the replacement sits on the line the original did
      r.substituteTop = r.bottom - canonical.height + 1;
      stamped++;
      console.log(
        `wordmark glyph         o at x${r.left} was ${r.width}x${r.height} ` +
          `(aspect ${(r.width / r.height).toFixed(2)}) -> stamped with the first o, ` +
          `${canonical.width}x${canonical.height} (aspect ${(canonical.width / canonical.height).toFixed(2)})`
      );
    }
    if (stamped === 0) console.log("wordmark glyph         every o already identical");
  }

  /* --- 2. even tracking -------------------------------------------------- */
  const gaps = runs.slice(1).map((r, i) => r.left - runs[i].right - 1);
  const gapMedian = median(gaps);
  const kept = gaps.map((g) => Math.min(g, gapMedian));

  if (stamped === 0 && kept.every((g, i) => g === gaps[i])) return png; // nothing to do

  /* --- 3. recompose ------------------------------------------------------ */
  const advance = (r) => r.substituteWidth ?? r.width;
  const width = runs.reduce((sum, r) => sum + advance(r), 0) + kept.reduce((a, b) => a + b, 0);

  const parts = [];
  let left = 0;
  for (let i = 0; i < runs.length; i++) {
    const r = runs[i];
    if (r.substitute) {
      parts.push({ input: r.substitute, left, top: r.substituteTop });
    } else {
      // full-height strip, so the glyph keeps its exact vertical position
      parts.push({
        input: await sharp(png).extract({ left: r.left, top: 0, width: r.width, height: h }).png().toBuffer(),
        left,
        top: 0,
      });
    }
    left += advance(r) + (kept[i] ?? 0);
  }

  console.log(
    `wordmark tracking      gaps ${gaps.join(",")} -> ${kept.join(",")} (median ${gapMedian}), ${w} -> ${width}px`
  );
  return sharp({ create: { width, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(parts)
    .png()
    .toBuffer();
}

const lotus = await lift(LOTUS);
const word = await normalizeWordmark(await lift(WORD));
const lotusMeta = await sharp(lotus).metadata();
const wordMeta = await sharp(word).metadata();
const say = (name, w, h) => console.log(`${name.padEnd(22)} ${w} x ${h}`);
say("lotus (cut)", lotusMeta.width, lotusMeta.height);
say("wordmark (cut)", wordMeta.width, wordMeta.height);

const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };
const IVORY = { r: 0xfb, g: 0xf7, b: 0xf0, alpha: 1 };

const canvas = (width, height, background = CLEAR) =>
  sharp({ create: { width, height, channels: 4, background } });

/* -------------------------------------------------------------------------
   HORIZONTAL — sticky header. Proportions from the sheet's SLIM/HEADER
   version: wordmark height = 0.755 x lotus height, gap = 0.1125 x lotus width,
   and the two share a baseline. The lotus is scaled *down* to meet the
   wordmark so neither element is ever upscaled.
   ------------------------------------------------------------------------- */
{
  const wordH = wordMeta.height;
  const lotusH = Math.round(wordH / 0.755);
  const lotusW = Math.round((lotusMeta.width / lotusMeta.height) * lotusH);
  const gap = Math.round(lotusW * 0.1125);
  const padX = Math.round(lotusW * 0.04);
  const padY = Math.round(lotusH * 0.06);
  const width = padX * 2 + lotusW + gap + wordMeta.width;
  const height = padY * 2 + lotusH;

  const scaled = await sharp(lotus)
    .resize(lotusW, lotusH, { fit: "fill", kernel: "lanczos3" })
    .toBuffer();

  await canvas(width, height)
    .composite([
      { input: scaled, left: padX, top: padY },
      {
        input: word,
        left: padX + lotusW + gap,
        top: padY + lotusH - Math.round(lotusH * 0.04) - wordH,
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(BRAND, "logo-horizontal.png"));
  say("logo-horizontal.png", width, height);
}

/* -------------------------------------------------------------------------
   STACKED — hero and footer medallion. The medallion's own arrangement:
   lotus centred above the wordmark, gap 18px at the sheet's native scale.
   ------------------------------------------------------------------------- */
{
  const gap = Math.round(lotusMeta.height * (18 / 216));
  const pad = Math.round(wordMeta.width * 0.03);
  const width = pad * 2 + Math.max(lotusMeta.width, wordMeta.width);
  const height = pad * 2 + lotusMeta.height + gap + wordMeta.height;

  await canvas(width, height)
    .composite([
      { input: lotus, left: Math.round((width - lotusMeta.width) / 2), top: pad },
      {
        input: word,
        left: Math.round((width - wordMeta.width) / 2),
        top: pad + lotusMeta.height + gap,
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(BRAND, "logo-stacked.png"));
  say("logo-stacked.png", width, height);
}

/* -------------------------------------------------------------------------
   LOTUS ALONE — tight mark, square mark, and the app icons.
   ------------------------------------------------------------------------- */
await sharp(lotus).png({ compressionLevel: 9 }).toFile(path.join(BRAND, "lotus-icon.png"));
say("lotus-icon.png", lotusMeta.width, lotusMeta.height);

async function squareMark(size, background, file, coverage) {
  const w = Math.round(size * coverage);
  const h = Math.round((lotusMeta.height / lotusMeta.width) * w);
  const inner = await sharp(lotus)
    .resize(w, h, { fit: "fill", kernel: "lanczos3" })
    .toBuffer();
  await canvas(size, size, background)
    .composite([
      { input: inner, left: Math.round((size - w) / 2), top: Math.round((size - h) / 2) },
    ])
    .png({ compressionLevel: 9 })
    .toFile(file);
  say(path.basename(file), size, size);
}

await squareMark(512, CLEAR, path.join(BRAND, "lotus-mark.png"), 0.8);
// Favicon is the lotus alone. 32x32 is the briefed size; icon1 covers retina
// browser tabs and Android home screens (Next.js sorts numbered icons lexically).
await squareMark(32, CLEAR, path.join(APP, "icon.png"), 0.94);
await squareMark(192, CLEAR, path.join(APP, "icon1.png"), 0.88);
await squareMark(180, IVORY, path.join(APP, "apple-icon.png"), 0.74);
