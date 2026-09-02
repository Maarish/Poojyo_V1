import type { NormalizedContent } from "@/lib/content/types";
import { resolveImage, resolveVideo } from "@/lib/images";
import { HeroVideo } from "./HeroVideo";
import { PriceTag } from "./PriceTag";
import { RatingCue } from "./RatingCue";
import { Reveal } from "./Reveal";
import { WhatsAppButton } from "./WhatsAppButton";
import { WhatsAppCatalogButton } from "./WhatsAppCatalogButton";
import { LeafGlyph, TruckGlyph } from "./icons";

/**
 * Where the hero film and its still live when the sheet says nothing.
 *
 * Both are overridable from the Config tab (`heroVideo`, `heroVideoPoster`), so
 * these are the paths to drop files at, not the only paths that work. Neither
 * has to exist: a missing video leaves the poster, a missing poster leaves the
 * frame's calm slate, and the hero is correct either way.
 */
const HERO_VIDEO = "/video/hero-garland.mp4";
const HERO_POSTER = "/images/hero/hero-garland.jpg";

/**
 * One centred column, mobile-first: seasonal pill, film, serif headline,
 * subtext, price, then both CTAs — all of it above the fold on a phone.
 *
 * That last constraint is what shapes the whole component. The stack is a flex
 * column pinned to `100svh - --header-h` (the header is `sticky top-0`, so it
 * is exactly what the hero does not get), every text row is `shrink-0`, and the
 * *film* is the one `flex-1` element. So the video is not a fixed size at all —
 * it is the space left over once the badge, headline, subtext, price and both
 * buttons have taken theirs, with its 4:5 ratio deriving the width from that
 * height. A 375x667 phone gets a smaller frame than a 375x812 one and both show
 * every CTA without scrolling, which a hardcoded height cannot do: it would
 * either overflow the short phone or waste the tall one. It also self-corrects
 * when the sheet copy changes — a headline that wraps to five lines simply
 * takes 40px from the film instead of pushing a button under the fold.
 *
 * `svh` (not `vh`) because on mobile Safari `vh` is the *largest* viewport, the
 * one you only get after the URL bar has collapsed — sizing to it puts the
 * second CTA under the browser chrome on load, which is precisely the bug this
 * layout exists to avoid.
 *
 * The reassurance tail sits outside that container on purpose: it belongs below
 * the fold, and inside the flex column it would compete with the film for the
 * space that makes the film worth having.
 *
 * The palette is the site's own tokens and nothing else. Gold appears twice, as
 * a hairline: the pill's tint and the frame's ring. The only saturated fill is
 * the magenta primary CTA, and the only green is the WhatsApp glyph inside it.
 */
export function Hero({ content }: { content: NormalizedContent }) {
  const { config, featuredGarland } = content;

  // One seasonal line, never two: the pill is the only place it renders now, so
  // a sheet that has only ever filled in `festivalBanner` still gets a badge.
  const badge = config.heroBadge || config.festivalBanner;

  const videoSrc = resolveVideo(config.heroVideo || HERO_VIDEO);
  const posterSrc = resolveImage(config.heroVideoPoster || HERO_POSTER);

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="container-page">
        {/* `immediate` on every row: the hero is the one thing on the page that
            is always above the fold, so it must not wait for hydration to
            become visible — see the prop's note in Reveal. */}
        {/*
          Padding is kept deliberately tight on mobile. Every pixel spent here
          is a pixel taken off the film: the column is pinned to the viewport,
          the text rows are all `shrink-0`, so the video is whatever is left.
          `md:` restores normal breathing room, where there is no such contest.
        */}
        <div className="mx-auto flex min-h-[calc(100svh-var(--header-h))] max-w-2xl flex-col items-center pb-3 pt-2 text-center md:min-h-0 md:pb-0 md:pt-12">
          {badge && (
            <Reveal immediate className="shrink-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-gold/45 bg-gold-soft px-3.5 py-1.5 text-label font-semibold text-primary">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
                {badge}
              </p>
            </Reveal>
          )}

          {/* The flexible one. The explicit `min-h` is load-bearing twice over:
              a flex item defaults to `min-height: auto` and so refuses to shrink
              below its content, which would push the CTAs off the bottom of a
              short phone — and a floor of 0 would let the frame vanish entirely
              in landscape below md, where the leftover space goes negative. At
              7rem the column simply grows past 100svh instead, which is the
              right trade: a scroll beats a disappeared hero. */}
          <div className="flex w-full min-h-[7rem] flex-1 items-stretch justify-center py-2 md:min-h-0 md:flex-none md:py-0 md:items-center">
            {/*
              `items-stretch` above and no `h-full` here, and that pairing is
              load-bearing rather than stylistic.

              This wrapper used to carry `h-full`. A percentage height only
              resolves against a *definite* containing block, and this one's
              height comes from `flex-1` — so Chrome treated it as indefinite,
              fell back to `auto`, and every `h-full` below it became circular:
              the wrapper sized to the frame, the frame sized to the wrapper,
              and the whole thing collapsed to its own padding. The video was
              playing the entire time inside a box 0px wide.

              `align-self: stretch` produces a *used* height instead of a
              percentage, so there is nothing to resolve and nothing to
              collapse — and the `h-full` on HeroVideo below now has a definite
              parent to measure against.
            */}
            <Reveal immediate className="flex min-h-0 w-full justify-center">
              <HeroVideo
                src={videoSrc}
                poster={posterSrc}
                alt="A POOJYO premium fresh Ganpati flower garland"
                sizes="(min-width: 768px) 320px, 60vw"
                priority
                className="aspect-[4/5] h-full w-auto max-w-full md:aspect-auto md:h-auto md:w-[20rem]"
              />
            </Reveal>
          </div>

          <Reveal immediate className="shrink-0">
            <h1 className="text-display font-display text-ink">{config.tagline}</h1>
          </Reveal>

          {config.heroSubtext && (
            <Reveal immediate className="shrink-0">
              <p className="mt-2.5 max-w-prose text-lead text-ink-muted md:mt-4">
                {config.heroSubtext}
              </p>
            </Reveal>
          )}

          {featuredGarland && featuredGarland.priceType !== "quote" && (
            <Reveal immediate className="shrink-0">
              <div className="mt-3 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 md:mt-4">
                <span className="text-small text-ink-subtle">{featuredGarland.name}</span>
                <PriceTag
                  priceType={featuredGarland.priceType}
                  price={featuredGarland.price}
                  size="lg"
                />
              </div>
            </Reveal>
          )}

          {/* Stacked, full width, primary first. On a phone these are the two
              things the whole page exists for, and a side-by-side pair would
              halve both tap targets to make room for each other. */}
          <Reveal immediate className="w-full shrink-0">
            <div className="mx-auto mt-4 flex w-full max-w-sm flex-col gap-2.5 md:mt-7 md:gap-3">
              <WhatsAppButton
                whatsappNumber={config.whatsappNumber}
                context={{ kind: "generic" }}
                ctaType="order"
                itemType="generic"
                itemId="hero"
                fullWidth
              />
              <WhatsAppCatalogButton
                whatsappNumber={config.whatsappNumber}
                placement="hero"
                label="Browse Catalog"
                variant="outline"
                className="w-full"
              />
            </div>
          </Reveal>
        </div>

        {/* Below the fold by design: the rating, the booking lead time and the
            delivery promise answer the questions someone asks *after* deciding,
            not before. */}
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 pb-2 pt-8 text-center md:pt-10">
          <RatingCue config={config} />

          <ul className="flex flex-col items-start gap-2.5 text-left text-small text-ink-muted sm:flex-row sm:justify-center sm:gap-7">
            {config.garlandBookingNotice && (
              <li className="flex items-start gap-2.5">
                <LeafGlyph className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                <span>{config.garlandBookingNotice}</span>
              </li>
            )}
            {config.deliveryChembur && (
              <li className="flex items-start gap-2.5">
                <TruckGlyph className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                <span>{config.deliveryChembur}</span>
              </li>
            )}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
