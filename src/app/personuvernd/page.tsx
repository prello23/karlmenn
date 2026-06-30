import type { Metadata } from "next";

import { DbPageContent, getPageMetadata } from "@/components/db-page";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("personuvernd", {
    title: "Persónuvernd",
    description: "Persónuverndarstefna EkkiEinn.is.",
  });
}

export default function PrivacyPage() {
  return (
    <DbPageContent
      slug="personuvernd"
      eyebrow="Persónuvernd"
      fallbackTitle="Persónuverndarstefna"
      fallbackDescription="Hvernig við meðhöndlum gögn."
    />
  );
}
