import type { Metadata } from "next";

import { DbPageFull, getPageMetadata } from "@/components/db-page";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("skilmalar", {
    title: "Skilmálar",
    description: "Notkunarskilmálar EkkiEinn.is.",
  });
}

export default function TermsPage() {
  return <DbPageFull slug="skilmalar" fallbackTitle="Notkunarskilmálar" />;
}
