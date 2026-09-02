import type { Config, Garland, GarlandCategory } from "@/lib/content/types";
import { AutoRail } from "./AutoRail";
import { MediaFrame } from "./MediaFrame";
import { PriceTag } from "./PriceTag";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { WhatsAppButton } from "./WhatsAppButton";
import { WhatsAppCatalogButton } from "./WhatsAppCatalogButton";

const GROUP_TITLES: Record<GarlandCategory, string> = {
  premium: "Premium garlands",
  ganpati: "Ganpati garlands",
  custom: "Custom garlands",
};

/** what the catalog card promises at the end of each rail */
const GROUP_CATALOG_LINE: Record<GarlandCategory, string> = {
  premium: "Every premium garland we make — photos and prices, on WhatsApp.",
  ganpati: "Every Ganpati garland we make — photos and prices, on WhatsApp.",
  custom: "Past custom work, plus everything else we make, on WhatsApp.",
};

/** one rail slide: a single photograph, and the garland it belongs to */
type Shot = {
  garland: Garland;
  src: string;
  /** 0-based position within that garland's own photos */
  index: number;
  /** how many photos that garland has */
  total: number;
};

/**
 * Flatten a category into one slide per photograph.
 *
 * `images` — pipe-delimited in the Garlands tab, e.g. `a.jpg|b.jpg|c.jpg` — is
 * the source of truth. A row that still carries only the legacy single `image`
 * contributes exactly one slide, so nothing regresses when the column is blank.
 */
function shotsFor(items: Garland[]): Shot[] {
  return items.flatMap((garland) => {
    const listed = garland.images.filter(Boolean);
    const shots = listed.length > 0 ? listed : [garland.image];
    return shots.map((src, index) => ({ garland, src, index, total: shots.length }));
  });
}

/**
 * The range, grouped Premium / Ganpati / Custom.
 *
 * Every photograph in a category is a slide — swipeable rail on mobile,
 * three-up grid from md, see `.rail` in globals.css. The last slide in each
 * group is always the WhatsApp catalog card, because the rails show what we
 * have photographed and the catalog is where the rest lives.
 */
export function GarlandRange({
  garlands,
  config,
}: {
  garlands: { premium: Garland[]; ganpati: Garland[]; custom: Garland[] };
  config: Config;
}) {
  const groups = (["premium", "ganpati", "custom"] as const)
    .map((key) => ({ key, shots: shotsFor(garlands[key]) }))
    .filter((g) => g.shots.length > 0);

  if (groups.length === 0) return null;

  return (
    <Section
      id="garlands"
      eyebrow="Our range"
      title="Premium garlands, made to order"
      intro="Handcrafted fresh for your Ganpati — choose a style, and we'll confirm everything on WhatsApp."
    >
      <div className="space-y-12 md:space-y-16">
        {groups.map((group) => (
          <div key={group.key}>
            <h3 className="mb-5 font-display text-h3 text-ink">{GROUP_TITLES[group.key]}</h3>
            <AutoRail ariaLabel={`${GROUP_TITLES[group.key]} — swipe for more`}>
              {group.shots.map((shot, i) => (
                <Reveal as="li" key={`${shot.garland.id}-${shot.index}`} delay={i * 60}>
                  <GarlandCard shot={shot} config={config} />
                </Reveal>
              ))}

              {/* always last, in every group — the end of the swipe is the
                  moment someone has run out of designs to look at */}
              <Reveal as="li" delay={group.shots.length * 60}>
                <CatalogCard category={group.key} config={config} />
              </Reveal>
            </AutoRail>
          </div>
        ))}
      </div>

      {/* The rails show a curated few; the catalog is where the rest lives. */}
      <Reveal delay={80}>
        <div className="mt-12 rounded-lg border border-line bg-surface p-6 text-center md:mt-14 md:p-7">
          <p className="text-small text-ink-muted">
            This is a selection — every garland, price and photo is on our WhatsApp catalog.
          </p>
          <WhatsAppCatalogButton
            whatsappNumber={config.whatsappNumber}
            placement="garland-range"
            className="mt-5 w-full sm:w-auto"
          />
        </div>
      </Reveal>
    </Section>
  );
}

function GarlandCard({ shot, config }: { shot: Shot; config: Config }) {
  const { garland, src, index, total } = shot;
  const isQuote = garland.priceType === "quote";
  const alt = total > 1 ? `${garland.name} — design ${index + 1} of ${total}` : garland.name;

  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <MediaFrame
        src={src}
        alt={alt}
        ratio="4/3"
        rounded="md"
        sizes="(min-width: 768px) 30vw, 78vw"
        className="!rounded-b-none"
      />

      <div className="flex flex-1 flex-col p-5">
        <h4 className="font-display text-h3 text-ink">{garland.name}</h4>

        {/* Repeats of the same garland are deliberate — each photo is a real
            design. The counter is what stops the repetition reading as a bug. */}
        {total > 1 && (
          <p className="mt-1 text-meta text-ink-subtle">
            Design {index + 1} of {total}
          </p>
        )}

        {garland.description && (
          <p className="mt-2 text-small text-ink-muted">{garland.description}</p>
        )}

        <div className="mt-4">
          <PriceTag priceType={garland.priceType} price={garland.price} />
        </div>

        {garland.availability && (
          <p className="mt-2 text-small text-ink-subtle">{garland.availability}</p>
        )}

        <WhatsAppButton
          whatsappNumber={config.whatsappNumber}
          context={{ kind: "garland", garland }}
          ctaType={isQuote ? "quote" : "order"}
          itemType="garland"
          itemId={garland.id}
          variant={isQuote ? "secondary" : "primary"}
          size="sm"
          fullWidth
          className="mt-5 self-stretch"
        />
      </div>
    </article>
  );
}

/**
 * The final slide of every rail.
 *
 * Same card silhouette as a garland so the rail's rhythm is unbroken, but
 * tinted and dashed so it reads as an exit rather than as one more product. It
 * reports the same `whatsapp_click` / `cta_type: "catalog"` event as every
 * other catalog link, with the category in `item_id`.
 */
function CatalogCard({ category, config }: { category: GarlandCategory; config: Config }) {
  return (
    <article className="card flex h-full flex-col items-center justify-center border-dashed border-line-strong bg-primary-soft p-6 text-center">
      <p className="eyebrow text-primary">More designs</p>
      <h4 className="mt-3 font-display text-h3 text-ink">View our full catalog</h4>
      <p className="mt-2 text-small text-ink-muted">{GROUP_CATALOG_LINE[category]}</p>

      <WhatsAppCatalogButton
        whatsappNumber={config.whatsappNumber}
        placement={`garland-${category}-catalog`}
        label="View our full catalog"
        size="sm"
        className="mt-6 w-full"
      />
    </article>
  );
}
