import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { UtmCapture } from "@/components/analytics/UtmCapture";
import { CANONICAL_PATH, SITE_URL } from "@/lib/config";
import "./globals.css";

/* Two families, limited weights — the type system in full. */
const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-display",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "POOJYO — Premium Ganpati Flower Garlands, Chembur Mumbai",
  description:
    "Fresh, handcrafted premium flower garlands for your Ganpati at home. Multi-day garland packages, pooja essentials and decorations. Order on WhatsApp.",
  // `/` and `/ganpati` render identical content, so both point at one canonical
  alternates: { canonical: CANONICAL_PATH },
  openGraph: {
    type: "website",
    siteName: "POOJYO",
    title: "POOJYO — Premium Ganpati Flower Garlands",
    description:
      "Fresh, handcrafted premium flower garlands for your Ganpati at home. Order on WhatsApp.",
    url: CANONICAL_PATH,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FBF7F0",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // required for env(safe-area-inset-*) on notched devices
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable}`}>
      <body>
        <UtmCapture />
        {children}
        <AnalyticsScripts />
      </body>
    </html>
  );
}
