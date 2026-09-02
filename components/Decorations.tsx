import type { Config, Decoration } from "@/lib/content/types";
import { AutoRail } from "./AutoRail";
import { MediaFrame } from "./MediaFrame";
import { PriceTag } from "./PriceTag";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { WhatsAppButton } from "./WhatsAppButton";
import { ClockGlyph } from "./icons";

/** Decoration work — every CTA here is a quote, per the CTA rule. */
export function Decorations({
  decorations,
  config,
}: {
  decorations: Decoration[];
  config: Config;
}) {
  if (decorations.length === 0) return null;

  return (
    <Section
      id="decorations"
      eyebrow="Decoration"
      title="Ganpati decorations"
      intro="Flower décor, mandap backdrops, chowki and entrance work — shared as a quote after we see your space."
    >
      <AutoRail ariaLabel="Ganpati decorations — swipe for more">
        {decorations.map((decoration, i) => (
          <Reveal as="li" key={decoration.id} delay={i * 60}>
            <article className="card flex h-full flex-col overflow-hidden">
              <MediaFrame
                src={decoration.image}
                alt={decoration.name}
                ratio="4/3"
                rounded="md"
                sizes="(min-width: 768px) 30vw, 78vw"
                className="!rounded-b-none"
              />
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-h3 text-ink">{decoration.name}</h3>
                {decoration.description && (
                  <p className="mt-2 text-small text-ink-muted">{decoration.description}</p>
                )}
                <div className="mt-4">
                  <PriceTag priceType={decoration.priceType} price={decoration.price} />
                </div>
                {decoration.availability && (
                  <p className="mt-2 text-small text-ink-subtle">{decoration.availability}</p>
                )}
                <WhatsAppButton
                  whatsappNumber={config.whatsappNumber}
                  context={{ kind: "decoration", decoration }}
                  ctaType="quote"
                  itemType="decoration"
                  itemId={decoration.id}
                  variant="secondary"
                  size="sm"
                  fullWidth
                  className="mt-5"
                />
              </div>
            </article>
          </Reveal>
        ))}
      </AutoRail>

      {config.decorationDeadline && (
        <Reveal delay={120}>
          <p className="mt-9 inline-flex items-center gap-2.5 rounded-md border border-gold/50 bg-gold-soft px-4 py-3 text-small font-medium text-ink">
            <ClockGlyph className="h-4 w-4 text-ink-muted" />
            Decoration pre-booking closes {config.decorationDeadline}
          </p>
        </Reveal>
      )}
    </Section>
  );
}
