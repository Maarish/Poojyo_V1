import type { Config, Review } from "@/lib/content/types";
import { resolveImage } from "@/lib/images";
import { MediaFrame } from "./MediaFrame";
import { RatingCue } from "./RatingCue";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { StarGlyph, PinGlyph } from "./icons";

/** Real store photos, the address, the rating cue, and a few review cards. */
export function TrustStrip({ config, reviews }: { config: Config; reviews: Review[] }) {
  return (
    <Section id="trust" tone="sunk" eyebrow="Chembur, Mumbai" title="A real store, not a reseller">
      <div className="grid gap-8 md:grid-cols-2 md:gap-10">
        <Reveal>
          <MediaFrame
            src={resolveImage("/images/store/store-1.jpg")}
            alt={`${config.storeName} store front in Chembur`}
            ratio="4/3"
            sizes="(min-width: 768px) 46vw, 100vw"
          />
        </Reveal>
        <Reveal delay={60}>
          <MediaFrame
            src={resolveImage("/images/store/store-2.jpg")}
            alt={`Inside ${config.storeName}`}
            ratio="4/3"
            sizes="(min-width: 768px) 46vw, 100vw"
          />
        </Reveal>
      </div>

      <Reveal delay={100}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {config.storeAddress && (
            <p className="flex items-start gap-2.5 text-small text-ink-muted">
              <PinGlyph className="mt-0.5 h-4 w-4 text-leaf" />
              {config.storeAddress}
            </p>
          )}
          <RatingCue config={config} />
        </div>
      </Reveal>

      {reviews.length > 0 && (
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {reviews.slice(0, 3).map((review, i) => (
            <Reveal as="li" key={`${review.name}-${i}`} delay={i * 60}>
              <figure className="card h-full p-6">
                <div className="flex gap-0.5" aria-label={`${review.stars} out of 5 stars`}>
                  {Array.from({ length: review.stars }).map((_, s) => (
                    <StarGlyph key={s} className="h-3.5 w-3.5 text-gold" />
                  ))}
                </div>
                {review.text && (
                  <blockquote className="mt-4 text-small text-ink-muted">
                    &ldquo;{review.text}&rdquo;
                  </blockquote>
                )}
                <figcaption className="mt-4 text-small font-semibold text-ink">
                  {review.name}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      )}
    </Section>
  );
}
