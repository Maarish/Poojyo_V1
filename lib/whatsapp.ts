import { isRealPhoneNumber } from "@/lib/content/schema";
import type { Decoration, Garland, MandalBulk, Package } from "@/lib/content/types";
import { attributionRef, type Utm } from "@/lib/utm";

/**
 * WhatsApp is the only ordering channel, so these templates are the checkout.
 * Each one leaves blanks for the customer to fill in inside the chat, and ends
 * with a compact attribution line for POOJYO.
 */

export type MessageContext =
  | { kind: "generic" }
  | { kind: "garland"; garland: Garland }
  | { kind: "package"; pkg: Package }
  | { kind: "pooja_essentials" }
  | { kind: "decoration"; decoration: Decoration }
  | { kind: "mandal_bulk"; mandalBulk: MandalBulk };

/** the price string as it should read inside a message */
function priceForMessage(priceType: Garland["priceType"], price: string): string {
  if (priceType === "quote" || !price) return "price on request";
  if (priceType === "starting") return `from ${price}`;
  return price;
}

export function buildMessage(context: MessageContext): { body: string; itemId: string } {
  switch (context.kind) {
    case "garland": {
      const { garland } = context;
      if (garland.whatsappMessageOverride) {
        return { body: garland.whatsappMessageOverride, itemId: garland.id };
      }
      if (garland.priceType === "quote") {
        return {
          itemId: garland.id,
          body: [
            `Hi POOJYO 🙏 I'd like a quote for a ${garland.name}.`,
            "Flowers/colours preferred: ______",
            "Size/length: ______",
            "Area/Pincode: ______",
            "Preferred date: ______",
            "Please share options & pricing.",
          ].join("\n"),
        };
      }
      return {
        itemId: garland.id,
        body: [
          `Hi POOJYO 🙏 I'd like to order: ${garland.name} (${priceForMessage(
            garland.priceType,
            garland.price
          )}).`,
          "Area/Pincode: ______",
          "Preferred delivery date: ______",
          "Would also like to add pooja essentials? (yes/no)",
          "Please confirm availability & total.",
        ].join("\n"),
      };
    }

    case "package": {
      const { pkg } = context;
      return {
        itemId: pkg.id,
        body: [
          `Hi POOJYO 🙏 I'd like to book the ${pkg.durationLabel} Premium Garland Package (${pkg.garlandCount} garlands).`,
          `Package price shown: ${pkg.packagePrice}`,
          "Area/Pincode: ______",
          "Ganpati start date: ______",
          "Deliver a fresh garland each day? (yes/no)",
          "Add pooja essentials to the same order? (yes/no)",
          "Please confirm availability & final total.",
        ].join("\n"),
      };
    }

    case "pooja_essentials":
      return {
        itemId: "pooja-essentials",
        body: [
          "Hi POOJYO 🙏 Along with my garland order I'd like to add pooja essentials: ______ (e.g. durva, flowers, kumkum, camphor, agarbathi).",
          "Area/Pincode: ______",
          "Preferred date: ______",
        ].join("\n"),
      };

    case "decoration": {
      const { decoration } = context;
      return {
        itemId: decoration.id,
        body: [
          "Hi POOJYO 🙏 I'd like a custom Ganpati decoration quote. I'll share reference photos here.",
          `Decoration type: ${decoration.name}`,
          "Area/Pincode: ______",
          "Preferred date: ______",
          "Approx. size/space: ______",
          "Requirement: ______",
          "Please share available options & quotation.",
        ].join("\n"),
      };
    }

    /**
     * Mandals and sarvajanik / society public Ganpati — one big community
     * murti, one organiser ordering for all of it.
     *
     * The sheet's `whatsappMessage` wins when it is filled in; the fallback
     * below is what has to be known before that order can be quoted at all, so
     * an empty cell costs a line of formatting rather than the enquiry.
     */
    case "mandal_bulk":
      return {
        itemId: "mandal-bulk",
        body:
          context.mandalBulk.whatsappMessage ||
          [
            "Hi POOJYO 🙏 We'd like a quote for a community Ganpati order.",
            "Mandal / Society name: ______",
            "Type (mandal / sarvajanik society): ______",
            "Number of garlands needed: ______",
            "Bulk pooja items needed: ______",
            "Decoration required? (yes/no): ______",
            "Area/Pincode: ______",
            "Ganpati start date: ______",
            "Duration (number of days): ______",
            "Please share options, bulk pricing & delivery plan.",
          ].join("\n"),
      };

    case "generic":
    default:
      return {
        itemId: "generic",
        body: "Hi POOJYO 🙏 I'd like to place a Ganpati garland order.",
      };
  }
}

/**
 * Build the wa.me deep link, attribution line included.
 *
 * Returns null when the number is still a placeholder, so a button can render
 * disabled rather than sending a customer to a dead chat.
 */
export function buildWhatsAppUrl(
  whatsappNumber: string,
  context: MessageContext,
  utm?: Utm
): string | null {
  if (!isRealPhoneNumber(whatsappNumber)) return null;

  const { body, itemId } = buildMessage(context);
  const message = `${body}\n\n${attributionRef(itemId, utm)}`;
  const digits = whatsappNumber.replace(/\D/g, "");

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Deep link to the business's WhatsApp catalog.
 *
 * Derived from the same number as every other CTA — `wa.me/c/<digits>` — so the
 * catalog can never drift from the chat it belongs to, and so it disables
 * itself alongside the rest while the number is still a placeholder.
 */
export function buildWhatsAppCatalogUrl(whatsappNumber: string): string | null {
  if (!isRealPhoneNumber(whatsappNumber)) return null;
  return `https://wa.me/c/${whatsappNumber.replace(/\D/g, "")}`;
}

/** tel: link, or null while the number is a placeholder */
export function buildTelUrl(phoneNumber: string): string | null {
  if (!isRealPhoneNumber(phoneNumber)) return null;
  const digits = phoneNumber.replace(/[^\d+]/g, "");
  return `tel:${digits.startsWith("+") ? digits : `+${digits}`}`;
}
