import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Lock, ChevronRight } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { Badge } from "@/components/ui/badge";
import { getCategoriesWithCounts } from "@/lib/forum";
import { requireUser } from "@/lib/auth-helpers";
import { getPageMetadata } from "@/components/db-page";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("samfelag", {
    title: "Samfélag",
    description:
      "Spjallsvæði fyrir karlmenn — deildu reynslu, fáðu ráð og finndu fólk í sömu stöðu.",
  });
}

export const dynamic = "force-dynamic";

export default async function ForumPage() {
  await requireUser("/samfelag");
  const categories = await getCategoriesWithCounts();

  return (
    <>
      <PageHero
        eyebrow="Samfélag"
        title="Spjallsvæði"
        description="Öruggt rými til að deila reynslu og styðja hvern annan. Nöfn eru sjálfkrafa fjarlægð úr færslum til að vernda alla."
      />

      <section className="py-14">
        <div className="container">
          <div className="grid gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/samfelag/${category.slug}`}
                className="group flex items-center gap-5 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40 hover:bg-surface"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface text-3xl">
                  {category.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{category.name}</h2>
                    {category.restricted && (
                      <Badge variant="outline">
                        <Lock className="mr-1 h-3 w-3" />
                        Þarf umsókn
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
                <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
                  <MessageSquare className="h-4 w-4" />
                  {category.threadCount}
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>

          <p className="mt-8 rounded-xl border border-border bg-surface/40 p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">Athugið:</strong> Þetta er
            öruggt rými. Sýndu öðrum virðingu. Engin hatursorðræða, áreitni eða
            persónuárásir eru leyfðar. Sjá nánar í{" "}
            <Link href="/skilmalar" className="text-primary hover:underline">
              skilmálum
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
