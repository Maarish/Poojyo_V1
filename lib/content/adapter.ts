import { CONTENT_SOURCE } from "@/lib/config";
import { normalize } from "./normalize";
import { loadJsonContent } from "./source-json";
import { loadSheetContent } from "./source-sheet";
import type { NormalizedContent } from "./types";

/**
 * The one entry point the app uses to get content.
 *
 * Reads CONTENT_SOURCE; when it is "sheet" every tab is fetched, validated and
 * normalized. On ANY error — network, unpublished tab, malformed CSV, schema
 * mismatch — it falls back to the committed content.json, so the page always
 * renders something correct.
 */
export async function getContent(): Promise<NormalizedContent> {
  const fetchedAt = new Date().toISOString();

  if (CONTENT_SOURCE === "sheet") {
    try {
      const raw = await loadSheetContent();
      return normalize(raw, { source: "sheet", fetchedAt });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      // eslint-disable-next-line no-console
      console.warn(
        `[poojyo/content] Google Sheet load failed, falling back to content.json — ${reason}`
      );
      return normalize(loadJsonContent(), {
        source: "json",
        fetchedAt,
        fallbackReason: reason,
      });
    }
  }

  return normalize(loadJsonContent(), { source: "json", fetchedAt });
}
