import { z } from "zod";

/* ---------------------------------------------------------------------------
 * Coercion helpers.
 *
 * Every cell that arrives from a published Google Sheet CSV is a string, and a
 * non-technical editor will leave cells blank. So the schema coerces rather
 * than rejects: a single empty cell must never collapse the whole fetch back to
 * the JSON fallback.
 * ------------------------------------------------------------------------- */

const str = z.string().trim();
const optStr = z.string().trim().optional().default("");

/** "TRUE" | "true" | "1" | "yes" | true -> boolean */
const csvBool = z
  .preprocess((v) => {
    if (typeof v === "boolean") return v;
    const s = String(v ?? "").trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes" || s === "y";
  }, z.boolean())
  .default(false);

/** "1.5" -> 1.5, blank -> 0 (sorting only; never displayed) */
const csvNum = z
  .preprocess((v) => {
    if (typeof v === "number") return v;
    const s = String(v ?? "").trim();
    if (!s) return 0;
    const n = Number(s.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }, z.number().finite())
  .default(0);

/** accepts a real array, or a pipe/comma separated string of image paths */
const imageList = z
  .preprocess((v) => {
    if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean);
    const s = String(v ?? "").trim();
    if (!s) return [];
    return s
      .split(/[|;]/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, z.array(z.string()))
  .default([]);

const PriceType = z.enum(["fixed", "starting", "quote"]).catch("quote");

/* ---------------------------------------------------------------------------
 * Phone numbers
 *
 * These ship as placeholders ("91XXXXXXXXXX") until POOJYO's real numbers are
 * filled in. A strict `\d+` rule would hard-fail the build on the placeholder,
 * so the schema accepts any non-empty string and only warns. `lib/whatsapp.ts`
 * separately refuses to build a wa.me link out of a placeholder.
 * ------------------------------------------------------------------------- */

const PLACEHOLDER = /x{4,}/i;

/** true when the value looks like a real, dialable number rather than a stand-in */
export function isRealPhoneNumber(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return !PLACEHOLDER.test(value) && digits.length >= 8 && digits.length <= 15;
}

const phoneLike = (field: string) =>
  str.default("").superRefine((value, ctx) => {
    if (!value) {
      warnOnce(`config.${field} is empty — WhatsApp/Call buttons will be disabled.`);
      return;
    }
    if (!isRealPhoneNumber(value)) {
      warnOnce(
        `config.${field} is "${value}", which is still a placeholder. ` +
          `The site will build, but the button stays disabled until a real number is set.`
      );
    }
    // deliberately never ctx.addIssue() — placeholders must not fail the build
    void ctx;
  });

const warned = new Set<string>();
function warnOnce(message: string) {
  if (warned.has(message)) return;
  warned.add(message);
  // eslint-disable-next-line no-console
  console.warn(`[poojyo/content] ${message}`);
}

/* ---------------------------------------------------------------------------
 * Entities
 * ------------------------------------------------------------------------- */

export const ConfigSchema = z.object({
  brandName: str.default("POOJYO"),
  tagline: optStr,
  heroSubtext: optStr,
  /**
   * The seasonal line in the hero's pill badge, e.g.
   * "Ganpati 2026 · Booking Open". Blank falls back to `festivalBanner`, so a
   * sheet that only ever used that row still gets one seasonal line rather than
   * two — and the badge disappears entirely when both are empty.
   */
  heroBadge: optStr,
  /**
   * The hero film and its still, both optional.
   *
   * Blank means "use the shipped path", so the sheet only ever has to carry
   * these rows when the clip lives somewhere else. `lib/images.ts` resolves both
   * forgivingly, so `/video/hero-garland.mp4` finds a file saved as
   * `Hero Garland.MP4` — and the hero falls back to the poster alone whenever
   * no video is on disk at all.
   */
  heroVideo: optStr,
  heroVideoPoster: optStr,
  whatsappNumber: phoneLike("whatsappNumber"),
  phoneNumber: phoneLike("phoneNumber"),
  googleRating: optStr,
  googleReviewCount: optStr,
  googleProfileUrl: optStr,
  storeName: optStr,
  storeAddress: optStr,
  storeHours: optStr,
  mapsEmbedUrl: optStr,
  getDirectionsUrl: optStr,
  garlandBookingNotice: optStr,
  deliveryChembur: optStr,
  deliveryMumbai: optStr,
  decorationDeadline: optStr,
  festivalBanner: optStr,
});

export const GarlandSchema = z.object({
  id: str.min(1),
  category: z.enum(["premium", "ganpati", "custom"]).catch("premium"),
  name: str.min(1),
  description: optStr,
  image: optStr,
  images: imageList,
  priceType: PriceType,
  price: optStr, // "₹XXX" — always a string, never arithmetic
  availability: optStr,
  featured: csvBool,
  whatsappMessageOverride: optStr,
});

export const PackageSchema = z.object({
  id: str.min(1),
  durationLabel: str.min(1), // "1.5 Days" — rendered verbatim, never recomputed
  durationDays: csvNum,      // used only for ordering
  garlandCount: optStr,
  /** the single legacy shot — still the fallback whenever `images` is empty */
  image: optStr,
  /** the package's garland designs; from the Sheet, `a.jpg|b.jpg|c.jpg` */
  images: imageList,
  regularTotal: optStr,
  packagePrice: optStr,
  savingsText: optStr,
  eligibilityText: optStr,
  deliveryBenefit: optStr,
  availability: optStr,
  featured: csvBool,
});

export const PoojaItemSchema = z.object({
  id: str.min(1),
  name: str.min(1),
  price: optStr,
  image: optStr,
  note: optStr,
});

export const DecorationSchema = z.object({
  id: str.min(1),
  name: str.min(1),
  type: z
    .enum(["flower", "home", "mandap-backdrop", "chowki", "door-entrance", "custom"])
    .catch("custom"),
  priceType: PriceType,
  price: optStr,
  description: optStr,
  image: optStr,
  images: imageList,
  availability: optStr,
});

export const MandalBulkSchema = z.object({
  enabled: csvBool,
  ctaLabel: optStr,
  blurb: optStr,
  whatsappMessage: optStr,
  /**
   * Proof-of-work shots for the mandal pitch. This tab is key/value, so from the
   * Sheet the cell reads `/images/mandal/bulk-1.jpg|/images/mandal/bulk-2.jpg`;
   * `imageList` splits it. At most two are rendered.
   */
  images: imageList,
});

/**
 * Instagram is a link, not a gallery.
 *
 * There is no `reels` list any more: the section is one outbound button, and
 * `profileUrl` is the only field it needs. A `reels` array left over in an old
 * `content.json` is simply ignored — this schema is not strict, so removing the
 * field cannot break a document that still carries it.
 */
export const InstagramSchema = z.object({
  enabled: csvBool,
  handle: optStr,       // "poojyo_in", rendered with the @ prefix
  profileUrl: optStr,
});

export const ReviewSchema = z.object({
  name: str.min(1),
  text: optStr,
  stars: z
    .preprocess((v) => {
      const n = Number(String(v ?? "").trim());
      return Number.isFinite(n) && n >= 1 && n <= 5 ? Math.round(n) : 5;
    }, z.number().int().min(1).max(5))
    .catch(5),
});

export const ContentSchema = z.object({
  config: ConfigSchema,
  garlands: z.array(GarlandSchema).default([]),
  packages: z.array(PackageSchema).default([]),
  poojaEssentials: z.array(PoojaItemSchema).default([]),
  decorations: z.array(DecorationSchema).default([]),
  mandalBulk: MandalBulkSchema,
  reviews: z.array(ReviewSchema).default([]),
  /**
   * Optional so the committed JSON and a Sheet that predates this section both
   * still parse — an absent block simply renders nothing.
   */
  instagram: InstagramSchema.default({ enabled: false, handle: "", profileUrl: "" }),
});

/**
 * Rows come from a spreadsheet where a trailing blank line is normal. Parse each
 * row on its own so one malformed row is skipped instead of discarding the tab.
 */
export function parseRows<T extends z.ZodTypeAny>(
  schema: T,
  rows: unknown[],
  label: string
): z.infer<T>[] {
  const out: z.infer<T>[] = [];
  rows.forEach((row, i) => {
    const result = schema.safeParse(row);
    if (result.success) {
      out.push(result.data);
    } else {
      warnOnce(`${label} row ${i + 2} skipped: ${result.error.issues[0]?.message ?? "invalid"}`);
    }
  });
  return out;
}
