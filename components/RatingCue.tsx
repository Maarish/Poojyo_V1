import { cn } from "@/lib/cn";
import type { Config } from "@/lib/content/types";
import { StarGlyph } from "./icons";

/**
 * "★ [RATING] on Google ([COUNT])".
 *
 * The rating and count are whatever the content source says — placeholders
 * included. Nothing is invented, and no live reviews API is called.
 */
export function RatingCue({
  config,
  className,
  tone = "default",
}: {
  config: Config;
  className?: string;
  tone?: "default" | "quiet";
}) {
  const { googleRating, googleReviewCount, googleProfileUrl } = config;
  if (!googleRating) return null;

  const label = googleReviewCount
    ? `${googleRating} on Google (${googleReviewCount})`
    : `${googleRating} on Google`;

  const body = (
    <>
      {/* gold is reserved for the star, the savings badge and the logo ring */}
      <StarGlyph className="text-gold" />
      <span>{label}</span>
    </>
  );

  const classes = cn(
    "inline-flex items-center gap-1.5 text-small font-medium",
    tone === "quiet" ? "text-ink-muted" : "text-ink",
    className
  );

  const isRealUrl = /^https?:\/\//i.test(googleProfileUrl);

  if (!isRealUrl) {
    return <span className={classes}>{body}</span>;
  }

  return (
    <a
      href={googleProfileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(classes, "underline-offset-4 hover:underline")}
    >
      {body}
    </a>
  );
}
