import type { Config } from "@/lib/content/types";
import { Reveal } from "./Reveal";
import { ClockGlyph, LeafGlyph, TruckGlyph } from "./icons";

/** Calm, iconographic reassurance between the range and the upsell. */
export function DeliveryStrip({ config }: { config: Config }) {
  const items = [
    { icon: TruckGlyph, text: config.deliveryChembur },
    { icon: LeafGlyph, text: config.deliveryMumbai },
    { icon: ClockGlyph, text: config.garlandBookingNotice },
  ].filter((i) => Boolean(i.text));

  if (items.length === 0) return null;

  return (
    <section className="border-y border-line bg-surface py-12 md:py-14">
      <div className="container-page">
        <ul className="grid gap-7 sm:grid-cols-3 sm:gap-8">
          {items.map((item, i) => (
            <Reveal as="li" key={i} delay={i * 60}>
              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-sunk text-leaf">
                  <item.icon />
                </span>
                <p className="text-small text-ink-muted">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
