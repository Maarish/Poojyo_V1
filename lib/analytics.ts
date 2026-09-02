import { GA4_ID, META_PIXEL_ID } from "@/lib/config";
import { readUtm } from "@/lib/utm";

/**
 * The whole analytics surface for V1.
 *
 * Goal: answer "₹X ad spend -> X WhatsApp enquiries". Not a dashboard.
 * With no env IDs set, every call here is a no-op and no script is ever loaded.
 */

/**
 * `catalog` is the WhatsApp product catalog (wa.me/c/…). It is a third *kind of
 * WhatsApp tap*, not a fourth event — it still reports as `whatsapp_click`, so
 * the event list stays at three.
 */
export type CtaType = "order" | "quote" | "catalog";

export type ItemType =
  | "garland"
  | "package"
  | "pooja_essential"
  | "decoration"
  | "mandal_bulk"
  | "generic";

export type TrackEvent = "whatsapp_click" | "package_select" | "call_click";

export type TrackParams = {
  cta_type?: CtaType;
  item_type?: ItemType;
  item_id?: string;
  duration_label?: string;
};

type Gtag = (command: string, ...args: unknown[]) => void;
type Fbq = ((command: string, ...args: unknown[]) => void) & { queue?: unknown[] };

declare global {
  interface Window {
    gtag?: Gtag;
    dataLayer?: unknown[];
    fbq?: Fbq;
  }
}

/**
 * Fire one event to GA4 and Meta Pixel, always stamped with the session's UTM.
 * Silent when the corresponding ID is not configured.
 */
export function track(event: TrackEvent, params: TrackParams = {}): void {
  if (typeof window === "undefined") return;

  const payload = { ...params, ...readUtm() };

  if (GA4_ID && typeof window.gtag === "function") {
    window.gtag("event", event, payload);
  }

  if (META_PIXEL_ID && typeof window.fbq === "function") {
    // WhatsApp taps are the conversion that matters; everything else is context
    if (event === "whatsapp_click") {
      window.fbq("track", params.cta_type === "quote" ? "Lead" : "Contact", payload);
    } else if (event === "call_click") {
      window.fbq("track", "Contact", payload);
    } else {
      window.fbq("trackCustom", event, payload);
    }
  }
}
