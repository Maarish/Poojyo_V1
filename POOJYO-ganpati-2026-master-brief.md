# POOJYO Ganpati 2026 — Master Build Brief (for Claude Code)

> **How to use this file:** Start a fresh project, drop this file in the repo root, and tell Claude Code: *"Read POOJYO-ganpati-2026-master-brief.md and follow it. Before writing any code, propose the file tree, the Zod schema, and the design tokens, then wait for my approval."* This file is self-contained — no other document is required.

---

## 0. What we are building (one line)

A **fast, premium, mobile-first, single-page conversion landing page** at route `/ganpati` for **POOJYO**, a Chembur (Mumbai) premium flower-garland business selling for Ganpati 2026. The site is a **conversion tool**, not a store. Orders happen over **WhatsApp only**.

**Business goal:** premium garland enquiries via WhatsApp → multi-day garland package bookings → pooja-essentials upsell → decoration quote leads. Optimize for premium feel, trust, and actual WhatsApp orders — not e-commerce completeness.

---

## 1. Non-negotiable guardrails (apply everywhere)

- **Do NOT invent** prices, discounts, package totals, savings, reviews, ratings, or delivery promises. Use the placeholder tokens exactly as written (`₹XXX`, `[RATING]`, `[DEADLINE]`, etc.).
- **WhatsApp is the only ordering channel.** No cart, no checkout, no login, no accounts, no website form of any kind, no payment gateway.
- **No internal operations on the site** (no Porter/Rapido, cold-calling, pandal sales process, vendor/commission details, ad strategy).
- No large generic pooja catalog, no live Google-reviews integration, no inventory system in V1.
- Everything is **data-driven** — never hardcode product/price/text inside components.

---

## 2. Tech stack (do not substitute)

Next.js (App Router) · TypeScript · Tailwind CSS · Zod · deploy to Vercel. WhatsApp deep links (`wa.me`), Google Maps embed. Parse Google Sheet CSV with a real CSV parser (e.g. Papa Parse). Analytics via GA4 (gtag) + Meta Pixel, both optional through env vars. Use `next/font` for fonts and `next/image` for images. Keep client JS minimal.

---

## 3. Design system & UI direction — PREMIUM, PHOTO-FORWARD, CALM

The single most important quality bar: **this must feel like a boutique/artisan florist, not a cheap marketplace.** Premium garlands sell on emotion and trust; the design carries that. Generous whitespace, beautiful photography, restrained color, refined type. Centralize everything below as **design tokens** (Tailwind theme + CSS variables) so a non-developer change is one place.

**Feel:** premium, warm, festive-but-refined, sacred-modern, uncluttered, confident. Let the flower photography be the hero — the UI is a quiet frame around it.

**Color (POOJYO brand — from the logo; keep as tokens):**
- Background: warm ivory / cream (e.g. `#FBF7F0`)
- Text / ink: deep warm charcoal-brown (e.g. `#241C17`)
- **Primary (CTAs, active pill): deep magenta `#701A3D`** — the premium, grounded brand tone
- **Primary-bright / hover & small accents: `#9E1B51`** — the lighter brand magenta
- **Gold accent: `#C19A6B`** — used sparingly for the ★ rating, savings badge, and the stacked-logo ring only (this replaces marigold)
- Support: muted leaf green (e.g. `#3E5B45`) for delivery/trust icons; hairline borders in a soft warm grey
- **WhatsApp green (`#25D366`) stays a glyph only** inside a magenta button — never a full green button.
- One accent per surface. Never fill the page with color — magenta and gold are seasoning, whitespace and photography are the meal. Do NOT make the page loud; the two magentas + gold must read premium, not carnival.

**Brand logo (attached / in `public/`):**
- POOJYO has a real logo (lotus icon + `poojyo` wordmark) — **use the actual logo assets, do not redraw or invent a logo.** Three placements:
  - **Header (navbar):** lotus icon beside the `poojyo` wordmark, horizontal, fitting a sticky header ~60–80px tall. Responsive on mobile and desktop.
  - **Favicon:** the **lotus icon only**, 32×32 (`app/icon` / favicon).
  - **Hero & Footer:** the **centered stacked** lockup (lotus on top, `poojyo` below) enclosed in a **subtle gold (`#C19A6B`) ring**.
- Put the source logo files in `public/brand/` (e.g. `logo-horizontal.svg`, `logo-stacked.svg`, `lotus-icon.svg`) and reference them; note in the images README which files these are so they can be swapped for final exports.
- Derive the magenta/gold tokens above from the logo so the whole page stays consistent with it.

**Typography (2 fonts max, via `next/font`):**
- Headings/display: a refined serif that reads premium & warm (**Fraunces** default; Cormorant Garamond is an alternative). Use for hero, section titles, prices. Should sit harmoniously with the logo's wordmark.
- Body/UI: a clean, legible sans (**Inter** default).
- Limit weights (e.g. serif 400/600, sans 400/500/600). Body min 16px on mobile. Strong type hierarchy; large, confident section headings.

**Surfaces & depth:**
- Rounded corners: medium (e.g. 12–16px on cards, pill/rounded-full on CTAs and selector chips).
- Soft, low, warm shadows (not harsh black). Hairline borders for structure. Avoid heavy gradients and glossy effects.
- Consistent 4/8px spacing scale; generous vertical rhythm between sections (breathing room = premium).

**Motion (tasteful, light):**
- Subtle fade/slide-up reveals on scroll (IntersectionObserver + CSS, or a light animation lib — keep bundle small).
- Gentle press/tap states on buttons and cards. No parallax gimmicks, no autoplay noise.
- **Always respect `prefers-reduced-motion`.** Motion must never hurt Core Web Vitals.

**Imagery:**
- Real premium garland/decoration/store photography is the make-or-break asset. Build clean, clearly-named placeholder slots in `public/images/` with a README noting exactly which to replace. Use consistent aspect ratios, tasteful rounded framing, and `next/image` with proper `sizes`. Never ship stock-looking or low-res images.

---

## 4. Mobile-first UX rules (the majority of traffic is one-handed mobile)

- **Design at ~375–430px first**, then scale up. Test the mobile layout as the primary layout.
- **Thumb zone:** a persistent **sticky bottom bar** with the primary **Order on WhatsApp** button (dominant) + **Call** — always reachable with the thumb, honoring safe-area insets (notch / home indicator). It must not cover key content (pad the page bottom).
- **Tap targets** minimum ~48px tall; comfortable spacing so nothing is mis-tapped.
- **Minimal typing** — the whole model is tap → WhatsApp. No inputs on the page.
- **Prices and key info legible without pinch-zoom.** Short, scannable copy. Big, clear price display.
- **Duration selector** = large tappable segmented pills (1.5 / 3 / 5 / 7 / 10 days), easy to hit, clearly showing the selected state.
- **Galleries** (garland range, decorations) = horizontal, snap-scrolling carousels on mobile; grid on larger screens.
- **Performance:** optimized/lazy-loaded images, minimal JS, no layout shift. Target Lighthouse mobile performance 90+ and good CWV. Speed is part of "premium" on mobile.
- **Accessibility:** semantic HTML, visible focus states, sufficient contrast, alt text.

---

## 5. Page section order for `/ganpati` (top → bottom, with design intent)

1. **Header (sticky top, ~60–80px):** horizontal logo (lotus icon + `poojyo` wordmark) left, a compact `WhatsApp` action right. Slim, premium, responsive; subtle shadow/hairline on scroll. Does not crowd the hero.
2. **Sticky contact bar** (persistent, mobile-thumb): `Order on WhatsApp` (primary, magenta with WhatsApp glyph) + `Call`. Refined, not garish.
3. **Hero** — centered stacked logo in a subtle gold ring at the top, premium garland value prop (`tagline` / `heroSubtext`), a large real hero image, a featured garland price cue, primary `Order on WhatsApp`, a reassurance line (`garlandBookingNotice` + delivery), and a small gold `★ {googleRating} on Google ({googleReviewCount})` cue linking to `googleProfileUrl`. Value visible immediately — do NOT gate the page behind the selector. Editorial, spacious, photo-led.
4. **Duration packages** (conversion engine) — heading "How many days is your Ganpati at home?", segmented-pill selector from `packages` (active pill in magenta), then the selected package card: garland count, regular vs package price, gold savings badge, Chembur free-delivery note, `garlandBookingNotice`, `Order on WhatsApp` (package pre-fill). Make the savings feel like a premium offer, not a discount-store banner.
5. **Premium garland range** — cards grouped as Premium / Ganpati / Custom, each with a `PriceTag` and the correct CTA. Swipeable on mobile.
6. **Delivery & timing strip** — `deliveryChembur`, `deliveryMumbai`, `garlandBookingNotice`. Calm, reassuring, iconographic (leaf-green icons).
7. **Complete your Ganpati pooja** (essentials upsell) — a compact set of `poojaEssentials` as elegant chips/cards (Durva, flowers, kumkum, camphor, agarbathi…), copy: "Add your pooja essentials to the same order on WhatsApp." Not a catalog.
8. **Ganpati decorations** — swipeable gallery of real decoration work, decoration types, `PriceTag`, `Get Quote on WhatsApp` (decoration pre-fill), and a clear **pre-booking deadline** line from `config.decorationDeadline`.
9. **Trust strip** — real store photos, `storeAddress`, gold `★ rating` + count, 2–3 `reviews` as clean cards.
10. **Visit us** — `mapsEmbedUrl` embed, `Get Directions` button (`getDirectionsUrl`), `storeHours`.
11. **Mandals / bulk** — single, visually secondary CTA from `mandalBulk` (only if `enabled`).
12. **Footer** — centered stacked logo in a gold ring, brand, contact, hours, address, WhatsApp/Call links.

**CTA rule:** two types only — **Order on WhatsApp** (garlands/packages with fixed/starting price) and **Get Quote on WhatsApp** (custom garland, all decoration, mandal/bulk). `Call` uses `tel:` with `config.phoneNumber`.

---

## 6. Content model (entities & fields)

**config** (single object / key-value): `brandName`, `tagline`, `heroSubtext`, `whatsappNumber` (digits only, e.g. `91XXXXXXXXXX`), `phoneNumber`, `googleRating`, `googleReviewCount`, `googleProfileUrl`, `storeName`, `storeAddress`, `storeHours`, `mapsEmbedUrl`, `getDirectionsUrl`, `garlandBookingNotice` ("Premium garlands — please book at least 1 day in advance"), `deliveryChembur`, `deliveryMumbai`, `decorationDeadline` (e.g. `12 September 2026`), `festivalBanner` (optional).

**garland** — `id`, `category` (`premium` | `ganpati` | `custom`), `name`, `description`, `image`, `images[]?`, `priceType` (`fixed` | `starting` | `quote`), `price` (blank for quote), `availability`, `featured`, `whatsappMessageOverride?`.

**package** — `id`, `durationLabel` (e.g. `5 Days`, `1.5 Days`), `durationDays` (number, supports `1.5`), `garlandCount`, `image`, `regularTotal`, `packagePrice`, `savingsText`, `eligibilityText`, `deliveryBenefit`, `availability`, `featured`.

**poojaItem** — `id`, `name`, `price?`, `image?`, `note?` (keep small).

**decoration** — `id`, `name`, `type` (flower / home / mandap-backdrop / chowki / door-entrance / custom), `priceType` (`fixed` | `starting` | `quote`), `price?`, `description`, `image`, `images[]?`, `availability`.

**mandalBulk** (config-level) — `enabled`, `ctaLabel`, `blurb`, `whatsappMessage`.

**review** — `name`, `text`, `stars`.

**Rendering rules:** `PriceTag` renders `fixed` → `₹XXX`; `starting` → `Starting from ₹XXX`; `quote` → `Get Quote`. Duration list is fully data-driven (1.5 / 3 / 5 / 7 / 10 and any others); render `1.5` correctly, never rounded/hardcoded.

---

## 7. Google Sheet schema (non-developer editable)

One Google Sheet, each tab published to web as CSV (File → Share → Publish to web → per sheet → CSV). Same schema as the JSON. Placeholders until real values exist.

- **`Config`** — two columns `key | value`, one row per config field above.
- **`Garlands`** — `id | category | name | description | image | priceType | price | availability | featured | whatsappMessageOverride`
- **`Packages`** — `id | durationLabel | durationDays | garlandCount | image | regularTotal | packagePrice | savingsText | eligibilityText | deliveryBenefit | availability | featured` (include rows for 1.5, 3, 5, 7, 10; first `durationDays` = `1.5`)
- **`PoojaEssentials`** — `id | name | price | image | note`
- **`Decorations`** — `id | name | type | priceType | price | description | image | availability`
- **`Reviews`** — `name | text | stars`
- **`MandalBulk`** — `key | value` (enabled, ctaLabel, blurb, whatsappMessage)

`lib/config.ts` holds **one published-CSV URL per tab** (each tab has its own `gid`), not a single sheet URL.

---

## 8. `content.json` schema (committed fallback + default source)

```json
{
  "config": {
    "brandName": "POOJYO",
    "tagline": "Premium Ganpati Flower Garlands, delivered across Mumbai",
    "heroSubtext": "Fresh, handcrafted garlands for your Ganpati at home",
    "whatsappNumber": "91XXXXXXXXXX",
    "phoneNumber": "91XXXXXXXXXX",
    "googleRating": "[RATING]",
    "googleReviewCount": "[COUNT]",
    "googleProfileUrl": "[URL]",
    "storeName": "POOJYO",
    "storeAddress": "[Chembur store address]",
    "storeHours": "[hours]",
    "mapsEmbedUrl": "[Google Maps embed URL]",
    "getDirectionsUrl": "[Google Maps directions URL]",
    "garlandBookingNotice": "Premium garlands — please book at least 1 day in advance",
    "deliveryChembur": "Free delivery within Chembur on eligible package orders",
    "deliveryMumbai": "Mumbai-wide delivery available. Charges may apply outside Chembur.",
    "decorationDeadline": "12 September 2026",
    "festivalBanner": ""
  },
  "garlands": [
    {
      "id": "premium-marigold", "category": "premium", "name": "Premium Ganpati Garland",
      "description": "[short premium description]", "image": "images/garlands/premium-1.jpg",
      "priceType": "fixed", "price": "₹XXX", "availability": "Made to order",
      "featured": true, "whatsappMessageOverride": ""
    },
    {
      "id": "custom-garland", "category": "custom", "name": "Custom Garland",
      "description": "[custom garland description]", "image": "images/garlands/custom-1.jpg",
      "priceType": "quote", "price": "", "availability": "Made to order", "featured": false
    }
  ],
  "packages": [
    {
      "id": "pkg-1-5", "durationLabel": "1.5 Days", "durationDays": 1.5, "garlandCount": "[N]",
      "image": "images/packages/pkg-1-5.jpg", "regularTotal": "₹XXXX", "packagePrice": "₹XXXX",
      "savingsText": "You save ₹XXX", "eligibilityText": "[eligibility]",
      "deliveryBenefit": "Free delivery within Chembur", "availability": "Made to order", "featured": false
    }
  ],
  "poojaEssentials": [
    { "id": "durva", "name": "Durva", "price": "", "image": "", "note": "" }
  ],
  "decorations": [
    {
      "id": "home-decor", "name": "Home Ganpati Decoration", "type": "home",
      "priceType": "quote", "price": "", "description": "[description]",
      "image": "images/decor/home-1.jpg", "availability": "Pre-booking required"
    }
  ],
  "mandalBulk": {
    "enabled": true,
    "ctaLabel": "For Ganpati Mandals / Bulk Orders — Contact Us",
    "blurb": "Large garlands, pooja items & bulk festival orders.",
    "whatsappMessage": "Hi POOJYO 🙏 I'd like a bulk / mandal quote. Mandal name: ___. Items: ___. Quantity/duration: ___. Area/Pincode: ___. Preferred date: ___."
  },
  "reviews": [
    { "name": "[name]", "text": "[genuine review]", "stars": 5 }
  ]
}
```

---

## 9. WhatsApp message templates (per journey)

Build links as `https://wa.me/<whatsappNumber>?text=<encodeURIComponent(message)>`, injecting item name/price.

**Premium / Ganpati garland (Order):**
```
Hi POOJYO 🙏 I'd like to order: {GARLAND NAME} ({PRICE}).
Area/Pincode: ______
Preferred delivery date: ______
Would also like to add pooja essentials? (yes/no)
Please confirm availability & total.
```
**Multi-day package (Order):**
```
Hi POOJYO 🙏 I'd like to book the {DURATION} Premium Garland Package ({garlandCount} garlands).
Package price shown: {PACKAGE PRICE}
Area/Pincode: ______
Ganpati start date: ______
Deliver a fresh garland each day? (yes/no)
Add pooja essentials to the same order? (yes/no)
Please confirm availability & final total.
```
**Custom garland (Get Quote):**
```
Hi POOJYO 🙏 I'd like a quote for a Custom Garland.
Flowers/colours preferred: ______
Size/length: ______
Area/Pincode: ______
Preferred date: ______
Please share options & pricing.
```
**Pooja essentials add-on:**
```
Hi POOJYO 🙏 Along with my garland order I'd like to add pooja essentials: ______ (e.g. durva, flowers, kumkum, camphor, agarbathi).
Area/Pincode: ______
Preferred date: ______
```
**Custom decoration (Get Quote):**
```
Hi POOJYO 🙏 I'd like a custom Ganpati decoration quote. I'll share reference photos here.
Decoration type: ______
Area/Pincode: ______
Preferred date: ______
Approx. size/space: ______
Requirement: ______
Please share available options & quotation.
```
**Mandal / bulk:** use `mandalBulk.whatsappMessage`.

**Generic hero / sticky-bar button:**
```
Hi POOJYO 🙏 I'd like to place a Ganpati garland order.
```

**Attribution ref (append to EVERY message):** a single compact line so enquiries can be attributed inside the chat with no backend, built from item id + captured UTM:
```
— Ref: {itemId} | {utm_source}/{utm_campaign}
```
Use `direct` when UTM is absent (e.g. `— Ref: pkg-5 | fb/ganpati-garland-aug`). Informational for POOJYO, not a question for the customer.

---

## 10. Analytics & attribution (lightweight — V1 only)

Goal: answer "₹X ad spend → X WhatsApp enquiries → X orders → ₹X sales." Not a dashboard. Must work with no IDs set.
- **Capture UTM params** (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) on landing in `lib/utm.ts`, persist for the session (`sessionStorage`), expose to every button (for the event + the ref line).
- **Single `track(event, params)` helper** (`lib/analytics.ts`) firing to GA4 (`gtag`) and Meta Pixel when their env IDs are set, no-op otherwise. Fire Meta Pixel `Lead`/`Contact` on WhatsApp clicks.
- **Events** (each with current UTM): `whatsapp_click` (`cta_type` order|quote, `item_type` garland|package|pooja_essential|decoration|mandal_bulk|generic, `item_id`); `package_select` (`duration_label`, `item_id`); `call_click`.
- IDs via env: `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID` (document in README). No cookie-heavy setup in V1.

---

## 11. Project structure

```
poojyo-ganpati/
  app/
    layout.tsx
    page.tsx                 // redirect to /ganpati or render landing
    ganpati/page.tsx         // the landing page (ISR: export const revalidate)
  components/
    StickyContactBar.tsx  Hero.tsx  DurationPackages.tsx  GarlandRange.tsx
    DeliveryStrip.tsx  PoojaEssentials.tsx  Decorations.tsx  TrustStrip.tsx
    VisitUs.tsx  MandalBulkCTA.tsx  Footer.tsx
    WhatsAppButton.tsx       // wa.me link + appends attribution ref + fires analytics
    PriceTag.tsx  Reveal.tsx // Reveal = reduced-motion-aware scroll animation wrapper
  lib/
    content/ schema.ts  types.ts  normalize.ts  source-json.ts  source-sheet.ts  adapter.ts
    whatsapp.ts  analytics.ts  utm.ts  config.ts
  content/ content.json
  public/ images/            // placeholder images + README on what to replace
  app/globals.css            // design tokens (CSS vars) + Tailwind base
  next.config.ts             // images.remotePatterns for remote Sheet image URLs
  tailwind.config.ts         // theme tokens: colors, fonts, radius, shadow, spacing
  README.md
```

**Content adapter behavior:** `adapter.ts` reads `CONTENT_SOURCE` (`json` | `sheet`); if `sheet`, fetch each tab's CSV, parse with a real CSV parser (addresses/descriptions contain commas — never `split(',')`), validate with Zod, `normalize`; **on any error, fall back to `content.json`**. The page uses **ISR** so the Sheet drives content without slowing the hot path. The UI consumes only **normalized content**, never a raw source — so a later migration to `Supabase → Admin Panel → Content Adapter → Next.js` needs no frontend rewrite.

---

## 12. Deliverables

1. Complete Next.js + TS + Tailwind app matching this brief, with the premium mobile-first design system fully applied (tokens centralized).
2. `content/content.json` populated with placeholder data across all entities.
3. Zod schemas + content adapter (per-tab Google Sheet CSV source with real parser, JSON fallback), source switch in `lib/config.ts`.
4. `lib/utm.ts` + `lib/analytics.ts` wired into every WhatsApp/Call button and the package selector (no-op when IDs unset).
5. `README.md` covering: editing `content.json`; publishing the Google Sheet per-tab as CSV and switching `CONTENT_SOURCE`; that **Sheet edits appear only after the ISR `revalidate` window, not instantly**; setting WhatsApp/phone numbers; setting `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_META_PIXEL_ID`; replacing images; changing design tokens (colors/fonts); and deploying to Vercel.

---

## 13. Build process (do this in order)

**Before writing any code, propose:** (a) the file tree, (b) the Zod schema, and (c) the design tokens (color palette, font choices, radius/shadow/spacing scale) as a short preview — then **wait for approval.** After approval, build the content layer + tokens first, then the sections top-to-bottom, checking the mobile layout at each step. Keep all money/reviews/ratings as placeholders throughout.
