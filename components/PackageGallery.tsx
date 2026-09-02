"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { MediaFrame } from "./MediaFrame";
import { useAutoScroll } from "./useAutoScroll";

/** a package shows a handful of designs, never a gallery — four is the ceiling */
const MAX_SHOTS = 4;

/**
 * The garland designs included in one duration package.
 *
 * One DOM tree, two layouts: a snap carousel on a phone and a grid from `md`
 * up. Deliberately not two trees behind `hidden`/`md:block`, because that would
 * mount every photo twice and pay for it twice on mobile data.
 *
 * Every frame is the same 4:3 as the single shot it replaces, so the card
 * reserves its space before any photo arrives and nothing shifts on load.
 */
export function PackageGallery({
  images,
  label,
  className,
}: {
  /** already falls back to the single `image` upstream; blanks are dropped here */
  images: string[];
  /** used to build each alt text, e.g. "5 Days" */
  label: string;
  className?: string;
}) {
  const shots = images.filter(Boolean).slice(0, MAX_SHOTS);
  const railRef = useRef<HTMLUListElement | null>(null);
  const [active, setActive] = useState(0);

  // Called before the single-shot early return below, so the hook order is the
  // same on every render. With one shot there is no rail to attach to and the
  // effect bails on a null ref anyway; the flag just says so out loud.
  useAutoScroll(railRef, shots.length > 1);

  const alt = (i: number) =>
    shots.length > 1
      ? `${label} premium garland package — design ${i + 1} of ${shots.length}`
      : `${label} premium garland package`;

  // One shot has nothing to swipe through, so it stays exactly what it was —
  // and none at all still renders the frame, which draws MediaFrame's slate
  // rather than collapsing the card's photo column to nothing.
  if (shots.length <= 1) {
    return (
      <MediaFrame
        src={shots[0]}
        alt={alt(0)}
        ratio="4/3"
        rounded="md"
        sizes="(min-width: 768px) 40vw, 100vw"
        className={cn("!rounded-none md:h-full", className)}
      />
    );
  }

  // An odd count would leave a hole in a two-column grid, so the first design
  // spans the row instead — which also reads as the package's lead image.
  const leadSpans = shots.length % 2 === 1;

  const goTo = (i: number) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollTo({ left: i * rail.clientWidth, behavior: "smooth" });
  };

  return (
    // self-center: the grid is shorter than the price column beside it, so it
    // sits against that column's optical middle rather than pinned to the top
    <div className={cn("md:self-center md:p-3", className)}>
      <ul
        ref={railRef}
        aria-label={`${label} package — garland designs`}
        // `clientWidth` per slide is what makes the dot maths exact — every
        // slide is exactly one rail wide on mobile.
        onScroll={(e) => {
          const rail = e.currentTarget;
          if (rail.clientWidth === 0) return;
          setActive(Math.round(rail.scrollLeft / rail.clientWidth));
        }}
        className={cn(
          "flex snap-x snap-mandatory overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "md:grid md:grid-cols-2 md:gap-2.5 md:overflow-visible"
        )}
      >
        {shots.map((src, i) => (
          <li
            key={`${src}-${i}`}
            className={cn(
              "w-full shrink-0 snap-start md:w-auto",
              leadSpans && i === 0 && "md:col-span-2"
            )}
          >
            <MediaFrame
              src={src}
              alt={alt(i)}
              ratio="4/3"
              rounded="md"
              // every frame stays lazy — the section sits well below the fold,
              // and preloading four photos here would cost the hero's LCP
              sizes={
                leadSpans && i === 0
                  ? "(min-width: 768px) 40vw, 100vw"
                  : "(min-width: 768px) 20vw, 100vw"
              }
              className="!rounded-none md:!rounded-md"
            />
          </li>
        ))}
      </ul>

      {/* dots are the swipe affordance, and are mobile-only — the grid above
          shows every design at once from `md` up, so there is nothing to page */}
      <div className="flex justify-center md:hidden">
        {shots.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show design ${i + 1} of ${shots.length}`}
            aria-current={i === active}
            // fixed width, not padding: the active pill grows from 6px to 20px,
            // and on an auto-width button that nudges every dot beside it
            className="grid min-h-tap w-9 place-items-center"
          >
            <span
              className={cn(
                "block h-1.5 rounded-full transition-all duration-press ease-soft",
                i === active ? "w-5 bg-primary" : "w-1.5 bg-line-strong"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
