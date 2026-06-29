import type { Metadata } from "next";
import { Scale, Brain, Megaphone, ShieldCheck } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { Card, CardContent } from "@/components/ui/card";
import { DonationForm } from "@/components/donation-form";

export const metadata: Metadata = {
  title: "Styrkja",
  description:
    "Framlög til ekkieinn.is fara beint í lögfræðilega og sálfræðilega aðstoð fyrir karlmenn. Eitt skipti eða mánaðarlega, nafnlaust ef þú vilt.",
};

const ALLOCATION = [
  {
    icon: Scale,
    title: "Lögfræðiaðstoð",
    body: "Ráðgjöf og aðstoð fyrir menn sem standa frammi fyrir ásökunum eða forsjármálum.",
  },
  {
    icon: Brain,
    title: "Sálfræðiþjónusta",
    body: "Niðurgreidd viðtöl og hópastarf fyrir þá sem hafa ekki efni á því sjálfir.",
  },
  {
    icon: Megaphone,
    title: "Vitundarvakning",
    body: "Að ná til fleiri karlmanna sem þurfa á stuðningi að halda en vita ekki af honum.",
  },
];

export default function DonatePage() {
  return (
    <>
      <PageHero
        eyebrow="Framlög"
        title="Saman gerum við gæfumuninn"
        description="Allt hér er byggt á frjálsum framlögum frá samfélaginu. Hver króna fer beint til þeirra sem þurfa á aðstoð að halda."
      />

      <section className="py-16">
        <div className="container grid gap-12 lg:grid-cols-[1fr_minmax(0,440px)]">
          {/* How funds are used */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Hvernig er fjármunum varið?
            </h2>
            <div className="mt-6 space-y-4">
              {ALLOCATION.map((item) => (
                <div
                  key={item.title}
                  className="flex gap-4 rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-5">
              <ShieldCheck className="h-5 w-5 shrink-0 text-success" />
              <p className="text-sm text-muted-foreground">
                Verkefnið er rekið án hagnaðarsjónarmiða. Við stefnum að því að
                birta árlegt yfirlit um hvernig framlögum er varið.
              </p>
            </div>
          </div>

          {/* Donation form */}
          <Card className="h-fit lg:sticky lg:top-24">
            <CardContent className="pt-6">
              <DonationForm />
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
