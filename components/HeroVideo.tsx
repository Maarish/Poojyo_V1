"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { MediaFrame } from "./MediaFrame";
import { MuteGlyph } from "./icons";

/**
 * Console tracing for the hero video: every media event plus the element's
 * state. Off by default — flip to `true` if playback ever needs investigating
 * again on a real device. Nothing else in the component depends on it.
 */
const DIAGNOSTICS = false;

/** every media event worth seeing while diagnosing a video that will not start */
const MEDIA_EVENTS = [
  "loadedmetadata",
  "loadeddata",
  "canplay",
  "play",
  "playing",
  "pause",
  "error",
  "stalled",
  "waiting",
] as const;

/**
 * The hero film: a garland, moving, in a white frame with a thin gold ring.
 *
 * ## Why this component has almost no logic
 *
 * It used to gate the `<video>` behind four JavaScript conditions — a
 * reduced-motion check, a Data Saver check, a wait for `window.load`, and an
 * opacity that only lifted once a `playing` event arrived. Each was a way to
 * end up with a silent, invisible video and no signal as to which had fired,
 * and on mobile several could fire at once. The `playing`-driven opacity was
 * the worst of them: iOS Safari in Low Power Mode decodes the video and then
 * declines to start it, so a fully-loaded video sat at `opacity: 0` for ever.
 *
 * The element is now rendered unconditionally, in the server HTML, with the
 * plain attributes a browser needs and nothing else:
 *
 *   autoplay + muted + playsinline + loop + preload="auto" + poster
 *
 * That is the combination every mobile browser documents as autoplay-eligible,
 * and because it ships in the markup rather than being mounted by an effect,
 * **playback does not depend on JavaScript running at all.** If hydration is
 * slow, fails, or never happens, the film still plays.
 *
 * No opacity, visibility or mount state exists anywhere in here, by design:
 * there is no value any of them could take that would leave the video hidden.
 * JavaScript is only ever *subtractive* — it pauses for reduced motion — or
 * *additive* — it re-attempts a refused autoplay — and never the reason one
 * starts in the first place.
 */
export function HeroVideo({
  src,
  poster,
  alt,
  sizes,
  priority = false,
  className,
}: {
  /** resolved by lib/images.ts; undefined renders the poster alone */
  src?: string;
  poster?: string;
  alt: string;
  sizes: string;
  /** true for the LCP candidate */
  priority?: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reduced =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const trace = (label: string) => {
      if (!DIAGNOSTICS) return;
      // eslint-disable-next-line no-console
      console.log(`[hero-video] ${label}`, {
        currentSrc: video.currentSrc,
        readyState: video.readyState,
        networkState: video.networkState,
        errorCode: video.error?.code ?? null,
        paused: video.paused,
        muted: video.muted,
        autoplay: video.autoplay,
        currentTime: +video.currentTime.toFixed(3),
      });
    };

    /**
     * `muted` as a property, not just the rendered attribute: React sets both,
     * but iOS only consults the property, and a muted video is the difference
     * between autoplay being legal and being refused.
     */
    const attemptPlay = (reason: string) => {
      if (reduced?.matches) return; // asked for stillness — leave it on frame one
      video.muted = true;
      const attempt = video.play();
      if (!attempt) {
        trace(`play() [${reason}] returned undefined (legacy browser)`);
        return;
      }
      attempt.then(
        () => trace(`play() resolved [${reason}]`),
        (err: DOMException) => trace(`play() REJECTED [${reason}] ${err.name}: ${err.message}`)
      );
    };

    /**
     * Reduced motion stops playback; it does not gate the element.
     *
     * That distinction is deliberate and is what the earlier bug hunt turned
     * on. The <video> always exists and always shows a frame, so this can only
     * ever take the movement away — never the picture. Watched live, so
     * flipping the OS setting stops or starts the film immediately.
     */
    const syncMotion = () => {
      if (reduced?.matches) {
        video.pause();
        video.currentTime = 0;
      } else {
        attemptPlay("reduced-motion off");
      }
    };
    reduced?.addEventListener("change", syncMotion);

    // Every media event, logged and cleaned up together.
    const handlers = MEDIA_EVENTS.map((type) => {
      const handler = () => trace(`event: ${type}`);
      video.addEventListener(type, handler);
      return [type, handler] as const;
    });

    // Retry points. Calling play() on an already-playing element is a no-op, so
    // these are safe to stack — each one simply covers a browser that only
    // becomes willing at that moment.
    const onLoadedData = () => attemptPlay("loadeddata");
    const onCanPlay = () => attemptPlay("canplay");
    const onPointerDown = () => attemptPlay("pointerdown");

    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("canplay", onCanPlay);
    // iOS refuses muted autoplay in Low Power Mode until the page is touched.
    document.addEventListener("pointerdown", onPointerDown, { passive: true });

    trace("mounted");
    syncMotion();

    return () => {
      reduced?.removeEventListener("change", syncMotion);
      for (const [type, handler] of handlers) video.removeEventListener(type, handler);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("canplay", onCanPlay);
      document.removeEventListener("pointerdown", onPointerDown);
    };
    // `src` is a plain string resolved on the server and stable across renders,
    // so this runs once per real source change and the <video> is never
    // remounted underneath it. There is deliberately no `key` on the element.
  }, [src]);

  return (
    <div
      className={cn(
        // A white mat inside a thin gold rule, on the ivory page. Gold is a
        // hairline here and nothing else — never a fill.
        "rounded-xl border border-gold/45 bg-surface p-2 shadow-raised md:p-2.5",
        className
      )}
    >
      <div className="relative h-full">
        {/* Kept underneath: this is the optimized AVIF/WebP that `next/image`
            serves and the LCP element the hero is measured on. The <video>'s
            own `poster` covers the same pixels natively; both are present
            because the video's poster is what guarantees a frame with no JS at
            all, and this one is what keeps the metric fast. */}
        <MediaFrame
          src={poster}
          alt={alt}
          ratio="4/5"
          rounded="lg"
          priority={priority}
          sizes={sizes}
          className="h-full"
        />

        {src && (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            // iOS 9 and some older Android WebViews predate `playsinline` and
            // will otherwise hijack the video into a fullscreen player.
            {...{ "webkit-playsinline": "true" }}
            aria-label={alt}
            tabIndex={-1}
            className="absolute inset-0 h-full w-full rounded-lg object-cover"
          />
        )}

        {/* A statement of fact, not a control: this is playing, and it is
            silent. Rendered alongside the film rather than in response to a
            playback event, so it can never be the thing that is stuck. */}
        {src && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full border border-gold/40 bg-surface/85 text-ink-subtle shadow-card backdrop-blur-sm"
          >
            <MuteGlyph />
          </span>
        )}
      </div>
    </div>
  );
}
