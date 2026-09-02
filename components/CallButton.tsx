"use client";

import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";
import { buildTelUrl } from "@/lib/whatsapp";
import { PhoneGlyph } from "./icons";

export function CallButton({
  phoneNumber,
  label = "Call",
  variant = "ghost",
  className,
  showLabel = true,
}: {
  phoneNumber: string;
  label?: string;
  variant?: "ghost" | "secondary";
  className?: string;
  showLabel?: boolean;
}) {
  const href = buildTelUrl(phoneNumber);
  const classes = cn("btn", variant === "ghost" ? "btn-ghost" : "btn-secondary", className);

  if (!href) {
    return (
      <span
        className={cn(classes, "cursor-not-allowed opacity-55")}
        role="button"
        aria-disabled="true"
        title="Add config.phoneNumber to enable this button"
      >
        <PhoneGlyph />
        {showLabel && label}
      </span>
    );
  }

  return (
    <a
      href={href}
      className={classes}
      aria-label={showLabel ? undefined : label}
      onClick={() => track("call_click", { item_type: "generic", item_id: "call" })}
    >
      <PhoneGlyph />
      {showLabel && label}
    </a>
  );
}
