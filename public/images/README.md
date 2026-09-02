# Photography

Most files here are still **temporary placeholders** — a warm ivory slate with
the lotus watermark, captioned with what belongs in the slot. They exist so the
page is fully laid out and correctly dimensioned before the real photography
arrives.

## Replacing a photo

1. Put your photo in the right folder.
2. Name it after the slot — `premium-1`, `hero-garland`, `pkg-3-2`.
3. Reload.

That is the whole procedure. In particular you do **not** have to:

- **match the extension.** `premium-1.png`, `premium-1.webp` and `premium-1.jpg`
  are all the same slot. Whichever file is actually there is the one that loads.
- **match the capitalisation or punctuation.** `Premium 1.JPG`, `PREMIUM_1.png`
  and `premium.1.jpeg` all resolve to `premium-1`. Capitals, spaces, dots,
  underscores and hyphens are treated as the same thing.
- **delete the old file first.** A real photo always wins over a placeholder, so
  you can drop yours in alongside and it takes over immediately.
- **clear any cache.** Each photo's URL carries its own file timestamp, so a
  replaced file is a new URL to both the browser and the image optimizer. The
  old "delete `.next/dev/cache/images`" step is gone.
- **edit any code**, `content.json`, or this file.

If a file lands in the wrong sub-folder, it is still found by name — so a photo
dropped into `packages/` that belongs in `garlands/` will show up rather than
silently leave a blank slot.

The one thing that has to match is the **name**, reduced to lowercase letters,
digits and hyphens. `Premium 2 final.jpg` reduces to `premium-2-final`, which is
not a slot, so nothing will happen. Rename it to `premium-2` and it appears.

## Checking your work

```bash
npm run images
```

Lists every slot: which have real photos (with dimensions and file size), which
are still placeholders, and any file that matches no slot — with the names it
could be renamed to.

```bash
npm run images -- --fix
```

Repairs what cannot fix itself:

- converts `.HEIC` / `.HEIF` / `.TIFF` / `.BMP` — the formats a phone or a
  scanner produces and no browser displays — to `.jpg`
- scales anything over 2400px down, and re-compresses anything over ~900KB
- deletes placeholder slates that a real photo has superseded

Untouched originals are copied to `image-originals/` (git-ignored) first, so
nothing is lost.

## Slot guide

Ratios and sizes below are what each slot is *shaped* for, not a rule that is
enforced — an off-ratio photo is cropped to fit rather than rejected, and
`npm run images` will tell you when that is about to happen. Shoot **larger**
than the minimum and let `next/image` downscale; do not shoot smaller, it will
look soft on phones.

Paths are referenced from `content/content.json` (garlands, packages,
essentials, decorations) or directly from a component (hero, store).

| # | Slot | Ratio | Min size | Shown where | What to shoot |
| --- | --- | --- | --- | --- | --- |
| 1 | `hero/hero-garland` | 4:5 portrait | 1200×1500 | Hero, top of page | **The make-or-break image.** One hero garland, shot close, natural light, uncluttered warm background. Also the poster for the hero video — ideally a frame lifted straight out of it. See `public/video/README.md`. |
| 2 | `garlands/premium-1` | 4:3 | 1200×900 | Garlands → Premium³ | Premium Ganpati garland, full length |
| 3 | `garlands/premium-2` | 4:3 | 1200×900 | Garlands → Premium³ | Premium rose garland, full length |
| 4 | `garlands/ganpati-1` | 4:3 | 1200×900 | Garlands → Ganpati³ | Classic Ganpati garland |
| 5 | `garlands/ganpati-2` | 4:3 | 1200×900 | Garlands → Ganpati³ | Mogra garland |
| 6 | `garlands/custom-1` | 4:3 | 1200×900 | Garlands → Custom³ | A custom commission, ideally in situ |
| 7 | `packages/pkg-1-5` | 4:3 | 1200×900 | Packages, "1.5 Days" — design 1¹ | Daily garlands laid out together so the count reads instantly |
| 8 | `packages/pkg-1-5-1` | 4:3 | 1200×900 | Packages, "1.5 Days" — design 2 | A **different** garland design offered at this duration |
| 9 | `packages/pkg-1-5-2` | 4:3 | 1200×900 | Packages, "1.5 Days" — design 3 | As above, a third design |
| 10 | `packages/pkg-1-5-3` | 4:3 | 1200×900 | Packages, "1.5 Days" — design 4 | As above, a fourth design |
| 11 | `packages/pkg-3` | 4:3 | 1200×900 | Packages, "3 Days" — design 1¹ | As above, 3 garlands |
| 12 | `packages/pkg-3-1` | 4:3 | 1200×900 | Packages, "3 Days" — design 2 | A different garland design |
| 13 | `packages/pkg-3-2` | 4:3 | 1200×900 | Packages, "3 Days" — design 3 | A different garland design |
| 14 | `packages/pkg-3-3` | 4:3 | 1200×900 | Packages, "3 Days" — design 4 | A different garland design |
| 15 | `packages/pkg-5` | 4:3 | 1200×900 | Packages, "5 Days" — design 1¹ | As above, 5 garlands |
| 16 | `packages/pkg-5-1` | 4:3 | 1200×900 | Packages, "5 Days" — design 2 | A different garland design |
| 17 | `packages/pkg-5-2` | 4:3 | 1200×900 | Packages, "5 Days" — design 3 | A different garland design |
| 18 | `packages/pkg-5-3` | 4:3 | 1200×900 | Packages, "5 Days" — design 4 | A different garland design |
| 19 | `packages/pkg-7` | 4:3 | 1200×900 | Packages, "7 Days" — design 1¹ | As above, 7 garlands |
| 20 | `packages/pkg-7-1` | 4:3 | 1200×900 | Packages, "7 Days" — design 2 | A different garland design |
| 21 | `packages/pkg-7-2` | 4:3 | 1200×900 | Packages, "7 Days" — design 3 | A different garland design |
| 22 | `packages/pkg-7-3` | 4:3 | 1200×900 | Packages, "7 Days" — design 4 | A different garland design |
| 23 | `packages/pkg-10` | 4:3 | 1200×900 | Packages, "10 Days" — design 1¹ | As above, 10 garlands |
| 24 | `packages/pkg-10-1` | 4:3 | 1200×900 | Packages, "10 Days" — design 2 | A different garland design |
| 25 | `packages/pkg-10-2` | 4:3 | 1200×900 | Packages, "10 Days" — design 3 | A different garland design |
| 26 | `packages/pkg-10-3` | 4:3 | 1200×900 | Packages, "10 Days" — design 4 | A different garland design |
| 27 | `essentials/durva` | 1:1 square | 800×800 | "Complete your Ganpati pooja" | Durva, plain background |
| 28 | `essentials/flowers` | 1:1 square | 800×800 | "Complete your Ganpati pooja" | Loose flowers |
| 29 | `essentials/kumkum` | 1:1 square | 800×800 | "Complete your Ganpati pooja" | Kumkum |
| 30 | `essentials/camphor` | 1:1 square | 800×800 | "Complete your Ganpati pooja" | Camphor |
| 31 | `essentials/agarbathi` | 1:1 square | 800×800 | "Complete your Ganpati pooja" | Agarbathi |
| 32 | `essentials/haldi` | 1:1 square | 800×800 | "Complete your Ganpati pooja" | Haldi |
| 33 | `decor/home-1` | 4:3 | 1200×900 | Decorations | A finished home Ganpati setup |
| 34 | `decor/mandap-1` | 4:3 | 1200×900 | Decorations | Mandap / backdrop work |
| 35 | `decor/chowki-1` | 4:3 | 1200×900 | Decorations | Chowki decoration |
| 36 | `decor/door-1` | 4:3 | 1200×900 | Decorations | Door / entrance flowers, toran |
| 37 | `store/store-1` | 4:3 | 1200×900 | "A real store, not a reseller" | The Chembur shopfront, signage legible |
| 38 | `store/store-2` | 4:3 | 1200×900 | "A real store, not a reseller" | Inside the store, ideally garlands being made |
| 39 | `mandal/mandal-garland-large` | 4:3 | 1200×900 | "For Ganpati Mandals & Sarvajanik / Society Ganpati" | One large garland for a mandal or sarvajanik Ganpati — **include a person for scale**, that is the whole point of the shot. A single photo, not a rail: the mandal block is the quietest on the page and a strip of images would undo that. |

¹ **Each duration package shows its four designs together** — a swipeable,
snap-scrolling strip on a phone, a grid from tablet up. The set is the `images`
list in `content/content.json` → `packages[]` (or the `images` column in the
Sheet, pipe-delimited). `pkg-N` is design 1 *and* the `image` fallback: if
`images` is ever emptied, the card quietly goes back to showing that one photo.
Shoot the designs as a set — same distance, same light — because they are seen
side by side. Fewer than four is fine; drop the paths you don't have from
`images` and only the rest render.

**Note — the Instagram section needs no photography at all.** It is a single
"Follow @handle" button linking out to the profile — no reel tiles, no embed
script, no oEmbed call. It is edited in `content/content.json` →
`instagram`: `handle`, `profileUrl`, and `enabled` (set `enabled: false` to hide
the button entirely). Anything left in `public/images/instagram/` is unused.

³ **A garland is not limited to one photo.** The table lists the *starting*
slot for each garland; the real source is the `images` list on that row —
`content/content.json` → `garlands[]`, or the pipe-delimited `images` column in
the Garlands sheet tab. **Every photo in that list becomes its own swipeable
card** in that category's carousel, carrying the same name, price and CTA, and
captioned "Design 2 of 4" so the repetition reads as intentional. Leave `images`
blank and the row falls back to its single `image` — one photo, one card,
exactly as before.

So a category shows as many cards as it has photographs, not two. To add a
sixth premium design, add a sixth path (or a pasted image URL — see below) to
that row's `images`; no slot has to be registered and no code changes. Every
category's carousel ends with a **"View our full catalog"** card that opens
`wa.me/c/<whatsappNumber>`, which is where designs that were never photographed
for the site live.

## Adding a slot that isn't listed

Point `content.json` at any path under `/images/` and drop the file in. Nothing
needs to be registered first — `npm run images:placeholders` will notice the new
path and draw a slate for it if no photo is there yet.

## Two generated files you can ignore

`.placeholders.json` here records which files are generated slates, so nothing
mistakes one for a photo. `lib/image-manifest.json` is a snapshot of this folder
written by `npm run build`, used on hosts where `public/` is served from a CDN
and cannot be read at runtime. Both are committed; neither is edited by hand.

## Using hosted image URLs instead of files

Any `https` image URL works in `content.json` or in the Google Sheet — no host
allow-list, no config change, no redeploy to add one.

Google Drive and Dropbox **share** links are rewritten to their direct-image
form automatically, because a share link serves an HTML viewer page rather than
image bytes and is the usual reason a pasted URL "doesn't work".

## Shooting notes

- **Daylight, no flash.** Flowers go flat under direct flash.
- **Uncluttered backgrounds** — a plain wall beats a busy shelf.
- Aim under ~500KB per photo; the site targets Lighthouse mobile 90+.
  `npm run images -- --fix` will get you most of the way there.
- No stock photography. Every image should be POOJYO's own work.

## Regenerating the placeholders

```bash
npm run images:placeholders
```

Draws a slate for every slot that does not have a real photo. **It will not
overwrite photography** — every slate it writes is recorded in
`.placeholders.json` with a hash, and any file that is not one of those hashes
is treated as somebody's photo and left alone. Pass `-- --force` to redraw
everything, which is the only way to lose a photo here.
