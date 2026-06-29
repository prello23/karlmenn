import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skilmálar og notendaskilyrði | ekkieinn.is",
  description: "Skilmálar og notendaskilyrði fyrir ekkieinn.is",
};

export default function SkilmalarPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Skilmálar og notendaskilyrði</h1>
      <p className="text-sm text-muted-foreground mb-10">Síðast uppfært: Júní 2025</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-10">

        <section>
          <h2 className="text-xl font-semibold mb-3">1. Um þjónustuna</h2>
          <p>
            ekkieinn.is er samfélagsvettvangur sem veitir karlmönnum, sem hafa orðið fyrir
            ofbeldi, rangar sakir eða misnotkun, aðgang að stuðningsneti, umræðuþráðum og
            upplýsingum um lögfræðilega og sálfræðilega þjónustu. Síðan er rekin af einkaaðila
            sem leggur áherslu á friðsælt og uppbyggilegt samfélag.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Ábyrgð á efni notenda</h2>
          <p>
            Notendur bera fulla og eina ábyrgð á því efni sem þeir birta á ekkieinn.is, þar með
            talið texta, myndir og tengla. ekkieinn.is ber enga ábyrgð á efni sem notendur setja
            inn, hvernig það er notað af öðrum eða afleiðingum sem kunna að leiða af birtingu þess.
          </p>
          <p className="mt-2">
            Bannað er að birta efni sem:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>er lögbrotlegt, hótandi eða ærumeiðandi</li>
            <li>inniheldur persónulegar upplýsingar um aðra án leyfis</li>
            <li>er markaðssetning eða spam</li>
            <li>er í beinni andstöðu við markmið samfélagsins</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Öryggi gagna og netárásir</h2>
          <p>
            ekkieinn.is notar eðlilegar öryggisráðstafanir til að vernda gögn notenda. Hins vegar
            er engin vefsíða 100% óviðráðanleg og ekkieinn.is ber <strong>enga ábyrgð</strong> ef
            gögn leka, eru stolið eða ef kerfið verður fyrir netárás (hacking). Notendur skrá sig
            inn á eigin áhættu og eru hvattir til að nota sterk lykilorð og vernda eigin aðgang.
          </p>
          <p className="mt-2">
            Ef grunur vaknar um öryggisbrot er hægt að hafa samband við{" "}
            <a href="mailto:info@ekkieinn.is" className="text-primary underline">
              info@ekkieinn.is
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Styrktarfé og framlög</h2>
          <p>
            ekkieinn.is tekur á móti styrktarfé til að fjármagna rekstur og þróun vefsíðunnar
            og til að bjóða upp á fjárhagslegan stuðning við lögfræðilega og sálfræðilega
            þjónustu, eftir því sem fjárhagslegar aðstæður leyfa. Hluti framlaganna fer beint í
            rekstur og tækniþróun síðunnar.
          </p>
          <p className="mt-2">
            ekkieinn.is gefur engar tryggingar um að tiltekið magn styrktarfjár verði veitt
            einstaklingum. Úthlutun fer eftir mati rekstraraðila hverju sinni.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Takmarkaðar greiðslur og endurgreiðslur</h2>
          <p>
            Greiðslur sem inntar eru af hendi á ekkieinn.is (t.d. stuðningsgjald eða framlag)
            eru að jafnaði endanlegar. Endurgreiðslubeiðnir eru teknar til skoðunar í sérstökum
            tilvikum — hafið samband við{" "}
            <a href="mailto:info@ekkieinn.is" className="text-primary underline">
              info@ekkieinn.is
            </a>{" "}
            innan 14 daga frá greiðsludegi.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Takmarkaðar skaðabótaábyrgðar</h2>
          <p>
            ekkieinn.is og eigendur þjónustunnar bera enga skaðabótaábyrgð gagnvart notendum
            eða þriðja aðila vegna beinnar eða óbeinnar tjánar sem hlýst af notkun eða
            óaðgengi þjónustunnar, þar með talið gagnaleka, truflana á þjónustu eða
            mistakasendingu upplýsinga.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Breytingar á skilmálum</h2>
          <p>
            ekkieinn.is áskilur sér rétt til að breyta þessum skilmálum. Verulegar breytingar
            verða tilkynntar með auðsæum hætti á vefsíðunni. Áframhaldandi notkun þjónustunnar
            eftir breytingar telst samþykki á uppfærðum skilmálum.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Lög og lögsaga</h2>
          <p>
            Þessir skilmálar lúta íslenskum lögum. Ágreiningur sem rísa kann vegna túlkunar eða
            framkvæmdar þeirra skal leystur fyrir íslenskum dómstólum.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Samband</h2>
          <p>
            Spurningar eða athugasemdir um þessa skilmála má senda á{" "}
            <a href="mailto:info@ekkieinn.is" className="text-primary underline">
              info@ekkieinn.is
            </a>
            .
          </p>
        </section>

      </div>
    </main>
  );
}
