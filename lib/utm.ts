/**
 * UTM capture.
 *
 * Params are read once on landing and kept in sessionStorage, so a visitor who
 * arrives from an ad and then scrolls, taps around, and finally opens WhatsApp
 * still carries the campaign that brought them. No cookies, no backend.
 */

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type Utm = Partial<Record<UtmKey, string>>;

const STORAGE_KEY = "poojyo_utm";

/** read UTM params off the current URL and persist them for the session */
export function captureUtm(): Utm {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const fromUrl: Utm = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) fromUrl[key] = value.slice(0, 120);
  }

  // a fresh campaign click always wins over whatever the session already held
  if (Object.keys(fromUrl).length > 0) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
    } catch {
      // private mode / storage disabled — the params still work for this render
    }
    return fromUrl;
  }

  return readUtm();
}

/** the UTM set for this session, or {} when the visit was direct */
export function readUtm(): Utm {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Utm) : {};
  } catch {
    return {};
  }
}

/**
 * The compact attribution suffix appended to every WhatsApp message.
 * Falls back to "direct" so the line is always present and always parseable.
 *
 *   — Ref: pkg-5 | fb/ganpati-garland-aug
 *   — Ref: premium-marigold | direct
 */
export function attributionRef(itemId: string, utm: Utm = readUtm()): string {
  const source = utm.utm_source?.trim();
  const campaign = utm.utm_campaign?.trim();
  const tail = source ? (campaign ? `${source}/${campaign}` : source) : "direct";
  return `— Ref: ${itemId || "generic"} | ${tail}`;
}
