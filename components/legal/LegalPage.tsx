import Link from "next/link";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { StickyContactBar } from "@/components/StickyContactBar";
import { StickyHeader } from "@/components/StickyHeader";
import { cn } from "@/lib/cn";
import type { Config } from "@/lib/content/types";
import { LEGAL_LINKS } from "./links";

/**
 * Shared shell for the three legal pages.
 *
 * Same header and footer as /ganpati so the chrome never drifts, but the body
 * is a single measured column — legal copy is read, not scanned, and 62ch is
 * the width that stays readable on a phone without becoming a wall of text.
 *
 * The sticky contact bar stays because `body` reserves bottom padding for it on
 * mobile (globals.css); dropping it here would leave dead space under the
 * footer on every phone.
 */
export function LegalPage({
  config,
  title,
  updated,
  intro,
  instagramUrl,
  children,
}: {
  config: Config;
  /** passed straight to the header, so its actions match the landing page */
  instagramUrl?: string;
  title: string;
  /** human-readable date, e.g. "22 August 2026" — printed verbatim */
  updated: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <StickyHeader config={config} homeHref="/" instagramUrl={instagramUrl} />

      <main className="py-section-y">
        <div className="container-page">
          <div className="max-w-prose">
            <p className="eyebrow mb-3">Legal</p>
            <h1 className="text-h2 font-display text-ink">{title}</h1>
            <p className="mt-3 text-meta text-ink-subtle">Last updated: {updated}</p>
            {intro && <div className="mt-6 text-lead text-ink-muted">{intro}</div>}
          </div>

          <div className="mt-10 max-w-prose md:mt-12">{children}</div>

          {/* the other two policies, so a reader never has to go back to hunt */}
          <nav
            aria-label="Other policies"
            className="mt-14 max-w-prose border-t border-line pt-8"
          >
            <p className="eyebrow mb-4">More</p>
            <ul className="space-y-1">
              {LEGAL_LINKS.filter((link) => link.label !== title).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="-my-1 inline-flex min-h-tap items-center rounded-sm py-1 text-small text-ink-muted underline-offset-4 hover:text-primary hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/ganpati"
                  className="-my-1 inline-flex min-h-tap items-center rounded-sm py-1 text-small text-ink-muted underline-offset-4 hover:text-primary hover:underline"
                >
                  Back to Ganpati garlands
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </main>

      <Footer config={config} />

      <StickyContactBar config={config} />
    </>
  );
}

/** one numbered-feeling block: a heading and its copy, on a consistent rhythm */
export function LegalSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-9 first:mt-0", className)}>
      <h2 className="font-display text-h3 text-ink">{title}</h2>
      <div className="mt-3 space-y-3.5 text-small text-ink-muted">{children}</div>
    </section>
  );
}

/** bulleted list, matching the dot bullets used on the packages card */
export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-subtle" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Contact block, repeated at the foot of each policy.
 *
 * Every value comes from the content source — nothing here is written into the
 * legal copy by hand, so it cannot drift from the rest of the site.
 *
 * TODO(POOJYO): add a contact email address to `config` once one exists, and
 * render it here. Indian data-protection practice expects a written channel and
 * a named grievance contact; today the project has no email anywhere, so this
 * block deliberately points at the WhatsApp number, phone number and store
 * address that DO exist rather than inventing one.
 */
export function LegalContact({ config }: { config: Config }) {
  return (
    <LegalSection title="Contact us">
      <p>
        For any question about this policy, or about an order you have placed, please
        reach us on WhatsApp or by phone:
      </p>
      <LegalList
        items={[
          <>
            <span className="text-ink">WhatsApp / Phone:</span> {config.phoneNumber}
          </>,
          config.storeAddress ? (
            <>
              <span className="text-ink">Store:</span> {config.brandName},{" "}
              {config.storeAddress}
            </>
          ) : null,
          config.storeHours ? (
            <>
              <span className="text-ink">Hours:</span> {config.storeHours}
            </>
          ) : null,
        ].filter(Boolean)}
      />
    </LegalSection>
  );
}
