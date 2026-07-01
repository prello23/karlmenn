import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

import { DbPageFull, getPageMetadata } from "@/components/db-page";

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

      {/* Prominent link to the perpetrator-registry search */}
      <section className="pb-16">
        <div className="container">
          <Link
            href="/nafnaleit"
            className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40 hover:bg-surface sm:flex-row sm:items-center sm:gap-5"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Er Gerandi skráður?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Athugaðu hvort nafn geranda sé skráð í gagnagrunn okkar.
              </p>
            </div>
            <span className="text-sm font-medium text-primary group-hover:underline">
              Leita →
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
