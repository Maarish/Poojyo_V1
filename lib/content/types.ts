import type { z } from "zod";
import type {
  ConfigSchema,
  ContentSchema,
  DecorationSchema,
  GarlandSchema,
  InstagramSchema,
  MandalBulkSchema,
  PackageSchema,
  PoojaItemSchema,
  ReviewSchema,
} from "./schema";

export type Config = z.infer<typeof ConfigSchema>;
export type Garland = z.infer<typeof GarlandSchema>;
export type Package = z.infer<typeof PackageSchema>;
export type PoojaItem = z.infer<typeof PoojaItemSchema>;
export type Decoration = z.infer<typeof DecorationSchema>;
export type MandalBulk = z.infer<typeof MandalBulkSchema>;
export type Instagram = z.infer<typeof InstagramSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type RawContent = z.infer<typeof ContentSchema>;

export type PriceType = Garland["priceType"];
export type GarlandCategory = Garland["category"];

/**
 * The ONLY shape the UI is allowed to consume.
 *
 * Components never touch a raw source, so swapping the backing store later
 * (Supabase -> admin panel -> adapter) needs no frontend changes.
 */
export type NormalizedContent = {
  config: Config;
  garlands: {
    premium: Garland[];
    ganpati: Garland[];
    custom: Garland[];
    all: Garland[];
  };
  /** the garland whose price is shown as the hero cue, if any */
  featuredGarland: Garland | null;
  /** sorted ascending by durationDays */
  packages: Package[];
  /** id of the package selected when the page first paints */
  defaultPackageId: string;
  poojaEssentials: PoojaItem[];
  decorations: Decoration[];
  /** null when disabled — the section is then not rendered at all */
  mandalBulk: MandalBulk | null;
  /** null when disabled or when no profile URL is set */
  instagram: Instagram | null;
  reviews: Review[];
  meta: {
    source: "json" | "sheet";
    fetchedAt: string;
    /** set when a sheet fetch failed and the JSON fallback was used instead */
    fallbackReason?: string;
  };
};
