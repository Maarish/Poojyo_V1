/**
 * Content source switch + one published-CSV URL per Google Sheet tab.
 *
 * Each tab is published separately (File -> Share -> Publish to web -> pick the
 * tab -> CSV), so each has its own `gid` and therefore its own URL. There is no
 * single "sheet URL" that yields every tab as CSV.
 */

export type SheetTab =
  | "config"
  | "garlands"
  | "packages"
  | "poojaEssentials"
  | "decorations"
  | "reviews"
  | "mandalBulk";

export const CONTENT_SOURCE: "json" | "sheet" =
  process.env.CONTENT_SOURCE === "sheet" ? "sheet" : "json";

/*
 * The ISR window lives in `app/ganpati/page.tsx` as `export const revalidate`.
 * Next reads that value statically, so it cannot be configured from here or
 * from an env var — change the literal in that file.
 */

export const SHEET_CSV_URLS: Record<SheetTab, string> = {
  config: process.env.SHEET_CSV_CONFIG ?? "",
  garlands: process.env.SHEET_CSV_GARLANDS ?? "",
  packages: process.env.SHEET_CSV_PACKAGES ?? "",
  poojaEssentials: process.env.SHEET_CSV_POOJA_ESSENTIALS ?? "",
  decorations: process.env.SHEET_CSV_DECORATIONS ?? "",
  reviews: process.env.SHEET_CSV_REVIEWS ?? "",
  mandalBulk: process.env.SHEET_CSV_MANDAL_BULK ?? "",
};

/** analytics IDs — unset means the scripts never load and track() no-ops */
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "";
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

/** used until the real domain is configured; never a hard failure */
const FALLBACK_SITE_URL = "https://poojyo.in";

/**
 * Canonical origin for `metadataBase`, OG image URLs, the sitemap and robots.
 *
 * Deliberately defensive, because this value is read at module scope in
 * `app/layout.tsx` — anything it returns that `new URL()` rejects does not
 * degrade a page, it fails the entire build before a single route is rendered.
 * Two ways that used to happen, both of them ordinary dashboard mistakes:
 *
 *  - **The variable exists but is blank.** `??` only catches `undefined`, so an
 *    env var added in a host's UI with an empty value sailed through and became
 *    `new URL("")` -> ERR_INVALID_URL. This is the one that broke the first
 *    Vercel deploy.
 *  - **A bare domain.** `poojyo.com` with no scheme is not a valid URL either;
 *    it is now upgraded to `https://` rather than rejected, since that is
 *    unambiguously what was meant.
 *
 * Anything still unparseable falls back and says so in the build log, so the
 * site ships with visibly wrong canonical URLs instead of not shipping at all.
 */
function resolveSiteUrl(): string {
  let raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (!raw) return FALLBACK_SITE_URL;

  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;

  try {
    return new URL(raw).toString().replace(/\/$/, "");
  } catch {
    // eslint-disable-next-line no-console
    console.warn(
      `[poojyo/config] NEXT_PUBLIC_SITE_URL is "${process.env.NEXT_PUBLIC_SITE_URL}", ` +
        `which is not a usable URL. Falling back to ${FALLBACK_SITE_URL} — canonical, ` +
        `OG and sitemap URLs will be wrong until this is fixed.`
    );
    return FALLBACK_SITE_URL;
  }
}

export const SITE_URL = resolveSiteUrl();

/** the canonical route for the landing page; `/` renders the same content */
export const CANONICAL_PATH = "/ganpati";
