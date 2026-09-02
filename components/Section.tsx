import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

/**
 * Shared section shell: consistent vertical rhythm, heading hierarchy and
 * optional sunk background band. Sections stay uncluttered by construction.
 */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  tone = "plain",
  className,
  headingClassName,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  children: ReactNode;
  tone?: "plain" | "sunk";
  className?: string;
  headingClassName?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-section-y",
        tone === "sunk" && "bg-surface-sunk border-y border-line",
        className
      )}
    >
      <div className="container-page">
        {(eyebrow || title || intro) && (
          <Reveal className={cn("max-w-prose", headingClassName)}>
            {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
            {title && <h2 className="text-h2 font-display text-ink">{title}</h2>}
            {intro && <p className="mt-4 text-lead text-ink-muted">{intro}</p>}
          </Reveal>
        )}
        <div className={cn(eyebrow || title || intro ? "mt-10 md:mt-12" : undefined)}>
          {children}
        </div>
      </div>
    </section>
  );
}
