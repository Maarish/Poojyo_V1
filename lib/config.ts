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

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://poojyo.example.com").replace(
  /\/$/,
  ""
);

/** the canonical route for the landing page; `/` renders the same content */
export const CANONICAL_PATH = "/ganpati";
