import { isRealPhoneNumber } from "@/lib/content/schema";
import { CANONICAL_PATH, SITE_URL } from "@/lib/config";
import type { Config, Instagram } from "@/lib/content/types";

/**
 * LocalBusiness structured data for the POOJYO store.
 *
 * Rendered on the landing page ONLY, so the site declares exactly one business.
 *
 * Everything here is derived from the content source rather than restated, so
 * editing the address or the hours in content.json (or the Sheet) updates the
 * schema too. Every field is omitted when its source value is missing or is
 * still a placeholder — an absent property is fine, a wrong one is not.
 *
 * Deliberately absent: aggregateRating, review, priceRange, email and any
 * social profile the project does not already hold. None of those exist as
 * verified data here, and inventing them in schema is exactly the kind of thing
 * that earns a manual action.
 */

/**
 * Store coordinates.
 *
 * Taken from the `!3d…!4d…` pair inside `config.getDirectionsUrl`, which is the
 * Google Maps link for the store itself — not looked up or approximated. They
 * are pinned here rather than parsed out of that URL at runtime because a
 * hand-edited maps link should never be able to move the pin silently.
 */
const GEO = { latitude: 19.0642971, longitude: 72.8950794 };

const DAYS: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};
const ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** "9:00 AM" -> "09:00", "9:30 PM" -> "21:30"; null when it is not a time */
function to24Hour(value: string): string | null {
  const m = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)$/i);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = m[2] ?? "00";
  const pm = /^p/i.test(m[3]);
  if (hour === 12) hour = 0;
  if (pm) hour += 12;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

/**
 * "Mon–Sun, 9:00 AM – 9:30 PM" -> one openingHoursSpecification.
 * Returns null the moment anything does not parse, so the schema simply carries
 * no hours rather than carrying hours the store does not keep.
 */
function openingHours(storeHours: string) {
  const [dayPart, ...rest] = storeHours.split(",");
  const timePart = rest.join(",");
  if (!dayPart || !timePart) return null;

  const dayNames = dayPart.trim().toLowerCase().split(/\s*[–—-]\s*/);
  const startIndex = ORDER.indexOf(dayNames[0]?.slice(0, 3) ?? "");
  const endIndex = ORDER.indexOf(dayNames[1]?.slice(0, 3) ?? dayNames[0]?.slice(0, 3) ?? "");
  if (startIndex === -1 || endIndex === -1) return null;

  const days: string[] = [];
  for (let i = startIndex; ; i = (i + 1) % ORDER.length) {
    days.push(DAYS[ORDER[i]]);
    if (i === endIndex || days.length > 7) break;
  }

  const [openRaw, closeRaw] = timePart.split(/\s*[–—]\s*/);
  const opens = openRaw ? to24Hour(openRaw) : null;
  const closes = closeRaw ? to24Hour(closeRaw) : null;
  if (!opens || !closes) return null;

  return { "@type": "OpeningHoursSpecification", dayOfWeek: days, opens, closes };
}

/**
 * Split the single address string into the postal fields Google prefers.
 *
 * "No. 94/A, Shell Colony Road, Sai Baba Nagar, Chembur, Mumbai, Maharashtra 400071"
 *   street  -> everything before the city
 *   city    -> "Mumbai"
 *   region  -> "Maharashtra", postalCode -> "400071"
 *
 * If the trailing "<Region> <PIN>" shape is not there, the whole string goes in
 * streetAddress unsplit — still valid, just less granular.
 */
function postalAddress(storeAddress: string) {
  const parts = storeAddress.split(",").map((p) => p.trim()).filter(Boolean);
  const base = { "@type": "PostalAddress", addressCountry: "IN" };

  const tail = parts[parts.length - 1] ?? "";
  const tailMatch = tail.match(/^(.+?)\s+(\d{6})$/);
  const cityIndex = parts.length - 2;
  const city = cityIndex >= 0 ? parts[cityIndex] : "";

  if (!tailMatch || !city) {
    return { ...base, streetAddress: storeAddress };
  }

  return {
    ...base,
    streetAddress: parts.slice(0, cityIndex).join(", "),
    addressLocality: city,
    addressRegion: tailMatch[1],
    postalCode: tailMatch[2],
  };
}

export function LocalBusinessJsonLd({
  config,
  instagram,
}: {
  config: Config;
  /** null when the section is disabled — then no sameAs is emitted */
  instagram: Instagram | null;
}) {
  const hours = config.storeHours ? openingHours(config.storeHours) : null;
  const phone = isRealPhoneNumber(config.phoneNumber)
    ? `+${config.phoneNumber.replace(/\D/g, "")}`
    : null;

  // only profiles the project actually holds; empty strings are dropped
  const sameAs = [instagram?.profileUrl, config.googleProfileUrl].filter(
    (url): url is string => Boolean(url)
  );

  const schema = {
    "@context": "https://schema.org",
    // Florist is schema.org's own LocalBusiness > Store subtype, and is the
    // closest supported type to a flower and garland business.
    "@type": "Florist",
    name: config.storeName || config.brandName,
    url: `${SITE_URL}${CANONICAL_PATH}`,
    ...(config.tagline ? { description: config.tagline } : {}),
    // the brand lockup, at a stable public path — not the hashed OG route
    image: `${SITE_URL}/brand/logo-stacked.png`,
    logo: `${SITE_URL}/brand/logo-stacked.png`,
    ...(phone ? { telephone: phone } : {}),
    ...(config.storeAddress ? { address: postalAddress(config.storeAddress) } : {}),
    geo: { "@type": "GeoCoordinates", ...GEO },
    ...(hours ? { openingHoursSpecification: [hours] } : {}),
    ...(config.getDirectionsUrl ? { hasMap: config.getDirectionsUrl } : {}),
    // stated by config.deliveryMumbai ("Mumbai-wide delivery available")
    ...(config.deliveryMumbai ? { areaServed: { "@type": "City", name: "Mumbai" } } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  return (
    <script
      type="application/ld+json"
      // `<` is escaped so a stray "</script>" inside any content value can never
      // close this tag early
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
