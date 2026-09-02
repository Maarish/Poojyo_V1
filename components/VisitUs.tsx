import type { Config } from "@/lib/content/types";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { ArrowGlyph, ClockGlyph, PinGlyph } from "./icons";

export function VisitUs({ config }: { config: Config }) {
  const hasMap = /^https?:\/\//i.test(config.mapsEmbedUrl);
  const hasDirections = /^https?:\/\//i.test(config.getDirectionsUrl);

  return (
    <Section id="visit" eyebrow="Find us" title="Visit us in Chembur">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:gap-10">
        <Reveal>
          <div className="overflow-hidden rounded-lg border border-line bg-surface-sunk">
            {hasMap ? (
              <iframe
                src={config.mapsEmbedUrl}
                title={`${config.storeName} on Google Maps`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[280px] w-full border-0 md:h-[380px]"
              />
            ) : (
              <div className="grid h-[280px] w-full place-items-center px-6 text-center md:h-[380px]">
                <p className="text-small text-ink-subtle">
                  Add <code className="font-sans">config.mapsEmbedUrl</code> to show the map here.
                </p>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div className="flex h-full flex-col gap-6">
            <div>
              <h3 className="font-display text-h3 text-ink">{config.storeName}</h3>
              {config.storeAddress && (
                <p className="mt-3 flex items-start gap-2.5 text-small text-ink-muted">
                  <PinGlyph className="mt-0.5 h-4 w-4 text-leaf" />
                  {config.storeAddress}
                </p>
              )}
              {config.storeHours && (
                <p className="mt-3 flex items-start gap-2.5 text-small text-ink-muted">
                  <ClockGlyph className="mt-0.5 h-4 w-4 text-leaf" />
                  {config.storeHours}
                </p>
              )}
            </div>

            {hasDirections ? (
              <a
                href={config.getDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary w-full sm:w-auto"
              >
                Get Directions
                <ArrowGlyph />
              </a>
            ) : (
              <span
                className="btn btn-secondary w-full cursor-not-allowed opacity-55 sm:w-auto"
                role="button"
                aria-disabled="true"
                title="Add config.getDirectionsUrl to enable this button"
              >
                Get Directions
                <ArrowGlyph />
              </span>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
