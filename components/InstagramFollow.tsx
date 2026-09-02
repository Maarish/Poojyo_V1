import type { Instagram } from "@/lib/content/types";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { InstagramGlyph } from "./icons";

/**
 * One button out to the profile. That is the whole section.
 *
 * It used to carry a grid of reel covers under a "Follow our work on Instagram"
 * heading. Those are gone: four 9:16 tiles is a lot of page and a lot of image
 * weight spent on sending people somewhere else, in the middle of a page whose
 * only job is a WhatsApp order. The link still belongs here — just not the
 * gallery.
 *
 * No `instagram.com/embed.js`, no oEmbed, no iframe, same as before: an embed
 * costs several hundred KB of third-party JavaScript and would sink the mobile
 * Lighthouse score on its own.
 *
 * The click is intentionally *not* passed to `track()`. This is a link to
 * another origin, which GA4 enhanced measurement already records as `click`
 * (outbound); a custom event would double-count it and add a fourth event to a
 * spec that is deliberately three.
 */
export function InstagramFollow({ instagram }: { instagram: Instagram }) {
  const handle = instagram.handle ? `@${instagram.handle.replace(/^@/, "")}` : "";

  return (
    <Section id="instagram">
      <Reveal>
        <div className="flex justify-center">
          <a
            href={instagram.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary w-full sm:w-auto"
          >
            <InstagramGlyph />
            {handle ? `Follow ${handle}` : "Follow us on Instagram"}
          </a>
        </div>
      </Reveal>
    </Section>
  );
}
