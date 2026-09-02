import raw from "@/content/content.json";
import { ContentSchema } from "./schema";
import type { RawContent } from "./types";

/**
 * The committed fallback, and the default source.
 *
 * This is imported statically rather than read from disk so it is bundled at
 * build time and works on any deployment target, including edge runtimes.
 */
export function loadJsonContent(): RawContent {
  return ContentSchema.parse(raw);
}
