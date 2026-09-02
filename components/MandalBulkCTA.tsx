import type { Config, MandalBulk } from "@/lib/content/types";
import { MediaFrame } from "./MediaFrame";
import { Reveal } from "./Reveal";
import { WhatsAppButton } from "./WhatsAppButton";

/**
 * Community Ganpati: mandals, and sarvajanik / society public Ganpati.
 *
 * One section, at the bottom of the page, and deliberately the quietest CTA on
 * it — a plain bordered card on the page surface, a secondary button, small
 * type. Everything above it is aimed at a family ordering a garland for the
 * Ganpati in their own home, and that flow must not have to share the eye with
 * this one. Renders only when `mandalBulk.enabled` is true.
 *
 * The order this covers is the single large community Ganpati a mandal, society
 * or building puts up — one organiser, garlands at mandal scale, essentials by
 * the box, and usually the decoration too. The three bullets below spell out
 * those three things, because a heading alone does not tell an organiser that
 * all of it can come from one place.
 *
 * The heading and blurb are `ctaLabel` and `blurb` from the MandalBulk sheet
 * tab, and the pre-filled enquiry is `whatsappMessage` from the same tab — all
 * three are editable without a deploy. The CTA reports as `whatsapp_click` like
 * every other WhatsApp button on the site.
 *
 * It carries one proof-of-work shot, because "garlands at that scale" is a
 * claim a mandal secretary will want to see before writing in. One, not a
 * gallery: this block is the quietest thing on the page and a strip of photos
 * would undo that. The `images` cell on the MandalBulk tab is still a list, so
 * a second path there renders a pair — but the shipped content is one.
 */
export function MandalBulkCTA({
  mandalBulk,
  config,
}: {
  mandalBulk: MandalBulk;
  config: Config;
}) {
  const images = mandalBulk.images.filter(Boolean).slice(0, 2);

  return (
    <section id="mandals" className="pb-section-y">
      <div className="container-page">
        <Reveal>
          <div className="rounded-lg border border-line bg-surface p-6 md:p-8">
            <div className="grid items-center gap-7 md:gap-10 md:[grid-template-columns:minmax(0,1fr)_minmax(0,0.8fr)]">
              <div>
                {mandalBulk.ctaLabel && (
                  <h2 className="font-display text-h3 text-ink">{mandalBulk.ctaLabel}</h2>
                )}
                {mandalBulk.blurb && (
                  <p className="mt-2 text-small text-ink-muted">{mandalBulk.blurb}</p>
                )}

                {/* What a community order is made of, in the order it is
                    usually decided. Gold dots rather than icons: this section
                    has to stay subordinate to the home-customer flow above it,
                    and three more glyphs would pull it forward. */}
                <ul className="mt-5 grid gap-2.5 text-small text-ink-muted sm:grid-cols-3">
                  {[
                    "Large garlands, made to the size your Bappa needs",
                    "Pooja essentials in bulk, for all the days",
                    "Mandap, chowki and entrance decoration",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-gold"
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                <WhatsAppButton
                  whatsappNumber={config.whatsappNumber}
                  context={{ kind: "mandal_bulk", mandalBulk }}
                  ctaType="quote"
                  itemType="mandal_bulk"
                  itemId="mandal-bulk"
                  variant="secondary"
                  size="sm"
                  className="mt-6 w-full sm:w-auto"
                />
              </div>

              {images.length > 0 && (
                <ul className={images.length > 1 ? "grid grid-cols-2 gap-3" : "grid"}>
                  {images.map((src, i) => (
                    <li key={src}>
                      <MediaFrame
                        src={src}
                        alt={
                          i === 0
                            ? "A large garland made for a mandal or sarvajanik Ganpati"
                            : "A bulk festival order being prepared"
                        }
                        ratio="4/3"
                        rounded="md"
                        // one shot fills the column; a pair splits it
                        sizes={
                          images.length > 1
                            ? "(min-width: 768px) 22vw, 45vw"
                            : "(min-width: 768px) 30vw, 90vw"
                        }
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
