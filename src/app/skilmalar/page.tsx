import type { Metadata } from "next";

import { DbPageContent, getPageMetadata } from "@/components/db-page";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("skilmalar", {
    title: "Skilmálar",
    description: "Notkunarskilmálar EkkiEinn.is.",
  });
}

export default function TermsPage() {
  return (
    <DbPageContent
      slug="skilmalar"
      eyebrow="Skilmálar"
      fallbackTitle="Notkunarskilmálar"
      fallbackDescription="Skilmálar fyrir notkun á EkkiEinn.is."
    />
  );
}
