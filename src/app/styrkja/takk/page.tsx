import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Takk fyrir stuðninginn",
};

export default function ThankYouPage() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden py-20">
      <div className="absolute inset-0 hero-glow" aria-hidden />
      <div className="container relative max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Heart className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Takk fyrir stuðninginn
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Framlagið þitt fer beint til lögfræðilegrar og sálfræðilegrar aðstoðar
          fyrir karlmenn sem þurfa á henni að halda. Þú gerir gæfumuninn.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/">Til baka á forsíðu</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
