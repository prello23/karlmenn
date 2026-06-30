import type { Metadata } from "next";

import { DbPageContent, getPageMetadata } from "@/components/db-page";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("um-okkur", {
    title: "Um okkur",
    description:
      "Um EkkiEinn.is — samfélag og stuðningsvettvangur fyrir karlmenn.",
  });
}

export default function AboutPage() {
  return (
    <DbPageContent
      slug="um-okkur"
      eyebrow="Um verkefnið"
      fallbackTitle="Um okkur"
      fallbackDescription="Samfélag og stuðningsvettvangur fyrir karlmenn."
    />
  );
}
