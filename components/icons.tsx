import { cn } from "@/lib/cn";

/**
 * Inline SVG icons. Kept local and tiny so no icon library ships to the client.
 * All are currentColor except the WhatsApp glyph, which keeps its brand green.
 */

type IconProps = { className?: string };

export function WhatsAppGlyph({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn("h-5 w-5 shrink-0", className)}
      fill="currentColor"
    >
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38a9.86 9.86 0 0 0 4.74 1.2h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.1.81.83-3.03-.2-.31a8.17 8.17 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.23-8.23a8.18 8.18 0 0 1 8.22 8.24c0 4.54-3.69 8.21-8.23 8.21Zm4.51-6.16c-.25-.12-1.46-.72-1.69-.8-.22-.09-.39-.13-.55.12-.16.24-.63.79-.77.96-.14.16-.28.18-.53.06a6.7 6.7 0 0 1-1.98-1.22 7.47 7.47 0 0 1-1.37-1.71c-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.25-.85.84-.85 2.04s.88 2.37 1 2.53c.12.16 1.72 2.63 4.17 3.69.58.25 1.04.4 1.39.51.58.19 1.12.16 1.54.1.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

export function PhoneGlyph({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn("h-5 w-5 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.6 2.8h3l1.5 3.8-1.9 1.4a12.5 12.5 0 0 0 5.8 5.8l1.4-1.9 3.8 1.5v3a2 2 0 0 1-2.2 2A17.6 17.6 0 0 1 4.6 5 2 2 0 0 1 6.6 2.8Z" />
    </svg>
  );
}

export function StarGlyph({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn("h-4 w-4 shrink-0", className)}
      fill="currentColor"
    >
      <path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.4l-5.8 3 1.1-6.4L2.6 9.4l6.5-.9L12 2.6Z" />
    </svg>
  );
}

export function TruckGlyph({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn("h-5 w-5 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.8 6.2h9.4v9.3H2.8zM12.2 9.4h3.6l2.9 2.9v3.2h-6.5z" />
      <circle cx="6.6" cy="17.8" r="1.8" />
      <circle cx="16.4" cy="17.8" r="1.8" />
    </svg>
  );
}

export function ClockGlyph({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn("h-5 w-5 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.3l3.2 1.9" />
    </svg>
  );
}

export function PinGlyph({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn("h-5 w-5 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function LeafGlyph({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn("h-5 w-5 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 4c0 9-5.5 13.5-11.5 13.5A4.5 4.5 0 0 1 4 13c0-5 4.5-9 16-9Z" />
      <path d="M4.5 19.5C8 16 11 13.5 16 11" />
    </svg>
  );
}

export function InstagramGlyph({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn("h-5 w-5 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** speaker with a slash — the hero video's "this is playing silently" cue */
export function MuteGlyph({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn("h-4 w-4 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5 6.5 8.8H3.6v6.4h2.9L11 19Z" />
      <path d="m15.4 9.8 4.2 4.4M19.6 9.8l-4.2 4.4" />
    </svg>
  );
}

export function ArrowGlyph({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn("h-4 w-4 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h13M12.5 6l6 6-6 6" />
    </svg>
  );
}
