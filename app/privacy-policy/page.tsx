import type { Metadata } from "next";
import {
  LegalContact,
  LegalList,
  LegalPage,
  LegalSection,
} from "@/components/legal/LegalPage";
import { getContent } from "@/lib/content/adapter";

/**
 * Privacy policy.
 *
 * Every statement here was written against what the code actually does — the
 * WhatsApp deep links in `lib/whatsapp.ts`, the UTM capture in `lib/utm.ts`,
 * the env-gated scripts in `components/analytics/AnalyticsScripts.tsx` and the
 * Google Maps iframe in `components/VisitUs.tsx`. If any of those change, this
 * page has to change with them.
 *
 * TODO(POOJYO) — legal details this project does not hold, and which were
 * deliberately NOT invented:
 *   - registered/legal entity name (only the brand name "POOJYO" exists)
 *   - GST number and any business registration number
 *   - a contact email address (there is none anywhere in the project)
 *   - a named grievance/privacy contact, per India's DPDP Act expectations
 *   - concrete data-retention periods (see "How long we keep information")
 *   - the name of the hosting provider, once deployment is decided
 * Fill these in here and in `content.json` rather than leaving them implied.
 */

/**
 * Same ISR window as /ganpati, so the store address and phone number printed
 * on this page cannot drift from the ones on the landing page when content is
 * served from the Google Sheet.
 */
export const revalidate = 900; // 15 minutes

const UPDATED = "22 August 2026";

export const metadata: Metadata = {
  title: "Privacy Policy — POOJYO",
  description:
    "How POOJYO handles information from website visitors, WhatsApp enquiries and phone enquiries, including analytics and campaign tracking.",
  alternates: { canonical: "/privacy-policy" },
  // the root layout declares og:url as the landing page; without this override
  // every legal page would announce itself as /ganpati when shared
  openGraph: {
    title: "Privacy Policy — POOJYO",
    description: "How POOJYO handles information from website visitors, WhatsApp enquiries and phone enquiries, including analytics and campaign tracking.",
    url: "/privacy-policy",
  },
};

export default async function PrivacyPolicyPage() {
  const { config, instagram } = await getContent();

  return (
    <LegalPage
      config={config}
      instagramUrl={instagram?.profileUrl}
      title="Privacy Policy"
      updated={UPDATED}
      intro={
        <p>
          {config.brandName} is a flower, premium garland, pooja-items and decoration
          business based in Chembur, Mumbai. This page explains what information this
          website and our enquiry channels collect, and what we do with it.
        </p>
      }
    >
      <LegalSection title="The short version">
        <LegalList
          items={[
            "This website has no account, no login, no contact form, no cart and no online payment. We do not ask you to type personal details into any page.",
            "Enquiries and orders happen on WhatsApp or by phone. What you share in that conversation is what we hold.",
            "We do not sell your information to anyone.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Information collected when you visit the website">
        <p>
          Browsing the site does not require you to identify yourself. Like any website,
          the server that hosts it automatically receives standard technical information
          with each request — such as your IP address, browser and device type, the page
          requested and the date and time. This is ordinary web-server activity used to
          serve and secure the site.
        </p>
        <p>
          Product photographs, prices and text are published by us; nothing you do on the
          page is saved to an account, because there are no accounts.
        </p>
      </LegalSection>

      <LegalSection title="WhatsApp enquiries">
        <p>
          Every &ldquo;Order on WhatsApp&rdquo;, quote and catalog button opens WhatsApp
          with a message already typed for you. You choose whether to send it, and you
          send it from your own WhatsApp account.
        </p>
        <p>When you do, we receive:</p>
        <LegalList
          items={[
            "your WhatsApp number and the profile name shown on your account,",
            "whatever you write in the chat — typically your area or pincode, delivery address, preferred dates and the items you want,",
            "any photographs or references you choose to send us, which customers commonly do for custom garland and decoration quotes,",
            <>
              a short reference line appended to the end of the pre-filled message, for
              example <span className="text-ink">&ldquo;— Ref: pkg-5 | direct&rdquo;</span>.
              It records which item you tapped and, if you arrived from a campaign link,
              which campaign — so we know which advertisement led to the enquiry. It
              contains no personal information.
            </>,
          ]}
        />
        <p>
          WhatsApp is operated by Meta. Your use of it is also governed by WhatsApp&rsquo;s
          own terms and privacy policy, which we do not control.
        </p>
      </LegalSection>

      <LegalSection title="Phone and call enquiries">
        <p>
          Tapping the call button dials our store number using your own phone. We then
          see your phone number as the caller, along with anything you tell us during the
          call — usually your name, delivery area, dates and requirement. Calls are not
          recorded by this website.
        </p>
      </LegalSection>

      <LegalSection title="Campaign and source tracking (UTM)">
        <p>
          If you reach the site from an advertisement or a shared campaign link, the link
          may carry source, medium, campaign, content and term parameters. Those five
          values are stored in your browser&rsquo;s <em>session storage</em> under the key{" "}
          <span className="text-ink">poojyo_utm</span> so that the enquiry you send later
          can still be matched to the campaign that brought you.
        </p>
        <LegalList
          items={[
            "Session storage is cleared by your browser when you close the tab. It is not a cookie and it is not sent to any server by itself.",
            "The values are truncated and are campaign labels, not information about you.",
            "If you arrive directly, nothing is stored and the reference line simply reads “direct”.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Analytics and advertising measurement">
        <p>
          The site is built to run with or without analytics. Google Analytics 4 and the
          Meta Pixel each load <em>only</em> when the corresponding measurement ID has
          been configured; when it has not, no analytics script is loaded at all and no
          analytics data is collected.
        </p>
        <p>When they are enabled, the only events we record are:</p>
        <LegalList
          items={[
            "a tap on a WhatsApp button, including whether it was an order, a quote or the catalog, and which item it belonged to,",
            "selecting a multi-day package duration,",
            "a tap on the call button,",
          ]}
        />
        <p>
          Each event carries the campaign values described above. We use this to
          understand how many enquiries an advertisement produced. We do not use it to
          build a profile of you by name, and we do not upload your contact details to
          these platforms from this website.
        </p>
        <p>
          Google Analytics 4 is provided by Google and the Pixel by Meta. When enabled,
          these services may set their own cookies or identifiers in your browser and
          process data on their own terms.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and browser storage">
        <LegalList
          items={[
            "This website sets no cookies of its own.",
            "It uses session storage for the campaign values described above, and for nothing else.",
            "Google Analytics 4 and the Meta Pixel, when enabled, may set their own cookies.",
            "The Google Maps map on our “Visit us” section is embedded from Google and may set cookies or store data under Google’s terms when it loads.",
            "You can block or clear cookies and site data in your browser settings. The site continues to work if you do.",
          ]}
        />
      </LegalSection>

      <LegalSection title="How we use the information">
        <LegalList
          items={[
            "To answer your enquiry and share availability, options and pricing.",
            "To prepare, confirm and deliver your order, including on the dates you have asked for.",
            "To prepare quotations for custom garlands, decorations and mandal or bulk orders.",
            "To contact you about that order — for example if a flower is unavailable or a delivery needs rescheduling.",
            "To measure, in aggregate, which campaigns bring enquiries.",
            "To keep records required for accounting and to meet legal obligations.",
          ]}
        />
        <p>
          We do not sell, rent or trade your information, and we do not send marketing
          messages to numbers that have only enquired, unless you have asked us to.
        </p>
      </LegalSection>

      <LegalSection title="Third-party services this website actually uses">
        <LegalList
          items={[
            "WhatsApp (Meta) — enquiries and ordering.",
            "Your telephone network — calls to the store number.",
            "Google Maps — the embedded map showing the store location.",
            "Instagram (Meta) — a plain outbound link to our profile. There is no Instagram embed or script on this site, so Instagram is contacted only if you tap through.",
            "Google Analytics 4 and Meta Pixel — only when configured, as described above.",
            "Our website hosting provider, which serves the pages and keeps standard server logs.",
            "Google Sheets — optionally used by us to publish product and price text to the site. This is content we write; it carries no visitor information.",
          ]}
        />
        <p>
          The fonts used on this site are served from our own domain, so displaying the
          page does not send a request to a font provider.
        </p>
      </LegalSection>

      <LegalSection title="Sharing your information">
        <p>
          Information from your enquiry is used by our own staff to fulfil the order, and
          is shared only where that is necessary — for example, giving a delivery address
          to the person delivering your garlands, or to a service provider or authority
          where the law requires it.
        </p>
      </LegalSection>

      <LegalSection title="Data security">
        <p>
          We take reasonable steps to protect the information we hold. The website itself
          stores no customer database: it has no login, no form and no payment gateway,
          so there is no account or card data on it to lose. Order conversations sit in
          WhatsApp, which encrypts messages between you and us, on devices used by our
          store. No method of transmission or storage is completely secure, and we cannot
          guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep information">
        <p>
          Enquiry and order details are kept for as long as needed to complete the order,
          to handle anything arising from it, and to meet accounting and legal
          requirements that apply to us. Campaign values in your browser&rsquo;s session
          storage disappear when you close the tab. Analytics data, when enabled, is
          retained according to the settings of the platform providing it.
        </p>
        {/* TODO(POOJYO): state a concrete retention period here (e.g. "order records
            are kept for N years") once the business decides one with its accountant. */}
      </LegalSection>

      <LegalSection title="Your choices and rights">
        <LegalList
          items={[
            "You can ask us what information we hold about you, ask us to correct it, or ask us to delete it, subject to records we must keep by law.",
            "You can ask us to stop contacting you at any time.",
            "You can clear the site data and cookies in your browser at any time, and use your browser or device settings to limit tracking.",
            "You can choose not to send the pre-filled WhatsApp message — nothing is sent until you send it.",
          ]}
        />
        <p>To make any of these requests, contact us using the details below.</p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          This website is intended for customers placing flower, pooja and decoration
          orders, and is not directed at children.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          We may update this policy as our services or the tools we use change. The date
          at the top of this page shows when it was last revised.
        </p>
      </LegalSection>

      <LegalContact config={config} />
    </LegalPage>
  );
}
