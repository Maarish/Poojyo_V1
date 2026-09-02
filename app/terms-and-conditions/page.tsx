import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalContact,
  LegalList,
  LegalPage,
  LegalSection,
} from "@/components/legal/LegalPage";
import { getContent } from "@/lib/content/adapter";

/**
 * Terms & conditions.
 *
 * Business rules here are printed from `config` wherever the project already
 * states them — the advance-booking notice, both delivery lines and the
 * decoration deadline are rendered verbatim rather than re-worded, so editing
 * the content source updates the terms too.
 *
 * TODO(POOJYO) — deliberately NOT invented, because the project defines none of
 * them. Add each once the business has decided it:
 *   - legal entity name, GST number, business registration details
 *   - accepted payment methods, advance/deposit rules, payment timing
 *   - delivery charge amounts and the areas each applies to
 *   - cancellation windows, cancellation fees and refund percentages
 *   - the city whose courts have exclusive jurisdiction
 *   - any warranty or freshness guarantee wording
 */

/**
 * Same ISR window as /ganpati, so the store address and phone number printed
 * on this page cannot drift from the ones on the landing page when content is
 * served from the Google Sheet.
 */
export const revalidate = 900; // 15 minutes

const UPDATED = "22 August 2026";

export const metadata: Metadata = {
  title: "Terms & Conditions — POOJYO",
  description:
    "Terms for ordering POOJYO garlands, multi-day Ganpati packages, pooja essentials and decorations, including booking timelines, delivery and quotations.",
  alternates: { canonical: "/terms-and-conditions" },
  // the root layout declares og:url as the landing page; without this override
  // every legal page would announce itself as /ganpati when shared
  openGraph: {
    title: "Terms & Conditions — POOJYO",
    description: "Terms for ordering POOJYO garlands, multi-day Ganpati packages, pooja essentials and decorations, including booking timelines, delivery and quotations.",
    url: "/terms-and-conditions",
  },
};

export default async function TermsAndConditionsPage() {
  const { config, instagram } = await getContent();

  return (
    <LegalPage
      config={config}
      instagramUrl={instagram?.profileUrl}
      title="Terms & Conditions"
      updated={UPDATED}
      intro={
        <p>
          These terms apply to orders and enquiries placed with {config.brandName} through
          this website, WhatsApp or by phone. Please read them before confirming an order.
        </p>
      }
    >
      <LegalSection title="What we offer">
        <LegalList
          items={[
            "Premium flower garlands, Ganpati garlands and custom garlands made to order.",
            "Multi-day Ganpati garland packages, with a fresh garland for each day of the duration you choose.",
            "Pooja essentials such as durva, loose flowers, kumkum, camphor, agarbathi and haldi.",
            "Ganpati decorations — home setups, mandap and backdrop work, chowki decoration, and door or entrance flowers.",
            "Large garlands, pooja items and bulk festival orders for Ganpati mandals.",
          ]}
        />
      </LegalSection>

      <LegalSection title="How orders are placed">
        <p>
          This website is a catalogue. It has no cart, no checkout and no online payment.
          Every button leads to a WhatsApp chat or a phone call, where the actual order is
          discussed.
        </p>
        <LegalList
          items={[
            "Tapping an order or quote button opens WhatsApp with a message prepared for you; you send it from your own account.",
            "Sending that message is an enquiry, not a confirmed order.",
            "An order exists only once we have confirmed the items, the total, the delivery date and the address with you on WhatsApp or by phone.",
            "We may decline or be unable to accept an enquiry — for example when a flower is unavailable or the date is already fully booked.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Pricing and quotations">
        <LegalList
          items={[
            "Prices shown on the website are indicative and may change with the flower market, the season and the size or design you choose.",
            "Some items show a fixed price, some show a starting-from price, and some are quoted only after we understand the requirement.",
            "Custom garlands, decorations and mandal or bulk orders are always quoted individually.",
            "The price that applies to your order is the total we confirm with you on WhatsApp before the order is confirmed — not the figure on the page.",
            "A quotation we share is valid for the requirement and dates discussed at that time.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Availability">
        <p>
          Flowers are a natural, perishable and seasonal product. Items are made to order,
          and some are marked seasonal and subject to availability. Availability is
          confirmed at the time of order, and during the Ganpati festival dates capacity
          is limited and fills early.
        </p>
      </LegalSection>

      <LegalSection title="Booking timelines">
        <LegalList
          items={[
            config.garlandBookingNotice ? (
              <>
                <span className="text-ink">Premium garlands:</span>{" "}
                {config.garlandBookingNotice}.
              </>
            ) : null,
            <>
              <span className="text-ink">Multi-day packages:</span> the start date, the
              duration and the daily delivery arrangement are confirmed with you when the
              package is booked. A package runs for the duration you have chosen, from the
              date you confirm.
            </>,
            <>
              <span className="text-ink">Decorations:</span> decoration work must be
              pre-booked, because materials and labour are arranged in advance.
            </>,
            config.decorationDeadline ? (
              <>
                <span className="text-ink">Decoration pre-booking closes{" "}
                {config.decorationDeadline}.</span>{" "}
                Requests after that date can only be accepted if we still have capacity.
              </>
            ) : null,
            <>
              <span className="text-ink">Mandal and bulk orders:</span> please contact us
              as early as possible, as these need planning and stock to be reserved.
            </>,
          ].filter(Boolean)}
        />
      </LegalSection>

      <LegalSection title="Custom decorations">
        <p>
          Decoration work is quoted after we understand your space. We will normally ask
          for reference photographs, the approximate size of the area, your requirement
          and the date. We then share the available options and a quotation.
        </p>
        <p>
          Decoration work is confirmed only once the quotation and the date have been
          agreed with you.
        </p>
      </LegalSection>

      <LegalSection title="Delivery">
        <LegalList
          items={[
            config.deliveryChembur || null,
            config.deliveryMumbai || null,
            "Any delivery charge that applies to your address is confirmed with you before the order is confirmed.",
            "Delivery timing during the Ganpati festival depends on traffic, road restrictions and processions in your area; we will keep you informed if a delivery is running late.",
          ].filter(Boolean)}
        />
      </LegalSection>

      <LegalSection title="Your delivery details">
        <p>
          You are responsible for giving us complete and correct delivery details — the
          full address with landmark and pincode, a contact number that will be reachable,
          and the correct date and time. Please tell us as early as possible if anything
          changes.
        </p>
        <p>
          If a delivery fails because the address or contact number was incorrect, or
          because nobody was available to receive a fresh, perishable order at the agreed
          address, we may not be able to remake or redeliver it at no cost.
        </p>
      </LegalSection>

      <LegalSection title="Natural product variation">
        <p>
          Photographs on this website show our own work and are indicative. Because every
          garland and decoration is handmade from fresh flowers, the exact shade, size,
          flower mix and finish will vary from one batch to the next and from the
          photograph shown. Where a specific flower is unavailable, we will offer the
          closest suitable alternative before proceeding.
        </p>
      </LegalSection>

      <LegalSection title="Payment and order confirmation">
        <p>
          No payment is taken through this website. Payment method and timing are agreed
          directly with you when your order is confirmed, and your order is treated as
          confirmed once we have confirmed it with you on WhatsApp or by phone.
        </p>
      </LegalSection>

      <LegalSection title="Cancellation, rescheduling and refunds">
        <p>
          Any applicable cancellation, refund, or rescheduling terms will be confirmed
          with the customer at the time of order. Because garlands are made fresh for a
          specific date, and decorations require materials and labour to be arranged in
          advance, the conditions differ by item and by how far the order has progressed.
        </p>
        <p>
          See our{" "}
          <Link
            href="/cancellation-refund-policy"
            className="text-primary underline underline-offset-4"
          >
            Cancellation &amp; Refund Policy
          </Link>{" "}
          for how this works.
        </p>
      </LegalSection>

      <LegalSection title="Circumstances outside our control">
        <p>
          Flowers depend on daily market supply. We are not liable for delay or
          non-performance caused by events beyond our reasonable control — including
          flower market shortages or crop failure, unusually poor flower quality on the
          day, weather, transport disruption, strikes or bandhs, civic or police
          restrictions during festival processions, power or network failure, or any
          government order. If this affects your order, we will contact you as soon as we
          can and agree the best alternative available.
        </p>
      </LegalSection>

      <LegalSection title="Our photographs and content">
        <p>
          The photographs, text, designs and branding on this website belong to{" "}
          {config.brandName} and may not be copied or used commercially without our
          permission.
        </p>
      </LegalSection>

      <LegalSection title="Links to other services">
        <p>
          This site links out to WhatsApp, Instagram and Google Maps. Those services are
          run by other companies under their own terms, and we are not responsible for
          their content or availability.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These terms are governed by the laws of India, and any dispute will be dealt
          with by the courts having jurisdiction over the location of our store.
        </p>
        {/* TODO(POOJYO): if you want exclusive jurisdiction named (typically the city
            of the registered place of business), state that city here explicitly. */}
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <p>
          We may update these terms as our services change. The date at the top of this
          page shows when they were last revised, and the version published here at the
          time you place an order is the one that applies to it.
        </p>
      </LegalSection>

      <LegalContact config={config} />
    </LegalPage>
  );
}
