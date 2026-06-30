import type { Metadata } from "next";

import { DbPageContent, getPageMetadata } from "@/components/db-page";
import { CrisisResources } from "@/components/crisis-resources";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("neydarhjalp", {
    title: "Neyðarhjálp",
    description:
      "Neyðarnúmer og úrræði fyrir karlmenn í bráðri hættu eða krísu á Íslandi.",
  });
}

export default function CrisisPage() {
  return (
    <>
      <DbPageContent
        slug="neydarhjalp"
        eyebrow="Neyðarhjálp"
        fallbackTitle="Þarftu hjálp núna?"
        fallbackDescription="Þú ert ekki einn. Ef líf liggur við, hikaðu ekki við að hringja í neyðarlínuna."
      />

      <section className="pb-16">
        <div className="container">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">
            Hringdu beint
          </h2>
          <CrisisResources />
        </div>
      </section>
    </>
  );
}
