import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { requireUser } from "@/lib/auth-helpers";
import { NafnaleitClient } from "./NafnaleitClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Er Gerandi skráður",
  description: "Athugaðu hvort nafn geranda sé skráð í gagnagrunn okkar.",
};

export default async function NafnaleitPage() {
  await requireUser("/nafnaleit");

  return (
    <>
      <PageHero
        eyebrow="Er Gerandi skráður"
        title="Er nafn geranda skráð?"
        description="Sláðu inn nafn til að athuga hvort það sé skráð. Niðurstaðan er einfalt Já eða Nei — skráin sjálf er aldrei birt."
      />
      <section className="py-12">
        <div className="container">
          <NafnaleitClient />
        </div>
      </section>
    </>
  );
}
