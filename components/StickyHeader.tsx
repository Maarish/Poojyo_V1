import type { Config } from "@/lib/content/types";
import { InstagramGlyph } from "./icons";
import { LogoHorizontal } from "./Logo";
import { WhatsAppButton } from "./WhatsAppButton";
import { WhatsAppCatalogButton } from "./WhatsAppCatalogButton";

/**
 * Persistent brand header: horizontal lockup left, WhatsApp action right.
 *
 * Height sits at 64px on mobile / 76px from md up (--header-h), inside the
 * 60–80px brand spec, and it stays translucent-white so the ivory page reads
 * through without the bar ever feeling heavy.
 */
export function StickyHeader({
  config,
  homeHref = "#top",
  instagramUrl,
}: {
  config: Config;
  /**
   * Where the logo goes. Defaults to the in-page anchor the landing page uses;
   * the legal pages pass "/" because there is nothing above them to scroll to.
   */
  homeHref?: string;
  /**
   * The profile link, from the content source rather than written in here — so
   * it cannot drift from the Instagram section's own link. Omitted (or blank)
   * renders no button at all.
   */
  instagramUrl?: string;
}) {
  return (
    <header className="safe-x sticky top-0 z-40 border-b border-line bg-surface/90 shadow-header backdrop-blur-md">
      <div className="container-page flex h-header-h items-center justify-between gap-4">
        <a
          href={homeHref}
          // -my-1 lets the link reach the 48px tap floor without making the
          // bar itself any taller
          className="-my-1 flex min-h-tap shrink-0 items-center rounded-sm py-1"
          aria-label={`${config.brandName} — home`}
        >
          <LogoHorizontal priority />
        </a>

        {/* After a 143px logo, a 375px bar has ~180px left — enough for one
            labelled pill, not two. On mobile that slot goes to the catalog,
            because "Order on WhatsApp" is already fixed in the thumb zone by
            StickyContactBar; from md that bar drops away, so the header takes
            both and the order CTA comes back as the dominant one. */}
        <div className="flex min-w-0 items-center gap-3">
          <WhatsAppCatalogButton
            whatsappNumber={config.whatsappNumber}
            placement="header"
            label="Catalog"
            variant="secondary"
            size="sm"
            className="px-3.5 md:hidden"
          />
          <WhatsAppCatalogButton
            whatsappNumber={config.whatsappNumber}
            placement="header"
            label="Browse catalog"
            variant="secondary"
            size="sm"
            className="hidden md:inline-flex"
          />
          {/*
            Icon-only and 48x48 on a phone, a labelled pill from md up where
            there is room. One anchor rather than a hidden/visible pair, so the
            same URL is never in the DOM twice.

            No `track()` call, matching InstagramFollow: these are links to
            another origin, which GA4 enhanced measurement already records as an
            outbound `click`. A custom event would double-count them and add a
            fourth event to a spec that is deliberately three.
          */}
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="POOJYO on Instagram"
              /*
                Hidden below 360px, and only there. A 320px bar has 280px of
                content width; the logo (139) + a 48px tap target + the Catalog
                pill (118) + gaps needs 329. Something has to give, and of those
                four the Instagram button is the one that is neither the brand
                mark, an existing CTA, nor the accessible tap floor. Those
                visitors still reach the profile from the Instagram section.
              */
              className="btn btn-secondary btn-sm w-12 shrink-0 px-0 max-[359px]:hidden md:w-auto md:px-4"
            >
              <InstagramGlyph />
              <span className="hidden md:inline">Instagram</span>
            </a>
          )}

          <WhatsAppButton
            whatsappNumber={config.whatsappNumber}
            context={{ kind: "generic" }}
            ctaType="order"
            itemType="generic"
            itemId="header"
            size="sm"
            className="hidden md:inline-flex"
          />
        </div>
      </div>
    </header>
  );
}
