import Image from "next/image";
import { cn } from "@/lib/cn";
import HORIZONTAL from "@/public/brand/logo-horizontal.png";
import STACKED from "@/public/brand/logo-stacked.png";

/**
 * The single place every POOJYO logo is rendered.
 *
 * Both files are cut from the supplied brand sheet by
 * `scripts/build-brand-assets.mjs`. If vector originals ever arrive, drop them
 * in as `.svg`, change the two imports here, and the whole site picks them up —
 * see public/brand/README.md.
 *
 * They are *imported* rather than referenced by path so that Next reads each
 * file's real pixel size at build time. That size is what gives the browser the
 * aspect ratio up front (so the header never reflows) and what lets next/image
 * pick a source wide enough for the device's pixel density — and because the
 * build script re-cuts these files, any hardcoded size here would silently go
 * stale and start distorting the artwork the next time it runs.
 */

/**
 * Header lockup. Rendered height is driven by a CSS variable rather than fixed
 * inline styles, so it can grow at the `md` breakpoint without a second image
 * or an `!important` override fighting the inline style.
 */
export function LogoHorizontal({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={HORIZONTAL}
      alt="POOJYO"
      priority={priority}
      className={cn("[--logo-h:38px] md:[--logo-h:46px]", className)}
      style={{ height: "var(--logo-h)", width: "auto" }}
      // widest it is ever laid out (46px tall x the ~3.7:1 artwork), so a 2x or
      // 3x screen still requests a source big enough to stay crisp
      sizes="176px"
    />
  );
}

export function LogoStacked({
  className,
  width = 120,
  priority = false,
}: {
  className?: string;
  width?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src={STACKED}
      alt="POOJYO"
      priority={priority}
      className={className}
      // `height: auto` rather than a computed pixel height: the caller controls
      // the width, and the artwork's own ratio decides the rest, so the lockup
      // can never be stretched if the cut's proportions change.
      style={{ width, height: "auto" }}
      sizes={`${width}px`}
    />
  );
}

/**
 * The stacked lockup centred inside the brand's gold ring — the treatment used
 * in the hero and the footer.
 */
export function LogoMedallion({
  size = 148,
  className,
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn("logo-ring shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <LogoStacked width={Math.round(size * 0.62)} priority={priority} />
    </div>
  );
}
