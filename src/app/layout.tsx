import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
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
  icons: {
    icon: "/favicon-32x32.png",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Ekki einn — Þú ert ekki einn",
    description: "Samfélag og stuðningur fyrir karlmenn.",
    locale: "is_IS",
    type: "website",
    images: ["/logo.png"],
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
        <Script
          data-name="BMC-Widget"
          data-cfasync="false"
          src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
          data-id="ekkieinn"
          data-description="Styðja EkkiEinn.is"
          data-message="Ef þér líst vel á þennan vettvang, gefðu okkur stuðning!"
          data-color="#1a56db"
          data-position="Right"
          data-x_margin="18"
          data-y_margin="18"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
