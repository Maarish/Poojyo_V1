"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Scroll-in reveal.
 *
 * When the OS asks for reduced motion, the observer is never created and the
 * content renders in its final state — no transition, no work, no jank.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
  immediate = false,
}: {
  children: ReactNode;
  /** stagger in ms, for sequences of cards */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
  /**
   * Render already-revealed, and never observe.
   *
   * `.reveal` is `opacity: 0` until JS marks it shown, which for anything above
   * the fold means it stays blank until the page has hydrated *and* the
   * observer has fired — about a second on a cold desktop load, with the hero
   * photo fully decoded but invisible the whole time. Because the initial state
   * is `true`, the server already emits `data-shown="true"`, so this content is
   * painted on the first frame with no JS involved at all. That also keeps the
   * hero photo eligible as the LCP element, which an opacity fade would delay.
   *
   * Only for content visible without scrolling — a scroll-in animation is the
   * point everywhere else.
   */
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(immediate);

  useEffect(() => {
    if (immediate) return;

    const node = ref.current;
    if (!node) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [immediate]);

  return (
    <Tag
      ref={ref as never}
      className={cn("reveal", className)}
      data-shown={shown ? "true" : "false"}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
