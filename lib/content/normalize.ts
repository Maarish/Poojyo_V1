import { resolveContentImages } from "@/lib/images";
import type { NormalizedContent, RawContent } from "./types";

/**
 * Turns a validated source document into the single shape the UI consumes:
 * groups, sorts, and derives defaults so components stay free of logic.
 */
export function normalize(
  source: RawContent,
  meta: NormalizedContent["meta"]
): NormalizedContent {
  // Every image reference is matched against what is actually in public/images
  // before the UI ever sees it, so a photo dropped in under a different name or
  // extension still lands in its slot. See lib/images.ts.
  const raw = resolveContentImages(source);

  const all = raw.garlands.filter((g) => g.name);

  const premium = all.filter((g) => g.category === "premium");
  const ganpati = all.filter((g) => g.category === "ganpati");
  const custom = all.filter((g) => g.category === "custom");

  // hero price cue: first featured garland that actually shows a price
  const featuredGarland =
    all.find((g) => g.featured && g.priceType !== "quote") ??
    all.find((g) => g.featured) ??
    premium[0] ??
    all[0] ??
    null;

  // ascending by duration; 1.5 sorts before 3 because durationDays is a number
  const packages = [...raw.packages].sort((a, b) => a.durationDays - b.durationDays);

  // default selection: the flagged one, else the middle option — the middle of a
  // duration ladder is the most representative starting point, not the cheapest
  const defaultPackageId =
    packages.find((p) => p.featured)?.id ??
    packages[Math.floor(packages.length / 2)]?.id ??
    packages[0]?.id ??
    "";

  return {
    config: raw.config,
    garlands: { premium, ganpati, custom, all },
    featuredGarland,
    packages,
    defaultPackageId,
    poojaEssentials: raw.poojaEssentials.filter((p) => p.name),
    decorations: raw.decorations.filter((d) => d.name),
    mandalBulk: raw.mandalBulk.enabled ? raw.mandalBulk : null,
    // A profile URL is the whole requirement — the section is one link, and
    // the header button and the LocalBusiness `sameAs` both read the same value.
    instagram: raw.instagram.enabled && raw.instagram.profileUrl ? raw.instagram : null,
    reviews: raw.reviews.filter((r) => r.name),
    meta,
  };
}
