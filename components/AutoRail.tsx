"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useAutoScroll } from "./useAutoScroll";

/**
 * A `.rail` that advances by itself.
 *
 * Drop-in for `<ul className="rail">` — same class, same markup, same snap
 * carousel on mobile and same three-up grid from `md` up. The only addition is
 * {@link useAutoScroll}, which nudges `scrollLeft` along every few seconds so a
 * visitor who never swipes still sees the rest of the designs.
 *
 * A client component purely to own the ref and the effect; the slides
 * themselves are still rendered on the server and passed through as children,
 * so nothing about the cards ships to the browser that did before.
 */
export function AutoRail({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLUListElement | null>(null);
  useAutoScroll(ref);

  return (
    <ul ref={ref} className={cn("rail", className)} aria-label={ariaLabel}>
      {children}
    </ul>
  );
}
