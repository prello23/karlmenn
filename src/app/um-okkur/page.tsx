import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Shield, Users, Lock } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Um okkur",
  description:
    "Ekki einn er samfélag og stuðningsvettvangur fyrir karlmenn á Íslandi.",
};

const VALUES = [
  {
    icon: Shield,
    title: "Öryggi og trúnaður",
    body: "Allt sem þú deilir er meðhöndlað af virðingu. Þú ræður hversu mikið þú segir og hvort þú ert nafnlaus.",
  },
  {
    icon: Users,
    title: "Samfélag án dóma",
    body: "Hér mætir þú öðrum sem skilja. Engir dómar — bara stuðningur og hlustun.",
  },
  {
    icon: Lock,
    title: "Vernd nafnleyndar",
    body: "Nöfn eru sjálfkrafa fjarlægð úr færslum svo enginn er nafngreindur á opnum vettvangi.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Um verkefnið"
        title="Þú ert ekki einn"
        description="Ekki einn er íslenskt samfélag og stuðningsvettvangur fyrir karlmenn sem þurfa einhvern til að tala við — hvort sem það snýst um ofbeldi, rangar sakir, geðheilsu eða löngun til að breyta sjálfum sér."
      />

      <section className="py-16">
        <div className="container max-w-3xl space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            Margir karlmenn ganga í gegnum erfiða tíma í þögn. Þeir hafa lent í
            ofbeldi, verið logið uppá, glíma við kvíða eða þunglyndi, eða standa
            frammi fyrir afleiðingum eigin gjörða og vilja gera betur. Of oft er
            engin augljós leið til að leita sér aðstoðar.
          </p>
          <p>
            Markmið okkar er einfalt: að búa til öruggt rými þar sem karlmenn geta
            talað hreint út, fengið stuðning frá öðrum í sömu stöðu og tengst
            faglegri aðstoð þegar þeir þurfa á henni að halda.
          </p>
          <p>
            Við trúum því að það að biðja um hjálp sé styrkleiki — ekki veikleiki.
          </p>
        </div>
      </section>

      <section className="border-t border-border/60 bg-surface/30 py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-border bg-card p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{v.title}</h3>
                <p className="mt-3 text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 text-center sm:p-14">
            <div className="absolute inset-0 hero-glow opacity-70" aria-hidden />
            <div className="relative mx-auto max-w-xl">
              <Heart className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
                Verkefni byggt á samstöðu
              </h2>
              <p className="mt-3 text-muted-foreground">
                Ekki einn er rekið án hagnaðarsjónarmiða og byggir á frjálsum
                framlögum og sjálfboðavinnu.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/skra">Vertu með</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dona">Styðja verkefnið</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
