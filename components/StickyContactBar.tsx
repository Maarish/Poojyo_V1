"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import type { Config } from "@/lib/content/types";
import { CallButton } from "./CallButton";
import { WhatsAppButton } from "./WhatsAppButton";

/**
 * How far down the page the bar waits before sliding up.
 *
 * Not zero, and not a fraction of the viewport. At the very top the hero is
 * sized to put both of its CTAs above the fold, and a bar that is already there
 * on load would sit on top of the second one — so the bar must start away. A
 * short, fixed distance is what brings it back: by the time the page has moved
 * ~100px the hero's own buttons are on their way out, and the thumb-zone CTA
 * takes over from them rather than competing with them.
 */
const REVEAL_AT = 100;

/**
 * Thumb-zone bar.
 *
 * Fixed to the bottom on mobile, where most traffic is one-handed, with the
 * WhatsApp action dominant and Call secondary. `body` reserves matching bottom
 * padding (see globals.css) so this never covers content, and the safe-area
 * inset keeps it clear of the home indicator.
 *
 * It slides in on `transform` alone — no width, height or top/bottom animation
 * — so the whole thing is composited and costs no layout or paint per frame.
 * The scroll listener is `passive` and does nothing but compare a number, and
 * React bails out of the re-render whenever the answer has not changed, so
 * scrolling the page does not repeatedly re-render the bar.
 *
 * Reduced motion gets no slide: `motion-reduce:transition-none` here, plus the
 * global rule in globals.css that flattens every transition. The bar still
 * appears and disappears at the same scroll position — the movement is what is
 * removed, not the behaviour.
 *
 * `inert` while hidden keeps two off-screen buttons out of the tab order and
 * away from screen readers; both actions exist elsewhere on the page, so
 * nothing is lost while it is away.
 *
 * From md up the page is no longer thumb-driven, so the bar drops away entirely
 * and the sticky header carries the CTA.
 */
export function StickyContactBar({ config }: { config: Config }) {
  // Starts hidden, which is also what the server renders — correct at scroll 0,
  // and the effect below corrects it immediately on a restored or #anchored load.
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const sync = () => setShown(window.scrollY > REVEAL_AT);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);

  return (
    <div
      inert={!shown}
      className={cn(
        "safe-x fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 shadow-bar backdrop-blur-md md:hidden",
        "transition-transform duration-300 ease-soft will-change-transform motion-reduce:transition-none",
        // 110% rather than 100%: the bar's shadow is cast upward, and at exactly
        // its own height a sliver of it still shows along the bottom edge.
        shown ? "translate-y-0" : "translate-y-[110%]"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="container-page flex h-bar-h items-center gap-3">
        <WhatsAppButton
          whatsappNumber={config.whatsappNumber}
          context={{ kind: "generic" }}
          ctaType="order"
          itemType="generic"
          itemId="sticky-bar"
          className="flex-1"
        />
        {/* A plain tel: link — tap to call, nothing to swipe, nothing to learn.
            Reports call_click; see CallButton. */}
        <CallButton
          phoneNumber={config.phoneNumber}
          variant="ghost"
          showLabel={false}
          className="w-12 shrink-0 px-0"
        />
      </div>
    </div>
  );
}
