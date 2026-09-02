"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";
import type { Config, Package } from "@/lib/content/types";
import { PackageGallery } from "./PackageGallery";
import { Reveal } from "./Reveal";
import { WhatsAppButton } from "./WhatsAppButton";
import { LeafGlyph, TruckGlyph } from "./icons";

/**
 * The conversion engine.
 *
 * The duration ladder is entirely data-driven — whatever rows exist, in
 * `durationDays` order — and every label is printed verbatim, so "1.5 Days"
 * renders exactly as written and is never rounded or reconstructed.
 */
export function DurationPackages({
  packages,
  defaultPackageId,
  config,
}: {
  packages: Package[];
  defaultPackageId: string;
  config: Config;
}) {
  const [selectedId, setSelectedId] = useState(defaultPackageId);
  const selected = packages.find((p) => p.id === selectedId) ?? packages[0];

  if (!selected) return null;

  // `images` is the several-designs list; a row that predates it — or a Sheet
  // cell an editor left blank — still shows its single `image`.
  const selectedImages =
    selected.images.length > 0 ? selected.images : [selected.image];

  return (
    <section id="packages" className="border-y border-line bg-surface-sunk py-section-y">
      <div className="container-page">
        <Reveal className="max-w-prose">
          <p className="eyebrow mb-3">Multi-day packages</p>
          <h2 className="text-h2 font-display text-ink">
            How many days is your Ganpati at home?
          </h2>
        </Reveal>

        {/* segmented pills — large, obvious tap targets */}
        <Reveal delay={60}>
          <div
            role="radiogroup"
            aria-label="Package duration"
            className="mt-8 flex flex-wrap gap-2.5"
          >
            {packages.map((pkg) => {
              const active = pkg.id === selected.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setSelectedId(pkg.id);
                    track("package_select", {
                      item_type: "package",
                      item_id: pkg.id,
                      duration_label: pkg.durationLabel,
                    });
                  }}
                  className={cn(
                    "min-h-tap rounded-full border px-5 text-body font-semibold transition-all duration-press ease-soft active:scale-[0.98]",
                    active
                      ? "border-primary bg-primary text-ink-inverse shadow-card"
                      : "border-line-strong bg-surface text-ink hover:border-primary hover:text-primary"
                  )}
                >
                  {pkg.durationLabel}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* selected package card */}
        <Reveal delay={120}>
          <article className="card mt-8 overflow-hidden md:mt-10">
            <div className="grid gap-0 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              {/* keyed on the package so switching duration always lands back
                  on the first design instead of mid-swipe through the last set */}
              <PackageGallery
                key={selected.id}
                images={selectedImages}
                label={selected.durationLabel}
              />

              <div className="p-6 md:p-9">
                <h3 className="font-display text-[1.5rem] leading-tight text-ink">
                  {selected.durationLabel} Premium Garland Package
                </h3>

                {/* garlandCount already reads "5 garlands" — printed verbatim,
                    never re-worded, so the content source stays the authority */}
                {selected.garlandCount && (
                  <p className="mt-2 text-small text-ink-muted">
                    {selected.garlandCount} · one fresh garland each day
                  </p>
                )}

                <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  {selected.regularTotal && (
                    <span className="text-meta text-ink-subtle line-through">
                      {selected.regularTotal}
                    </span>
                  )}
                  {selected.packagePrice && (
                    <span className="font-display text-[2rem] font-semibold leading-none text-ink">
                      {selected.packagePrice}
                    </span>
                  )}
                </div>

                {/* savings reads as a premium offer, not a discount-store banner */}
                {selected.savingsText && (
                  <p className="mt-4 inline-flex items-center rounded-full border border-gold/50 bg-gold-soft px-3.5 py-1.5 text-small font-semibold text-ink">
                    {selected.savingsText}
                  </p>
                )}

                <ul className="mt-6 space-y-3 text-small text-ink-muted">
                  {selected.deliveryBenefit && (
                    <li className="flex items-start gap-2.5">
                      <TruckGlyph className="mt-0.5 h-4 w-4 text-leaf" />
                      <span>{selected.deliveryBenefit}</span>
                    </li>
                  )}
                  {config.garlandBookingNotice && (
                    <li className="flex items-start gap-2.5">
                      <LeafGlyph className="mt-0.5 h-4 w-4 text-leaf" />
                      <span>{config.garlandBookingNotice}</span>
                    </li>
                  )}
                  {selected.eligibilityText && (
                    <li className="flex items-start gap-2.5">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-subtle" />
                      <span>{selected.eligibilityText}</span>
                    </li>
                  )}
                  {selected.availability && (
                    <li className="flex items-start gap-2.5">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-subtle" />
                      <span>{selected.availability}</span>
                    </li>
                  )}
                </ul>

                <WhatsAppButton
                  whatsappNumber={config.whatsappNumber}
                  context={{ kind: "package", pkg: selected }}
                  ctaType="order"
                  itemType="package"
                  itemId={selected.id}
                  className="mt-8 w-full sm:w-auto"
                />
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
