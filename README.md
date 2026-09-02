# POOJYO — Ganpati 2026 landing page

A fast, premium, mobile-first conversion page for POOJYO's Ganpati 2026 garland
business. Orders happen on **WhatsApp only** — there is no cart, no checkout, no
accounts and no forms anywhere on the site.

Built with Next.js (App Router) · TypeScript · Tailwind CSS · Zod, deployed to
Vercel.

- Canonical route: **`/ganpati`**
- `/` serves the same page via a rewrite (no redirect hop for ad traffic), and
  the canonical tag points every crawler at `/ganpati`.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck
```

---

## 1. Editing content

All copy, prices and products live in **`content/content.json`**. Nothing is
hardcoded in a component, so a text or price change never needs a developer.

```
content/content.json
├── config            single object — brand, contact, store, delivery notices
├── garlands[]        category: premium | ganpati | custom
├── packages[]        the duration ladder (1.5 / 3 / 5 / 7 / 10 …)
├── poojaEssentials[] the upsell chips
├── decorations[]     decoration types
├── mandalBulk        set enabled:false to hide the section entirely
└── reviews[]         2–3 real reviews
```

### Rules that matter

- **Prices are strings, always.** `"₹XXX"`, `"₹XXXX"` and `"[N]"` are
  placeholders that pass through untouched — the site never does arithmetic on
  money, so it can never invent a total or a saving.
- **`durationLabel` is what visitors see; `durationDays` only sorts.** That is
  why `"1.5 Days"` renders exactly as typed and is never rounded to 2.
- `priceType` drives the price display and the CTA:

  | `priceType` | Shows | CTA |
  | --- | --- | --- |
  | `fixed` | `₹XXX` | Order on WhatsApp |
  | `starting` | `Starting from ₹XXX` | Order on WhatsApp |
  | `quote` | `Get Quote` | Get Quote on WhatsApp |

- `featured: true` on a garland picks the hero price cue; on a package it picks
  which pill is selected when the page loads.

---

## 2. Setting the WhatsApp and phone numbers

In `content/content.json`:

```json
"whatsappNumber": "919876543210",   // digits only, with country code, no +
"phoneNumber": "919876543210"
```

Until these hold real numbers, **every WhatsApp and Call button renders
disabled** rather than linking to a dead chat. The build still succeeds and logs
a warning — it never fails on a placeholder.

---

## 3. Editing content from a Google Sheet instead

The site can read from a Google Sheet so a non-developer can update it without
touching the repo.

### Publish each tab

Every tab is published **separately** — one CSV URL per tab, each with its own
`gid`. There is no single URL that returns the whole sheet.

1. In Google Sheets: **File → Share → Publish to web**
2. Choose the **individual tab** (not "Entire document")
3. Choose **Comma-separated values (.csv)**
4. **Publish**, and copy the URL
5. Repeat for all eight tabs

### Tab schema

| Tab | Columns |
| --- | --- |
| `Config` | `key \| value` — one row per config field. `heroVideo` and `heroVideoPoster` are optional; blank uses the shipped paths (see §5) |
| `Garlands` | `id \| category \| name \| description \| image \| images \| priceType \| price \| availability \| featured \| whatsappMessageOverride` |
| `Packages` | `id \| durationLabel \| durationDays \| garlandCount \| image \| images \| regularTotal \| packagePrice \| savingsText \| eligibilityText \| deliveryBenefit \| availability \| featured` |
| `PoojaEssentials` | `id \| name \| price \| image \| note` |
| `Decorations` | `id \| name \| type \| priceType \| price \| description \| image \| images \| availability` |
| `Reviews` | `name \| text \| stars` |
| `MandalBulk` | `key \| value` — `enabled`, `ctaLabel`, `blurb`, `whatsappMessage`, `images` |

Notes:
- The `images` column takes several paths separated by `|`, e.g.
  `a.jpg|b.jpg`. They are split into a list before validation.
- On `Packages`, `images` is the 3–4 garland designs shown in that package's
  card (swipeable on mobile, a grid above it). Leave it blank and the card falls
  back to the single `image`, exactly as before.
- On `Garlands`, `images` is **every photo of that garland**. Each one becomes
  its own slide in the category's carousel, so a row with four photos shows four
  cards. Blank falls back to the single `image` — one photo, one card, exactly
  as before. Each category's carousel always ends with a "View our full catalog"
  card linking to `wa.me/c/<whatsappNumber>`.
- `MandalBulk` is the **single large community Ganpati** — a mandal, or a
  building/society sarvajanik — where one organiser orders mandal-scale
  garlands, bulk pooja essentials and decoration together. `whatsappMessage` may
  be left blank; a built-in template with the same blanks is used instead.
- Every tab is required once `CONTENT_SOURCE=sheet`. If any one of them fails,
  the site falls back to `content/content.json` wholesale rather than rendering
  half a page.
- `featured` accepts `TRUE`, `true`, `1` or `yes`.
- Commas inside addresses, descriptions and reviews are safe — the CSV is read
  with a real parser (Papa Parse), not `split(",")`.

### Switch the source over

```bash
CONTENT_SOURCE=sheet
SHEET_CSV_CONFIG=https://docs.google.com/.../pub?gid=0&single=true&output=csv
SHEET_CSV_GARLANDS=...
SHEET_CSV_PACKAGES=...
SHEET_CSV_POOJA_ESSENTIALS=...
SHEET_CSV_DECORATIONS=...
SHEET_CSV_REVIEWS=...
SHEET_CSV_MANDAL_BULK=...
```

### ⚠️ Sheet edits are NOT instant

The page is served with **ISR**, so a sheet edit appears only after the
revalidate window has elapsed — currently **15 minutes**. To change it, edit the
literal in `app/ganpati/page.tsx`:

```ts
export const revalidate = 900; // seconds
```

This cannot be an environment variable: Next reads the value statically at build
time.

### If the sheet breaks, the site does not

Any failure — network error, an unpublished tab, malformed CSV, a schema
mismatch — is caught and the page falls back to the committed
`content/content.json`, logging the reason. A stale page always beats a broken
one. Individual bad rows are skipped rather than discarding the whole tab.

---

## 4. Analytics

Both providers are optional. With no IDs set, **no analytics script is loaded at
all** and `track()` is a silent no-op.

```bash
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=1234567890
```

### Events

| Event | Fired when | Params |
| --- | --- | --- |
| `whatsapp_click` | any WhatsApp CTA | `cta_type` (order/quote), `item_type`, `item_id` |
| `package_select` | a duration pill is tapped | `duration_label`, `item_id` |
| `call_click` | the Call button | — |

Every event also carries the session's UTM params. On Meta Pixel, WhatsApp taps
fire `Lead` (quote) or `Contact` (order).

### Attribution without a backend

UTM params (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`,
`utm_term`) are captured on landing and kept in `sessionStorage`. Every WhatsApp
message then ends with a single compact line:

```
— Ref: pkg-5 | fb/ganpati-garland-aug
```

`direct` is used when there are no UTM params. This lets each enquiry be
attributed **inside the chat itself**, with no database — enough to answer
"₹X ad spend → X enquiries → X orders".

---

## 5. Images

Every photo slot lives in `public/images/`, currently filled with calm
placeholder slates. **`public/images/README.md` lists every file, its aspect
ratio, its minimum size and what to shoot.**

Real photography is the make-or-break asset here — the hero image most of all.

To use hosted image URLs instead of committed files, add the host to
`images.remotePatterns` in `next.config.ts`.

### The hero video

The hero shows a muted, looping film of a fresh garland. Drop it at
**`public/video/hero-garland.mp4`** — H.264 mp4, 4:5 portrait, 6–12 seconds, no
audio track, **under 3 MB**. `public/video/README.md` has the FFmpeg recipe.

One clip, shown as a single centred frame at every width. On mobile its size is
not fixed: the hero is pinned to `100svh - --header-h` and the video takes the
space left over once the badge, headline, subtext, price and both CTAs have
taken theirs, so every CTA stays above the fold on a 375px screen whatever the
sheet copy says. Compose the shot close — it reads at roughly 200–290px tall.

The still underneath it is the existing `public/images/hero/hero-garland.jpg`;
use a frame from the video so there is no jump when playback starts. Both paths
are overridable from the `Config` tab (`heroVideo`, `heroVideoPoster`) without a
deploy.

The poster is not a fallback that swaps in — it is what renders first, always,
and the video fades in over it only once it is really playing. A missing file,
`prefers-reduced-motion`, Data Saver, or a browser that refuses autoplay all
leave the visitor on the poster. The video is not even mounted until the page
has finished loading, so it can never delay the LCP image, the fonts or the CTA.

---

## 6. Brand assets

The real POOJYO logo assets are in `public/brand/`, cut from the supplied brand
sheet. See `public/brand/README.md` — it also explains how to swap in vector
originals when they exist.

Every logo on the site renders through **`components/Logo.tsx`**, so changing
the file paths there updates the header, the hero, and the footer at once.

---

## 7. Changing the design (colours, fonts, spacing)

Every design decision is a token, defined in **one** place:
**`app/globals.css`**, under `:root`. `tailwind.config.ts` only aliases those
variables, so it rarely needs editing.

### Colours

| Token | Value | Used for |
| --- | --- | --- |
| `--bg` | `#FBF7F0` | page background (warm ivory) |
| `--surface` | `#FFFFFF` | cards, sticky bars |
| `--surface-sunk` | `#F5EFE5` | alternating bands |
| `--ink` | `#241C17` | headings and body |
| `--ink-muted` / `--ink-subtle` | `#6B5D53` / `#9A8B7E` | secondary text |
| `--line` | `#E8DFD2` | hairline borders |
| `--primary` | `#701A3D` | **deep magenta** — CTAs, active pill |
| `--primary-hover` | `#9E1B51` | hover and small accents |
| `--gold` | `#C19A6B` | ★ rating, savings badge, logo ring — **nothing else** |
| `--leaf` | `#3E5B45` | delivery / reassurance icons |
| `--whatsapp` | `#25D366` | the WhatsApp glyph only |

Two rules keep it premium: **one accent per surface**, and **WhatsApp green is
never a button fill** — it stays a glyph inside a magenta button.

### Type

Two families via `next/font`: **Fraunces** (display — hero, section titles,
prices) and **Inter** (body/UI). Body is 16px minimum on mobile. To change
either, edit the imports at the top of `app/layout.tsx`.

### Shape, depth, rhythm

Radii `8/12/16/24px` with pill CTAs; warm low shadows (never harsh black);
a 4/8px spacing scale with `--section-y` controlling the space between sections.
Widen that one value and the whole page breathes more.

### Motion

Scroll reveals run through `components/Reveal.tsx` and are wrapped in
`prefers-reduced-motion: no-preference`. When a visitor asks for reduced motion,
the observer is never created and content renders in its final state.

**Auto-advancing carousels** — `components/useAutoScroll.ts`, used by
`AutoRail` (premium / Ganpati / custom garlands, decorations) and by
`PackageGallery` (multi-day packages). It nudges the browser's own `scrollLeft`
along every 3.4 s with an eased 700 ms glide, and sweeps back to the first slide
at the end. No library, no cloned slides, no transformed track: a real swipe,
the snap points and the accessibility semantics are all still the browser's.

It stops itself whenever motion would be wrong — `prefers-reduced-motion`
(watched live, so the rails become ordinary manual carousels the moment the OS
setting changes), the rail being off screen or the tab hidden, and touch, drag,
wheel, keyboard or focus (5 s) or hover (until the pointer leaves). It also
stops when there is nothing to scroll, which is what confines it to mobile: both
rails are a CSS grid from `md` up, where `scrollWidth === clientWidth`, so no
media query has to be kept in sync with the stylesheet.

The hero video is separate — see `components/HeroVideo.tsx`.

---

## 8. Architecture

```
app/
  layout.tsx           fonts, metadata, canonical, analytics, UTM capture
  ganpati/page.tsx     the landing page (ISR)
  globals.css          ← all design tokens
  icon.png             favicon (lotus mark)
components/            one file per section, plus WhatsAppButton / PriceTag / Reveal
lib/
  content/
    schema.ts          Zod — coercing and source-tolerant
    normalize.ts       grouping, sorting, derived defaults
    source-json.ts     the committed fallback
    source-sheet.ts    per-tab CSV fetch + parse
    adapter.ts         getContent() — the single entry point
  whatsapp.ts          message templates + wa.me builder
  analytics.ts         track()
  utm.ts               capture + attribution ref
  config.ts            source switch, sheet URLs, env IDs
content/content.json
public/brand/          real logo assets
public/images/         photography slots
```

The UI only ever consumes **normalized content** (`NormalizedContent`), never a
raw source. Migrating later to `Supabase → admin panel → adapter` means writing
one new source file — no frontend rewrite.

---

## 9. Deploying to Vercel

1. Push the repo to GitHub.
2. In Vercel: **New Project → import the repo**. The framework is detected
   automatically; no build settings need changing.
3. Add environment variables (**Settings → Environment Variables**). All are
   optional — see `.env.example`:
   - `NEXT_PUBLIC_SITE_URL` — your real domain, so canonical/OG/sitemap URLs are
     correct
   - `CONTENT_SOURCE` + the `SHEET_CSV_*` URLs, if using the sheet
   - `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`
4. Deploy, then point the domain at it.

After changing an env var, **redeploy** — env vars are read at build time.

---

## 10. What this site deliberately does not do

No cart, checkout, login, payment gateway, or form of any kind. No live Google
Reviews integration, no inventory, no generic pooja catalogue. No prices,
ratings, savings, reviews or delivery promises are invented anywhere — every
such value is a placeholder until POOJYO fills in the real one.
