import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],

    /**
     * Any https host is allowed.
     *
     * Content edited in the Google Sheet arrives as pasted image URLs, and an
     * allow-list meant every new host silently 400'd until someone edited this
     * file and redeployed — a code change to publish a photo. The trade-off is
     * that the optimizer will fetch and cache an image from any https URL that
     * gets into the content, so treat write access to the Sheet as trusted.
     *
     * `lib/images.ts` additionally rewrites Google Drive and Dropbox *share*
     * links to their direct-image equivalents, since those render an HTML page
     * rather than image bytes and are the usual reason a pasted URL "doesn't
     * work".
     */
    remotePatterns: [{ protocol: "https", hostname: "**" }],

    /**
     * Photography may carry a query string; everything else may not.
     *
     * Next 16 defaults `localPatterns` to `[{ pathname: "**", search: "" }]`,
     * which rejects any local `src` with a `?`. `lib/images.ts` stamps every
     * resolved photo with `?v=<file mtime>` — that stamp is what makes a
     * replaced file a new URL, so the swap shows up on reload instead of after
     * clearing `.next/dev/cache/images` by hand.
     *
     * Scoped to the two photo folders rather than opened globally: an
     * unbounded query string is an unbounded number of optimizer cache
     * entries, and there is no reason for anything outside these to need one.
     */
    localPatterns: [
      { pathname: "/images/**" },
      { pathname: "/brand/**" },
      { pathname: "/**", search: "" },
    ],
  },
  poweredByHeader: false,

  /**
   * `/` serves the /ganpati landing page rather than redirecting to it — ad
   * traffic should not pay for an extra round trip. A rewrite (not a redirect)
   * keeps one page file, one ISR window and one canonical URL.
   */
  async rewrites() {
    return [{ source: "/", destination: "/ganpati" }];
  },
};

export default nextConfig;
