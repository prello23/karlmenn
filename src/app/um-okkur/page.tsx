import type { Metadata } from "next";

import { DbPageFull, getPageMetadata } from "@/components/db-page";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("um-okkur", {
    title: "Um okkur",
    description:
      "Um EkkiEinn.is — samfélag og stuðningsvettvangur fyrir karlmenn.",
  });
}

export default function AboutPage() {
  return <DbPageFull slug="um-okkur" fallbackTitle="Um okkur" />;
}
