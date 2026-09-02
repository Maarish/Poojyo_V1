import type { MetadataRoute } from "next";
import { LEGAL_LINKS } from "@/components/legal/links";
import { CANONICAL_PATH, SITE_URL } from "@/lib/config";

/** the canonical marketing route — `/` is a duplicate of it — plus the legal pages */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}${CANONICAL_PATH}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    // listed so they can be found and indexed, at a priority that keeps them
    // well below the page that actually converts
    ...LEGAL_LINKS.map((link) => ({
      url: `${SITE_URL}${link.href}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
