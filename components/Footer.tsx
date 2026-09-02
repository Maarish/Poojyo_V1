import Link from "next/link";
import type { Config } from "@/lib/content/types";
import { buildTelUrl } from "@/lib/whatsapp";
import { LEGAL_LINKS } from "./legal/links";
import { LogoMedallion } from "./Logo";
import { RatingCue } from "./RatingCue";
import { CallButton } from "./CallButton";
import { WhatsAppButton } from "./WhatsAppButton";

export function Footer({ config }: { config: Config }) {
  const telHref = buildTelUrl(config.phoneNumber);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface-sunk py-14 md:py-16">
      <div className="container-page">
        <div className="flex flex-col items-center text-center">
          <LogoMedallion size={116} />

          {config.tagline && (
            <p className="mt-6 max-w-prose text-small text-ink-muted">{config.tagline}</p>
          )}

          <div className="mt-6">
            <RatingCue config={config} tone="quiet" />
          </div>

          <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <WhatsAppButton
              whatsappNumber={config.whatsappNumber}
              context={{ kind: "generic" }}
              ctaType="order"
              itemType="generic"
              itemId="footer"
              size="sm"
              className="w-full sm:w-auto"
            />
            <CallButton
              phoneNumber={config.phoneNumber}
              variant="secondary"
              className="btn-sm w-full sm:w-auto"
            />
          </div>
        </div>

        <dl className="mt-12 grid gap-8 border-t border-line pt-10 text-small sm:grid-cols-3">
          {config.storeAddress && (
            <div>
              <dt className="eyebrow mb-2">Store</dt>
              <dd className="text-ink-muted">{config.storeAddress}</dd>
            </div>
          )}
          {config.storeHours && (
            <div>
              <dt className="eyebrow mb-2">Hours</dt>
              <dd className="text-ink-muted">{config.storeHours}</dd>
            </div>
          )}
          <div>
            <dt className="eyebrow mb-2">Contact</dt>
            <dd className="text-ink-muted">
              {telHref ? (
                <a
                  href={telHref}
                  // -my-3 keeps the 48px tap target from adding visible space
                  className="-my-3 inline-flex min-h-tap items-center rounded-sm py-3 underline-offset-4 hover:underline"
                >
                  {config.phoneNumber}
                </a>
              ) : (
                config.phoneNumber
              )}
            </dd>
          </div>
        </dl>

        {/* Deliberately the quietest thing on the page: meta size, subtle ink,
            sitting with the copyright line rather than in the contact grid, so
            it satisfies the legal requirement without pulling a single tap away
            from the WhatsApp flow above. */}
        <nav
          aria-label="Legal"
          className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-0 text-meta"
        >
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              // -my-3 keeps the 48px tap target from adding visible space
              className="-my-3 inline-flex min-h-tap items-center rounded-sm py-3 text-ink-subtle underline-offset-4 hover:text-ink-muted hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="mt-6 text-center text-meta text-ink-subtle">
          © {year} {config.brandName}. Orders on WhatsApp.
        </p>
      </div>
    </footer>
  );
}
