import type { Metadata } from "next";

import { DbPageFull, getPageMetadata } from "@/components/db-page";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("forsida", {
    title: "Ekki einn — Þú ert ekki einn",
    description: "Samfélag og stuðningur fyrir karlmenn.",
  });
}

export default function HomePage() {
  return <DbPageFull slug="forsida" fallbackTitle="Þú ert ekki einn" />;
}
