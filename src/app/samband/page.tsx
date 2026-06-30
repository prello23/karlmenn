import type { Metadata } from "next";
import { Mail } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/components/contact-form";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Samband",
  description: "Hafðu samband við teymið á bak við EkkiEinn.is.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Samband"
        title="Hafðu samband"
        description="Spurningar, ábendingar eða viltu leggja verkefninu lið? Sendu okkur línu."
      />

      <section className="py-12">
        <div className="container grid gap-10 lg:grid-cols-[1fr_minmax(0,420px)]">
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground">
              Við lesum öll skilaboð. Ef málið er viðkvæmt máttu nota gælunafn —
              netfangið þitt er aðeins notað til að svara þér.
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="inline-flex items-center gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Mail className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm text-muted-foreground">
                  Tölvupóstur
                </span>
                <span className="font-medium">{SITE.email}</span>
              </span>
            </a>
          </div>

          <Card>
            <CardContent className="pt-6">
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
