"use client";

import { useEffect, type RefObject } from "react";

/** how long a slide is held before the rail moves on */
const DWELL_MS = 3400;
/** one advance — long enough to read as a glide rather than a jump */
const STEP_MS = 700;
/** the sweep back to the first slide, which covers more ground so it gets more time */
const REWIND_MS = 1100;
/** quiet time after an interaction before the rail starts moving again */
const RESUME_MS = 5000;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Gentle auto-advance for a native horizontal snap-scroller.
 *
 * Drives `scrollLeft` on the element the browser is already scrolling, rather
 * than translating a track underneath it. That is the whole design: a real
 * swipe keeps working untouched, snap points still apply, the scrollbar and
 * accessibility semantics are the browser's, and there is no library — one rAF
 * loop that only runs while a rail is actually on screen and actually moving.
 *
 * It stops itself in every situation where motion would be wrong:
 *
 *  - `prefers-reduced-motion` — watched live, so the rail becomes an ordinary
 *    manual carousel the moment the OS setting is turned on, and starts again
 *    if it is turned off.
 *  - The rail is off screen (`IntersectionObserver`) or the tab is hidden.
 *  - There is nothing to scroll. Both rails here are a grid from `md` up, where
 *    `scrollWidth === clientWidth` — so this check is also what confines the
 *    behaviour to mobile, with no media query to keep in sync with the CSS.
 *  - Someone is using it. Touch, drag, wheel, keyboard or focus holds the rail
 *    still for {@link RESUME_MS}; hover holds it for as long as the pointer is
 *    over it.
 *
 * The `scroll` event is deliberately *not* one of those triggers: our own
 * per-frame writes fire it too, and separating the two is guesswork that ends
 * with a rail that either never resumes or never pauses. Pointer, wheel, key
 * and focus are unambiguous, and a drag cannot begin without one of them.
 */
export function useAutoScroll(ref: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const rail = ref.current;
    if (!rail || !enabled) return;

    let frame = 0;
    let tick = 0;
    let resume = 0;
    let hovering = false;
    let onScreen = false;
    let held = false;
    let motionOk = true;

    const scrollable = () => rail.scrollWidth - rail.clientWidth;

    const stop = () => {
      cancelAnimationFrame(frame);
      rail.style.scrollSnapType = "";
    };

    const glide = (to: number, ms: number) => {
      const from = rail.scrollLeft;
      const delta = to - from;
      if (Math.abs(delta) < 2) return;

      const started = performance.now();
      // Mandatory snap fights a per-frame scrollLeft write, dragging the rail
      // back to the nearest point mid-glide. Suspended only for the animation,
      // so a real swipe still snaps exactly as it did before.
      rail.style.scrollSnapType = "none";

      const step = (now: number) => {
        const p = Math.min(1, (now - started) / ms);
        rail.scrollLeft = from + delta * easeInOutCubic(p);
        if (p < 1) frame = requestAnimationFrame(step);
        else rail.style.scrollSnapType = "";
      };
      frame = requestAnimationFrame(step);
    };

    const advance = () => {
      const slides = Array.from(rail.children) as HTMLElement[];
      if (slides.length < 2) return;

      // Offsets are measured against the first slide rather than the container,
      // so the rail's own negative margin and scroll padding cancel out.
      const origin = slides[0].offsetLeft;
      const here = rail.scrollLeft;
      const end = scrollable();

      if (here >= end - 4) {
        glide(0, REWIND_MS); // last slide reached — sweep back to the first
        return;
      }
      const next = slides.find((s) => s.offsetLeft - origin > here + 4);
      glide(next ? Math.min(next.offsetLeft - origin, end) : end, STEP_MS);
    };

    const loop = () => {
      tick = window.setTimeout(() => {
        if (motionOk && !held && !hovering && onScreen && !document.hidden && scrollable() > 8) {
          advance();
        }
        loop();
      }, DWELL_MS);
    };

    const hold = () => {
      held = true;
      stop();
      clearTimeout(resume);
      resume = window.setTimeout(() => {
        held = false;
      }, RESUME_MS);
    };

    const enter = () => {
      hovering = true;
      stop();
    };
    const leave = () => {
      hovering = false;
    };

    rail.addEventListener("pointerdown", hold, { passive: true });
    rail.addEventListener("touchstart", hold, { passive: true });
    rail.addEventListener("wheel", hold, { passive: true });
    rail.addEventListener("keydown", hold);
    rail.addEventListener("focusin", hold);
    rail.addEventListener("mouseenter", enter);
    rail.addEventListener("mouseleave", leave);

    const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)") ?? null;
    const syncMotion = () => {
      motionOk = !motion?.matches;
      if (!motionOk) stop();
    };
    syncMotion();
    motion?.addEventListener("change", syncMotion);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (!onScreen) stop();
      },
      { threshold: 0.25 }
    );
    io.observe(rail);

    loop();

    return () => {
      clearTimeout(tick);
      clearTimeout(resume);
      stop();
      io.disconnect();
      motion?.removeEventListener("change", syncMotion);
      rail.removeEventListener("pointerdown", hold);
      rail.removeEventListener("touchstart", hold);
      rail.removeEventListener("wheel", hold);
      rail.removeEventListener("keydown", hold);
      rail.removeEventListener("focusin", hold);
      rail.removeEventListener("mouseenter", enter);
      rail.removeEventListener("mouseleave", leave);
    };
  }, [ref, enabled]);
}
