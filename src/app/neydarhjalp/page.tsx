import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { CrisisResources } from "@/components/crisis-resources";

export const metadata: Metadata = {
  title: "Neyðarhjálp",
  description:
    "Neyðarnúmer og úrræði fyrir karlmenn í bráðri hættu eða krísu á Íslandi.",
};

const SUPPORT_SERVICES = [
  {
    name: "Bjarkarhlíð",
    description:
      "Þjónustumiðstöð fyrir þolendur ofbeldis. Ráðgjöf og stuðningur, einnig fyrir karla.",
  },
  {
    name: "Heimilisfriður",
    description:
      "Meðferð fyrir þá sem beita ofbeldi í nánum samböndum og vilja breyta hegðun sinni.",
  },
  {
    name: "Stígamót",
    description: "Ráðgjöf fyrir þolendur kynferðisofbeldis.",
  },
  {
    name: "Geðheilsuteymi heilsugæslunnar",
    description: "Þverfagleg aðstoð við geðrænan vanda í gegnum heilsugæsluna.",
  },
];

export default function CrisisPage() {
  return (
    <>
      <PageHero
        eyebrow="Neyðarhjálp"
        title="Þarftu hjálp núna?"
        description="Þú ert ekki einn. Ef líf liggur við, hikaðu ekki við að hringja í neyðarlínuna."
      />

      <section className="py-12">
        <div className="container">
          <div className="mb-8 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-5">
            <AlertTriangle className="h-6 w-6 shrink-0 text-destructive" />
            <p className="text-sm text-foreground/90">
              Ef þú eða einhver annar er í bráðri lífshættu — hringdu strax í{" "}
              <a href="tel:112" className="font-bold text-destructive">
                112
              </a>
              .
            </p>
          </div>

          <CrisisResources />

          <h2 className="mt-14 text-2xl font-bold tracking-tight">
            Önnur úrræði
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {SUPPORT_SERVICES.map((s) => (
              <div
                key={s.name}
                className="rounded-xl border border-border bg-card p-5"
              >
                <h3 className="font-semibold">{s.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
