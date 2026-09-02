"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { track, type CtaType, type ItemType } from "@/lib/analytics";
import { buildWhatsAppUrl, type MessageContext } from "@/lib/whatsapp";
import { readUtm } from "@/lib/utm";
import { WhatsAppGlyph } from "./icons";

/**
 * Every WhatsApp CTA on the site.
 *
 * It builds the wa.me deep link with the right template, appends the session's
 * attribution ref, and fires the analytics event. Two labels exist and only two:
 * "Order on WhatsApp" and "Get Quote on WhatsApp".
 */
export function WhatsAppButton({
  whatsappNumber,
  context,
  ctaType,
  itemType,
  itemId,
  label,
  variant = "primary",
  size = "md",
  className,
  fullWidth = false,
}: {
  whatsappNumber: string;
  context: MessageContext;
  ctaType: CtaType;
  itemType: ItemType;
  itemId: string;
  /** defaults to the CTA rule: order -> "Order on WhatsApp", quote -> "Get Quote on WhatsApp" */
  label?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
  className?: string;
  fullWidth?: boolean;
}) {
  // built on the client so the session's UTM is included in the ref line
  const href = useMemo(
    () => buildWhatsAppUrl(whatsappNumber, context, readUtm()),
    [whatsappNumber, context]
  );

  const text = label ?? (ctaType === "quote" ? "Get Quote on WhatsApp" : "Order on WhatsApp");

  const classes = cn(
    "btn",
    variant === "primary" ? "btn-primary" : "btn-secondary",
    size === "sm" && "btn-sm",
    fullWidth && "w-full",
    className
  );

  // placeholder number: render a disabled control rather than a dead chat link
  if (!href) {
    return (
      <span
        className={cn(classes, "cursor-not-allowed opacity-55")}
        role="button"
        aria-disabled="true"
        title="Add config.whatsappNumber to enable this button"
      >
        <WhatsAppGlyph className={variant === "primary" ? "text-whatsapp" : "text-whatsapp"} />
        {text}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
      onClick={() => track("whatsapp_click", { cta_type: ctaType, item_type: itemType, item_id: itemId })}
    >
      {/* the glyph carries WhatsApp green; the button itself stays brand magenta */}
      <WhatsAppGlyph className="text-whatsapp" />
      {text}
    </a>
  );
}
