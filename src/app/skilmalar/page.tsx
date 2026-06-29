import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { LegalSection } from "@/components/legal-section";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Skilmálar",
  description: "Notkunarskilmálar ekkieinn.is.",
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Skilmálar"
        title="Notkunarskilmálar"
        description="Með því að nota ekkieinn.is samþykkir þú eftirfarandi skilmála. Þeir eru til staðar til að halda samfélaginu öruggu fyrir alla."
      />

      <section className="py-12">
        <div className="container max-w-3xl space-y-10">
          <LegalSection heading="1. Tilgangur">
            <p>
              Ekki einn er stuðningsvettvangur fyrir karlmenn. Hann er ekki
              staðgengill fyrir bráðaþjónustu, læknishjálp eða lögfræðiráðgjöf.
              Ef þú ert í bráðri hættu, hringdu í 112.
            </p>
          </LegalSection>

          <LegalSection heading="2. Hegðun á vettvangi">
            <p>Á vettvanginum er bannað að:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>nafngreina einstaklinga eða birta persónugreinanlegar upplýsingar,</li>
              <li>beita hatursorðræðu, áreitni eða hótunum,</li>
              <li>hvetja til ofbeldis eða ólöglegra athafna,</li>
              <li>birta efni sem brýtur gegn lögum eða réttindum annarra.</li>
            </ul>
            <p>
              Umsjónarmenn áskilja sér rétt til að fjarlægja efni og loka aðgöngum
              sem brjóta gegn skilmálum.
            </p>
          </LegalSection>

          <LegalSection heading="3. Efni notenda">
            <p>
              Þú berð ábyrgð á því efni sem þú birtir. Nöfn eru fjarlægð
              sjálfkrafa, en þú skalt forðast að deila upplýsingum sem geta
              auðkennt þig eða aðra.
            </p>
          </LegalSection>

          <LegalSection heading="4. Ábyrgð">
            <p>
              Efni á vettvanginum endurspeglar skoðanir notenda og er ekki
              fagleg ráðgjöf. Ekki einn ber ekki ábyrgð á ákvörðunum sem teknar
              eru á grundvelli efnis á síðunni.
            </p>
          </LegalSection>

          <LegalSection heading="5. Breytingar">
            <p>
              Þessum skilmálum kann að verða breytt. Verulegar breytingar verða
              kynntar á síðunni.
            </p>
          </LegalSection>

          <LegalSection heading="6. Samband">
            <p>
              Spurningar má senda á{" "}
              <a href={`mailto:${SITE.email}`} className="text-primary hover:underline">
                {SITE.email}
              </a>
              .
            </p>
          </LegalSection>
        </div>
      </section>
    </>
  );
}
