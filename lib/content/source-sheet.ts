import Papa from "papaparse";
import { SHEET_CSV_URLS, type SheetTab } from "@/lib/config";
import {
  ConfigSchema,
  DecorationSchema,
  GarlandSchema,
  MandalBulkSchema,
  PackageSchema,
  PoojaItemSchema,
  ReviewSchema,
  parseRows,
} from "./schema";
import { loadJsonContent } from "./source-json";
import type { RawContent } from "./types";

/** columns that hold a pipe-delimited list of image paths, e.g. "a.jpg|b.jpg" */
const IMAGE_LIST_COLUMNS = ["images"] as const;

type Row = Record<string, string>;

/**
 * Fetch one published tab and parse it with a real CSV parser.
 *
 * Addresses, descriptions and review text all contain commas, so `split(",")`
 * would silently shred the data. Papa Parse handles quoting, embedded newlines
 * and BOMs.
 */
async function fetchTab(tab: SheetTab): Promise<Row[]> {
  const url = SHEET_CSV_URLS[tab];
  if (!url) throw new Error(`no published CSV URL configured for tab "${tab}"`);

  const res = await fetch(url, {
    // ISR owns the caching window; don't let fetch add a second layer
    cache: "no-store",
    headers: { accept: "text/csv" },
  });
  if (!res.ok) throw new Error(`tab "${tab}" responded ${res.status}`);

  const text = await res.text();
  if (text.trimStart().startsWith("<")) {
    // Sheets serves an HTML error page when a tab is not actually published
    throw new Error(`tab "${tab}" returned HTML, not CSV — is it published to web?`);
  }

  const parsed = Papa.parse<Row>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors.length) {
    const first = parsed.errors[0];
    throw new Error(`tab "${tab}" CSV error at row ${first.row}: ${first.message}`);
  }

  return parsed.data.map(normalizeRow);
}

/**
 * Shape a raw CSV row before it reaches Zod:
 *  - trim every cell
 *  - split pipe-delimited image columns into real arrays
 *
 * This happens BEFORE validation so the array-typed fields in the schema see an
 * array rather than a string.
 */
function normalizeRow(row: Row): Row {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const trimmed = typeof value === "string" ? value.trim() : value;
    if ((IMAGE_LIST_COLUMNS as readonly string[]).includes(key)) {
      out[key] = String(trimmed ?? "")
        .split(/[|;]/)
        .map((p) => p.trim())
        .filter(Boolean);
    } else {
      out[key] = trimmed;
    }
  }
  return out as Row;
}

/** turn a two-column `key | value` tab into an object */
function keyValue(rows: Row[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const row of rows) {
    const key = (row.key ?? "").trim();
    if (key) out[key] = (row.value ?? "").trim();
  }
  return out;
}

/**
 * Load every tab. Any failure throws, and `adapter.ts` falls back to the
 * committed JSON — a half-loaded page is worse than a slightly stale one.
 */
export async function loadSheetContent(): Promise<RawContent> {
  const [
    configRows,
    garlandRows,
    packageRows,
    poojaRows,
    decorRows,
    reviewRows,
    mandalRows,
  ] = await Promise.all([
    fetchTab("config"),
    fetchTab("garlands"),
    fetchTab("packages"),
    fetchTab("poojaEssentials"),
    fetchTab("decorations"),
    fetchTab("reviews"),
    fetchTab("mandalBulk"),
  ]);

  return {
    config: ConfigSchema.parse(keyValue(configRows)),
    garlands: parseRows(GarlandSchema, garlandRows, "Garlands"),
    packages: parseRows(PackageSchema, packageRows, "Packages"),
    poojaEssentials: parseRows(PoojaItemSchema, poojaRows, "PoojaEssentials"),
    decorations: parseRows(DecorationSchema, decorRows, "Decorations"),
    reviews: parseRows(ReviewSchema, reviewRows, "Reviews"),
    mandalBulk: MandalBulkSchema.parse(keyValue(mandalRows)),

    /**
     * Deliberately not a sheet tab.
     *
     * A reel tile needs a cover image committed to `public/images/instagram/`,
     * so adding one is a deploy either way — exactly like the hero and store
     * photos, which are likewise not editable from the sheet. Reading the block
     * from the committed JSON keeps one source of truth for it and stops the
     * section from silently vanishing when `CONTENT_SOURCE=sheet`.
     */
    instagram: loadJsonContent().instagram,
  };
}
