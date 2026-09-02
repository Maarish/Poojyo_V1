"use client";

import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";
import { buildWhatsAppCatalogUrl } from "@/lib/whatsapp";
import { WhatsAppGlyph } from "./icons";

/**
 * "Browse our full catalog on WhatsApp" — a link to `wa.me/c/<number>`.
 *
 * Deliberately a sibling of `WhatsAppButton` rather than a variant of it: that
 * component's whole job is composing a pre-filled *message*, and a catalog link
 * carries none. What they do share is the visual treatment (brand magenta, green
 * glyph) and the event — this reports `whatsapp_click` with `cta_type: "catalog"`,
 * so it lands in the same funnel without adding a fourth event.
 */
export function WhatsAppCatalogButton({
  whatsappNumber,
  /** where on the page this instance sits — the analytics `item_id` */
  placement,
  label = "Browse our full catalog on WhatsApp",
  variant = "primary",
  size = "md",
  className,
}: {
  whatsappNumber: string;
  placement: string;
  label?: string;
  /** `outline` is the hero pairing: ivory fill, magenta rule — see globals.css */
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md";
  className?: string;
}) {
  const href = buildWhatsAppCatalogUrl(whatsappNumber);

  const classes = cn(
    "btn",
    { primary: "btn-primary", secondary: "btn-secondary", outline: "btn-outline" }[variant],
    size === "sm" && "btn-sm",
    className
  );

  // placeholder number: a disabled control, never a dead link
  if (!href) {
    return (
      <span
        className={cn(classes, "cursor-not-allowed opacity-55")}
        role="button"
        aria-disabled="true"
        title="Add config.whatsappNumber to enable this button"
      >
        <WhatsAppGlyph className="text-whatsapp" />
        {label}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
      onClick={() =>
        track("whatsapp_click", {
          cta_type: "catalog",
          item_type: "generic",
          item_id: placement,
        })
      }
    >
      <WhatsAppGlyph className="text-whatsapp" />
      {label}
    </a>
  );
}
