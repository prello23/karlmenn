import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://ekkieinn.is",
  ),
  title: {
    default: "Ekki einn — Þú ert ekki einn",
    template: "%s — Ekki einn",
  },
  description:
    "Samfélag og stuðningur fyrir karlmenn. Öruggt rými fyrir þá sem hafa orðið fyrir ofbeldi, verið logið uppá, þurfa aðstoð eða vilja breyta hegðun sinni.",
  keywords: [
    "karlmenn",
    "stuðningur",
    "geðheilsa",
    "ofbeldi",
    "Ísland",
    "samfélag",
  ],
  openGraph: {
    title: "Ekki einn — Þú ert ekki einn",
    description: "Samfélag og stuðningur fyrir karlmenn.",
    locale: "is_IS",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F1117",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="is" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <div className="flex min-h-dvh flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
