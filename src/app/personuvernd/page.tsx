import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { LegalSection } from "@/components/legal-section";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Persónuvernd",
  description: "Persónuverndarstefna EkkiEinn.is — hvernig við meðhöndlum gögn.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Persónuvernd"
        title="Persónuverndarstefna"
        description="Við tökum persónuvernd alvarlega. Þessi stefna útskýrir hvaða gögn við söfnum og hvernig þau eru notuð, í samræmi við GDPR og íslensk lög."
      />

      <section className="py-12">
        <div className="container max-w-3xl space-y-10">
          <LegalSection heading="1. Hvaða gögnum söfnum við?">
            <p>
              Við söfnum aðeins þeim gögnum sem nauðsynleg eru til að reka
              vettvanginn: netfangi við skráningu, valfrjálsu gælunafni og því
              efni sem þú birtir sjálf(ur). Þú getur tekið þátt nafnlaust.
            </p>
          </LegalSection>

          <LegalSection heading="2. Nafnleynd og nöfn í færslum">
            <p>
              Til að vernda bæði þolendur og aðra fjarlægjum við sjálfkrafa
              mannanöfn úr færslum áður en þær eru vistaðar. Upprunalegur texti
              með nöfnum er ekki geymdur.
            </p>
            <p>
              Trúnaðarupplýsingar sem þú gefur sérstaklega upp (t.d. nafn geranda
              vegna lögfræðiaðstoðar) eru aldrei birtar opinberlega og eru
              aðgengilegar umsjónarmönnum eingöngu.
            </p>
          </LegalSection>

          <LegalSection heading="3. Hvernig eru gögnin notuð?">
            <p>
              Gögnin eru notuð til að reka samfélagið, veita stuðning og bæta
              þjónustuna. Við seljum aldrei persónuupplýsingar til þriðja aðila.
            </p>
          </LegalSection>

          <LegalSection heading="4. Réttindi þín">
            <p>
              Þú átt rétt á að fá aðgang að gögnum þínum, leiðrétta þau eða fá
              þeim eytt. Sendu beiðni á{" "}
              <a href={`mailto:${SITE.email}`} className="text-primary hover:underline">
                {SITE.email}
              </a>
              .
            </p>
          </LegalSection>

          <LegalSection heading="5. Vafrakökur">
            <p>
              Við notum eingöngu nauðsynlegar vafrakökur til að halda þér
              innskráð(um). Engar auglýsinga- eða rekjakökur eru notaðar.
            </p>
          </LegalSection>

          <LegalSection heading="6. Samband">
            <p>
              Spurningar um persónuvernd má senda á{" "}
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
