import type { Metadata } from "next";

import { DbPageFull, getPageMetadata } from "@/components/db-page";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("personuvernd", {
    title: "Persónuvernd",
    description: "Persónuverndarstefna EkkiEinn.is.",
  });
}

export default function PrivacyPage() {
  return <DbPageFull slug="personuvernd" fallbackTitle="Persónuverndarstefna" />;
}
