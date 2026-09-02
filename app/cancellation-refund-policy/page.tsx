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
 * Cancellation & refund policy.
 *
 * The site takes no payments — there is no cart, no checkout and no payment
 * gateway anywhere in the project — so this page describes cancellation of a
 * WhatsApp-confirmed order, and says nothing about online payment processing.
 *
 * TODO(POOJYO) — deliberately NOT invented. The project defines no numbers, so
 * none appear here. Add them once the business has fixed them:
 *   - the cancellation window (how long before the delivery date)
 *   - any cancellation fee or deduction, and any refund percentage
 *   - the period within which an agreed refund is paid back
 *   - accepted refund methods
 *   - whether advances or deposits are taken, and whether they are refundable
 */

/**
 * Same ISR window as /ganpati, so the store address and phone number printed
 * on this page cannot drift from the ones on the landing page when content is
 * served from the Google Sheet.
 */
export const revalidate = 900; // 15 minutes

const UPDATED = "22 August 2026";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy — POOJYO",
  description:
    "How to cancel or reschedule a POOJYO order confirmed on WhatsApp, and how cancellation and refund eligibility is decided for fresh garlands and custom decorations.",
  alternates: { canonical: "/cancellation-refund-policy" },
  // the root layout declares og:url as the landing page; without this override
  // every legal page would announce itself as /ganpati when shared
  openGraph: {
    title: "Cancellation & Refund Policy — POOJYO",
    description: "How to cancel or reschedule a POOJYO order confirmed on WhatsApp, and how cancellation and refund eligibility is decided for fresh garlands and custom decorations.",
    url: "/cancellation-refund-policy",
  },
};

export default async function CancellationRefundPolicyPage() {
  const { config, instagram } = await getContent();

  return (
    <LegalPage
      config={config}
      instagramUrl={instagram?.profileUrl}
      title="Cancellation & Refund Policy"
      updated={UPDATED}
      intro={
        <p>
          This page explains how cancellation, rescheduling and refunds work for orders
          placed with {config.brandName}. It should be read together with our{" "}
          <Link
            href="/terms-and-conditions"
            className="text-primary underline underline-offset-4"
          >
            Terms &amp; Conditions
          </Link>
          .
        </p>
      }
    >
      <LegalSection title="How orders are placed and confirmed">
        <p>
          This website does not process payments. It has no cart, no checkout and no
          payment gateway — every order begins as a WhatsApp message or a phone call, and
          becomes an order only once we have confirmed the items, the total, the date and
          the delivery address with you.
        </p>
        <p>
          Because of that, cancellations and refunds are handled directly between you and
          our store, on the same WhatsApp chat or phone number you ordered through.
        </p>
      </LegalSection>

      <LegalSection title="How to cancel or reschedule">
        <LegalList
          items={[
            "Message us on WhatsApp, or call the store, as early as you can.",
            "Please quote the date the order was placed, the delivery date and the items, so we can find your order quickly.",
            "We will confirm in the chat what is possible for your specific order, and what — if anything — is refundable.",
          ]}
        />
        <p>
          The earlier you tell us, the more we can do. An order we have not yet begun
          preparing is the easiest to cancel or move.
        </p>
      </LegalSection>

      <LegalSection title="What cancellation eligibility depends on">
        <LegalList
          items={[
            "How far the order has progressed — not yet started, already being prepared, packed, or already dispatched or delivered.",
            "Whether the item was customised or made specially to your requirement.",
            "Whether flowers or materials have already been bought for your order.",
            "The date requested, and how close it is — festival dates are booked and stocked ahead.",
            "The terms confirmed with you at the time the order was placed.",
          ]}
        />
        <p>
          Any applicable cancellation, refund, or rescheduling terms will be confirmed
          with the customer at the time of order.
        </p>
      </LegalSection>

      <LegalSection title="Fresh garlands and made-to-order items">
        <p>
          Garlands are handmade from fresh flowers for a specific date and cannot be put
          back into stock or sold again once prepared. Once a garland has been made for
          your order, or the flowers for it have been bought that morning, cancellation
          conditions are necessarily different from an order we have not yet started.
        </p>
        <p>
          Multi-day packages deliver a fresh garland on each day of the duration. If you
          need to end or change a package part-way through, tell us as early as possible
          so the remaining days can be adjusted.
        </p>
      </LegalSection>

      <LegalSection title="Custom decorations">
        <p>
          Decoration work involves materials, flowers and labour reserved in advance for
          your date, so it carries different cancellation and rescheduling conditions from
          a garland order. Those conditions will be communicated to you before the
          decoration booking is confirmed, along with the quotation.
        </p>
      </LegalSection>

      <LegalSection title="Rescheduling">
        <p>
          We will do our best to move an order to a new date, subject to availability on
          that date. During the Ganpati festival, capacity is limited and a new date
          cannot always be offered at short notice; where it cannot, we will tell you
          honestly rather than accept a booking we cannot fulfil.
        </p>
      </LegalSection>

      <LegalSection title="If we cannot fulfil your order">
        <p>
          If we are unable to fulfil a confirmed order — for example because of a flower
          market shortage, poor flower quality on the day, or a delivery restriction
          outside our control — we will contact you as soon as we can and offer the
          closest suitable alternative, a new date, or, where you have already paid and no
          alternative works for you, a refund of the amount paid for the part we could not
          fulfil.
        </p>
      </LegalSection>

      <LegalSection title="If something is wrong with your order">
        <p>
          Please tell us on the day of delivery, with photographs if possible. Flowers are
          perishable, so a problem reported the same day can be checked and put right;
          reported days later it usually cannot. We will look at what happened and agree a
          fair resolution with you.
        </p>
      </LegalSection>

      <LegalSection title="Refunds">
        <p>
          Where a refund has been agreed, it is processed to the same method you paid by,
          and the timeline and method are confirmed with you at that time. This website
          does not collect payments, so no refund is ever processed through it.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          We may update this policy as our services change. The date at the top of this
          page shows when it was last revised.
        </p>
      </LegalSection>

      <LegalContact config={config} />
    </LegalPage>
  );
}
