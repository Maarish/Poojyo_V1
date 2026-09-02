# POOJYO brand assets

These are the **real POOJYO logo assets**, cut from the supplied brand sheet
(`poojyo-logo.png`). Nothing here was redrawn or reinterpreted — the lotus and
the `poojyo` wordmark are pixel crops of the original artwork, re-composed into
the lockups the site needs.

Both the lotus and the wordmark are lifted from the **large medallion** in the
middle of the sheet, which is by far the biggest instance of the artwork on it.
The horizontal lockup then follows the proportions of the sheet's own
"2) SLIM/HEADER" version, and the stacked lockup reproduces the medallion's own
arrangement.

| File | Size | Used for |
| --- | --- | --- |
| `poojyo-logo.png` | 1040×1024 | the supplied brand sheet — source of truth, never rendered on the site |
| `logo-horizontal.png` | 687×188 | sticky top header (lotus + `poojyo` wordmark, side by side) |
| `logo-stacked.png` | 402×393 | hero and footer lockups, centred inside the gold ring |
| `lotus-icon.png` | 345×225 | the lotus mark on its own |
| `lotus-mark.png` | 512×512 | square, padded lotus — social/OG, and the placeholder watermark |
| `../../app/icon.png` | 32×32 | browser favicon, lotus only (Next.js serves it automatically) |
| `../../app/icon1.png` | 192×192 | the same favicon for retina tabs and Android home screens |
| `../../app/apple-icon.png` | 180×180 | iOS home-screen icon, flattened onto ivory |

Every logo on the site renders through **one component**, `components/Logo.tsx`.
That component *imports* the two PNGs rather than referencing them by path, so
Next reads their real pixel sizes at build time. Do not reintroduce hardcoded
dimensions there — the build script re-cuts these files and any literal would go
stale and start stretching the artwork.

## Two corrections applied to the wordmark cut

The medallion is the largest instance of `poojyo` on the sheet, which is why the
wordmark is cut from it — but it is also the instance with two defects. Both are
corrected in `scripts/build-brand-assets.mjs` by moving and re-stamping the
sheet's own pixels. Nothing is redrawn, recoloured or rescaled.

1. **The middle `o` was a different glyph.** In the medallion artwork the first
   and last `o` are a narrow, high-contrast serif `o` (66×68, aspect 0.97) while
   the middle one is a wide, nearly circular `o` (84×69, aspect 1.22). The build
   now stamps the first `o`'s bitmap, unaltered, over the middle one — the two
   are byte-identical in the output. The final `o` is fused to the `y` and was
   already the narrow design, so that run is left untouched, which is also what
   keeps the `y` exactly as drawn.
2. **The tracking was uneven.** As a share of the wordmark's width the gaps ran
   2.3% / 3.5% / 1.5% / 1.8%, where every other lockup on the sheet holds ~2%.
   That 3.5% gap made the logo read as "poo jyo". Gaps wider than the median are
   now clamped to the median; the rest are left exactly as drawn.

Correcting the middle `o` makes the wordmark ~18px narrower — inherent, since
the right glyph takes less room. Both lockups measure the wordmark at
composition time, so their proportions follow it automatically.

## Brand colours (from the sheet's own palette block)

| Swatch | Hex | Role on the site |
| --- | --- | --- |
| Deep magenta | `#701A3D` | primary — CTAs, active pills, headings |
| Pink-magenta | `#9E1B51` | hover states and small accents |
| Gold | `#C19A6B` | ★ rating, savings badge, and the logo ring — nothing else |

## ⚠️ Please supply vector originals

The brand sheet is a **raster** image, so these crops top out at roughly 350–715px
wide. That is comfortably sharp everywhere the site uses them today, including on
3x phone screens, but vectors would be better and would future-proof any larger
placement (print, large signage, an oversized hero lockup).

If POOJYO has the original `.svg` / `.ai` / `.eps` files, drop them in as:

```
public/brand/logo-horizontal.svg
public/brand/logo-stacked.svg
public/brand/lotus-icon.svg
```

then change the two `src` paths at the top of `components/Logo.tsx` to the `.svg`
files. Nothing else needs to change.

## Regenerating these crops

```bash
node scripts/build-brand-assets.mjs
```

The script isolates the artwork by colour: the paper and its blue-grey grid run
cool (`247,251,254`) while every part of the logo — including the near-white
flame inside the lotus (`255,254,245`) — runs warm. It also clips the medallion's
gold ring, which both crops otherwise catch a corner of. If the brand sheet is
ever replaced, re-measure the crop rectangles at the top of that file first.
