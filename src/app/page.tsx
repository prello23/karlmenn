import type { Metadata } from "next";

import { DbPageFull, getPageMetadata } from "@/components/db-page";
import { NafnaleitClient } from "./nafnaleit/NafnaleitClient";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("forsida", {
    title: "Ekki einn — Þú ert ekki einn",
    description: "Samfélag og stuðningur fyrir karlmenn.",
  });
}

export default function HomePage() {
  return (
    <>
      <DbPageFull slug="forsida" fallbackTitle="Þú ert ekki einn" />

      {/* Embedded perpetrator-registry search widget */}
      <section className="pb-16">
        <div className="container">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="mx-auto max-w-lg text-center">
              <h2 className="text-2xl font-semibold">Er gerandi skráður?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sláðu inn nafn til að athuga hvort það sé skráð. Niðurstaðan er
                einfalt Já eða Nei — skráin sjálf er aldrei birt.
              </p>
            </div>
            <div className="mt-6">
              <NafnaleitClient />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
