/**
 * Generate the Open Graph share image.
 *
 *   node scripts/build-og-image.mjs
 *
 * Writes `app/opengraph-image.png` at exactly 1200x630, which is the size
 * WhatsApp, Facebook and LinkedIn all crop against. Next's file convention
 * picks that path up automatically and emits the og:image tags, including the
 * width/height — no metadata wiring needed.
 *
 * The artwork is composed, not invented:
 *   - the medallion is `public/brand/logo-stacked.png`, the real cut of the
 *     supplied logo sheet, so the lotus AND the `poojyo` wordmark are the
 *     brand's own artwork in the brand's own type — nothing is re-typeset;
 *   - the ring around it reproduces `.logo-ring` from globals.css;
 *   - every colour is a literal from the `:root` token block in globals.css;
 *   - the line of copy is `config.tagline` read straight out of
 *     content/content.json, and the location line is derived from
 *     `config.storeAddress`. No price, rating, review or slogan is introduced
 *     here that is not already the site's own copy.
 *
 * Deliberately NOT a photograph: every image in public/images/ is still a
 * placeholder slate, and shipping one as the share card would look like a fake
 * product shot. Re-run this script if the tagline or the logo cut changes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STACKED = path.join(root, "public/brand/logo-stacked.png");

/**
 * One rendered card, written into every route segment that needs it.
 *
 * The root file covers `/ganpati`. The legal routes need their own copy because
 * each of them sets its own `openGraph` block for title/description/url, and a
 * segment that declares `openGraph` does not inherit the parent segment's
 * file-convention image — so without a sibling file they would share a card
 * with no image at all.
 */
const OUTPUTS = [
  "app/opengraph-image.png",
  "app/privacy-policy/opengraph-image.png",
  "app/terms-and-conditions/opengraph-image.png",
  "app/cancellation-refund-policy/opengraph-image.png",
].map((p) => path.join(root, p));

const W = 1200;
const H = 630;

/* tokens, copied from the :root block in app/globals.css */
const BG_TOP = "#FBF7F0"; /* --bg */
const BG_BOTTOM = "#F1E7D8";
const SURFACE = "#FFFFFF"; /* --surface */
const INK = "#241C17"; /* --ink */
const INK_MUTED = "#6B5D53"; /* --ink-muted */
const GOLD = "#C19A6B"; /* --gold */

const { config } = JSON.parse(
  fs.readFileSync(path.join(root, "content/content.json"), "utf8")
);

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * The tagline reads "Premium Ganpati Flower Garlands, delivered across Mumbai".
 * Split at the comma so it sets as two balanced lines; if it is ever rewritten
 * without one, it simply stays on a single line.
 */
function taglineLines(tagline) {
  const i = tagline.indexOf(",");
  if (i === -1) return [tagline];
  return [tagline.slice(0, i + 1), tagline.slice(i + 1).trim()];
}

/** "…, Chembur, Mumbai, Maharashtra 400071" -> "Chembur, Mumbai" */
function locationLine(address) {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  const city = parts.find((p) => /mumbai/i.test(p));
  const area = parts.find((p) => /chembur/i.test(p));
  return [area, city].filter(Boolean).join(", ");
}

const lines = taglineLines(config.tagline ?? "");
const location = locationLine(config.storeAddress ?? "");

/* --- medallion: the stacked lockup inside the brand's gold ring ------------ */
const RING = 232; // outer diameter
const MARK = Math.round(RING * 0.62); // same 0.62 ratio as LogoMedallion
const ringCx = W / 2;
const ringCy = 236;

const mark = await sharp(STACKED)
  .resize({ width: MARK, fit: "inside" })
  .toBuffer();
const markMeta = await sharp(mark).metadata();

const headSize = 46;
const subSize = 25;
const headTop = ringCy + RING / 2 + 74;

const canvas = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0%" stop-color="${BG_TOP}"/>
      <stop offset="100%" stop-color="${BG_BOTTOM}"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- .logo-ring: white disc, 1px gold border, 6px gold halo at 8% -->
  <circle cx="${ringCx}" cy="${ringCy}" r="${RING / 2 + 7}" fill="none"
          stroke="${GOLD}" stroke-opacity="0.10" stroke-width="14"/>
  <circle cx="${ringCx}" cy="${ringCy}" r="${RING / 2}" fill="${SURFACE}"
          stroke="${GOLD}" stroke-width="1.5"/>

  ${lines
    .map(
      (line, i) => `<text x="${W / 2}" y="${headTop + i * (headSize + 16)}"
      text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
      font-size="${headSize}" fill="${INK}">${esc(line)}</text>`
    )
    .join("\n  ")}

  ${
    location
      ? `<text x="${W / 2}" y="${headTop + lines.length * (headSize + 16) + 26}"
      text-anchor="middle" font-family="Segoe UI, Helvetica, Arial, sans-serif"
      font-size="${subSize}" letter-spacing="2.4" fill="${INK_MUTED}">${esc(
          location.toUpperCase()
        )}</text>`
      : ""
  }
</svg>`);

const card = await sharp(canvas)
  .composite([
    {
      input: mark,
      left: Math.round(ringCx - markMeta.width / 2),
      top: Math.round(ringCy - markMeta.height / 2),
    },
  ])
  .png({ compressionLevel: 9, palette: true })
  .toBuffer();

for (const out of OUTPUTS) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, card);

  // assert on what was actually written, not on what we asked for — 1200x630 is
  // the contract every share card is cropped against
  const { width, height } = await sharp(out).metadata();
  const { size } = fs.statSync(out);
  const rel = path.relative(root, out).replace(/\\/g, "/");
  console.log(`${rel.padEnd(48)} ${width}x${height}  ${(size / 1024).toFixed(1)} KB`);
  if (width !== W || height !== H) {
    console.error(`${rel} is ${width}x${height}, expected ${W}x${H}`);
    process.exit(1);
  }
}
