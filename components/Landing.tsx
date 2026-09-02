import type { NormalizedContent } from "@/lib/content/types";
import { Decorations } from "./Decorations";
import { DeliveryStrip } from "./DeliveryStrip";
import { DurationPackages } from "./DurationPackages";
import { Footer } from "./Footer";
import { GarlandRange } from "./GarlandRange";
import { Hero } from "./Hero";
import { InstagramFollow } from "./InstagramFollow";
import { MandalBulkCTA } from "./MandalBulkCTA";
import { PoojaEssentials } from "./PoojaEssentials";
import { StickyContactBar } from "./StickyContactBar";
import { StickyHeader } from "./StickyHeader";
import { TrustStrip } from "./TrustStrip";
import { VisitUs } from "./VisitUs";

/**
 * Section order for /ganpati, top to bottom.
 * Shared by `/` and `/ganpati` so the two routes can never drift apart.
 */
export function Landing({ content }: { content: NormalizedContent }) {
  const { config } = content;

  return (
    <>
      <StickyHeader config={config} instagramUrl={content.instagram?.profileUrl} />

      <main>
        <Hero content={content} />

        <DurationPackages
          packages={content.packages}
          defaultPackageId={content.defaultPackageId}
          config={config}
        />

        <GarlandRange garlands={content.garlands} config={config} />

        <DeliveryStrip config={config} />

        <PoojaEssentials items={content.poojaEssentials} config={config} />

        <Decorations decorations={content.decorations} config={config} />

        {content.instagram && <InstagramFollow instagram={content.instagram} />}

        <TrustStrip config={config} reviews={content.reviews} />

        <VisitUs config={config} />

        {content.mandalBulk && (
          <MandalBulkCTA mandalBulk={content.mandalBulk} config={config} />
        )}
      </main>

      <Footer config={config} />

      <StickyContactBar config={config} />
    </>
  );
}
