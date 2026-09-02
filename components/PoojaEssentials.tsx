import type { Config, PoojaItem } from "@/lib/content/types";
import { MediaFrame } from "./MediaFrame";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { WhatsAppButton } from "./WhatsAppButton";

/**
 * The add-on nudge — a compact set of tiles, not a catalogue.
 * One CTA adds all of it to the same WhatsApp conversation.
 *
 * Each essential carries a small square photo, because "durva" and "kumkum"
 * are far easier to recognise than to read. Items with no image still render
 * as a tile: `MediaFrame` falls back to its ivory slate, so a half-filled
 * content sheet degrades to a quieter grid rather than a broken one.
 */
export function PoojaEssentials({
  items,
  config,
}: {
  items: PoojaItem[];
  config: Config;
}) {
  if (items.length === 0) return null;

  return (
    <Section
      id="essentials"
      tone="sunk"
      eyebrow="One order, everything ready"
      title="Complete your Ganpati pooja"
      intro="Add your pooja essentials to the same order on WhatsApp."
    >
      <ul className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-6">
        {items.map((item, i) => (
          <Reveal as="li" key={item.id} delay={i * 40}>
            <MediaFrame
              src={item.image}
              alt={item.name}
              ratio="1/1"
              rounded="md"
              // 3-up on mobile, 6-up from sm — never wider than ~170px, so the
              // optimiser is never asked for a full-width source
              sizes="(min-width: 640px) 15vw, 30vw"
            />
            <p className="mt-2.5 text-small font-medium text-ink">{item.name}</p>
            {item.price && (
              <p className="font-display text-small font-semibold text-ink">{item.price}</p>
            )}
            {item.note && <p className="text-meta text-ink-subtle">{item.note}</p>}
          </Reveal>
        ))}
      </ul>

      <Reveal delay={120}>
        <WhatsAppButton
          whatsappNumber={config.whatsappNumber}
          context={{ kind: "pooja_essentials" }}
          ctaType="order"
          itemType="pooja_essential"
          itemId="pooja-essentials"
          label="Add essentials on WhatsApp"
          className="mt-10 w-full sm:w-auto"
        />
      </Reveal>
    </Section>
  );
}
