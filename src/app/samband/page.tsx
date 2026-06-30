import type { Metadata } from "next";

import { DbPageContent, getPageMetadata } from "@/components/db-page";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/components/contact-form";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("samband", {
    title: "Samband",
    description: "Hafðu samband við teymið á bak við EkkiEinn.is.",
  });
}

export default function ContactPage() {
  return (
    <>
      <DbPageContent
        slug="samband"
        eyebrow="Samband"
        fallbackTitle="Hafðu samband"
        fallbackDescription="Spurningar, ábendingar eða viltu leggja verkefninu lið? Sendu okkur línu."
      />

      <section className="pb-16">
        <div className="container max-w-xl">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 text-lg font-semibold">Sendu okkur skilaboð</h2>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
