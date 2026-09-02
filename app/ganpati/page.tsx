import type { Metadata } from "next";
import { Landing } from "@/components/Landing";
import { LocalBusinessJsonLd } from "@/components/LocalBusinessJsonLd";
import { CANONICAL_PATH } from "@/lib/config";
import { getContent } from "@/lib/content/adapter";

/**
 * ISR window, in seconds.
 *
 * Next requires this to be a literal it can read statically, so it cannot come
 * from an env var — change the number here to change how long content is
 * cached. Google Sheet edits appear only after this window elapses; they are
 * NOT instant.
 */
export const revalidate = 900; // 15 minutes

export const metadata: Metadata = {
  alternates: { canonical: CANONICAL_PATH },
};

export default async function GanpatiPage() {
  const content = await getContent();
  return (
    <>
      {/* the site's single LocalBusiness declaration — `/` renders this same
          page, and the legal pages deliberately carry no business schema */}
      <LocalBusinessJsonLd config={content.config} instagram={content.instagram} />
      <Landing content={content} />
    </>
  );
}
