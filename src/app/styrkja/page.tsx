import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Takk fyrir áhugann",
  description:
    "EkkiEinn.is tekur ekki við greiðslum eða framlögum á vefnum.",
};

export default function DonateInterestPage() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden py-20">
      <div className="absolute inset-0 hero-glow" aria-hidden />
      <div className="container relative max-w-lg text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Takk fyrir áhugann
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Við tökum ekki við greiðslum eða framlögum á þessari síðu. Samfélagið
          og stuðningurinn eru áfram opnir öllum.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Spurningar má senda á{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="text-primary hover:underline"
          >
            {SITE.email}
          </a>
          .
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">Til baka á forsíðu</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/samfelag">Samfélagið</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
