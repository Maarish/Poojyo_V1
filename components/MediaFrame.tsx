import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Every photograph on the site goes through here, so framing, rounding and
 * `sizes` stay consistent — and so a missing image degrades to a calm slate
 * instead of a broken icon.
 */
export function MediaFrame({
  src,
  alt,
  ratio = "4/3",
  sizes,
  priority = false,
  className,
  rounded = "lg",
}: {
  src?: string;
  alt: string;
  ratio?: "1/1" | "4/3" | "3/2" | "4/5" | "9/16" | "16/9";
  sizes: string;
  priority?: boolean;
  className?: string;
  rounded?: "md" | "lg" | "xl";
}) {
  const radius = { md: "rounded-md", lg: "rounded-lg", xl: "rounded-xl" }[rounded];

  return (
    <div
      className={cn(
        // `w-full` is load-bearing, not decoration. With only a ratio set, a
        // caller that also pins the height (DurationPackages uses `md:h-full`
        // to make the photo fill the card) leaves the width `auto` — and an
        // element with an aspect ratio and a definite height resolves its
        // *width from that height*, so the frame swells past its grid track
        // and lands on top of the next column. Making the width definite too
        // means the ratio is simply ignored whenever a height is supplied,
        // which is what every such caller actually wants.
        "relative w-full overflow-hidden bg-surface-sunk",
        radius,
        className
      )}
      style={{ aspectRatio: ratio.replace("/", " / ") }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 grid place-items-center"
          aria-hidden="true"
        >
          <span className="font-display text-small text-ink-subtle">POOJYO</span>
        </div>
      )}
    </div>
  );
}
