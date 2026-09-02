/**
 * The legal routes, in the order they appear in the footer.
 *
 * One list, imported by the footer, the legal page shell and the sitemap, so a
 * route can never be linked from one place and missing from another.
 */
export const LEGAL_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/cancellation-refund-policy", label: "Cancellation & Refund Policy" },
] as const;

export type LegalLink = (typeof LEGAL_LINKS)[number];
