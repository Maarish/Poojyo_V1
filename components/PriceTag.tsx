import { cn } from "@/lib/cn";
import type { PriceType } from "@/lib/content/types";

/**
 * The one place price display logic lives:
 *   fixed    -> ₹XXX
 *   starting -> Starting from ₹XXX
 *   quote    -> Get Quote
 *
 * Prices are strings straight from the content source. Nothing here parses or
 * calculates, so placeholder tokens like ₹XXX pass through untouched.
 */
export function PriceTag({
  priceType,
  price,
  size = "md",
  className,
}: {
  priceType: PriceType;
  price: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const scale = {
    sm: "text-base",
    md: "text-price",
    lg: "text-[1.75rem] leading-tight",
  }[size];

  if (priceType === "quote" || !price) {
    return (
      <span className={cn("font-display font-semibold text-primary", scale, className)}>
        Get Quote
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      {priceType === "starting" && (
        <span className="text-meta font-medium text-ink-subtle">Starting from</span>
      )}
      <span className={cn("font-display font-semibold text-ink", scale)}>{price}</span>
    </span>
  );
}
