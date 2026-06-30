// Canonical content for the editable static pages, seeded into the Page table.
// FULL styled HTML using the karlmenn design system (see src/styles/content.css)
// so the admin editor renders identically to the live public page (WYSIWYG V4).

export type SeedPage = {
  slug: string;
  title: string;
  menuTitle: string;
  category: string;
  metaDescription: string;
  content: string;
};

const FORSIDA = `<!-- HERO -->
<section class="hero">
  <div class="container">
    <svg class="shield-lg" viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="h" x1="32" y1="2" x2="32" y2="70" gradientUnits="userSpaceOnUse"><stop stop-color="#FBBF24"/><stop offset="1" stop-color="#F59E0B"/></linearGradient></defs><path d="M32 2 6 12v22c0 17 12 28 26 34 14-6 26-17 26-34V12L32 2Z" fill="url(#h)"/><path d="M32 9 12 16.5V34c0 13.5 9.2 22.7 20 27.8 10.8-5.1 20-14.3 20-27.8V16.5L32 9Z" fill="#0F1117"/><path d="M32 22l10 10-10 10-10-10 10-10Z" fill="url(#h)"/><path d="M22 40l10-6 10 6" stroke="#0F1117" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <h1>Þú ert ekki einn.</h1>
    <p class="lead">Samfélag og stuðningur fyrir karlmenn sem hafa upplifað ofbeldi, rangar sakir, erfiðar aðstæður eða eru gerendur og vilja breyta hegðun sinni.</p>
    <div class="hero-actions">
      <a href="/skra" class="btn btn-primary btn-lg">Skrá mig</a>
      <a href="/um-okkur" class="btn btn-ghost btn-lg">Kynna mér meira</a>
    </div>
  </div>
</section>

<!-- HVERJUM ER ÞETTA ÆTLAÐ -->
<section id="hverjum" class="bg-surface">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Hverjum er þetta ætlað</p>
      <h2>Hvar sem þú stendur — það er pláss fyrir þig hér</h2>
      <p>Karlmenn glíma við erfiðar aðstæður í þögn. Hér þarftu ekki að gera það einn.</p>
    </div>
    <div class="grid grid-3">
      <div class="card">
        <div class="icon">🛡️</div>
        <h3>Fórnarlamb ofbeldis</h3>
        <p>Líkamlegt eða andlegt ofbeldi. Þú átt rétt á stuðningi og að vera tekinn alvarlega — sama hver beitti þig ofbeldi.</p>
      </div>
      <div class="card">
        <div class="icon">⚖️</div>
        <h3>Mannorðstjón</h3>
        <p>Rangar sakir og mannorðstjón geta rústað lífi. Hér finnur þú ráðgjöf, reynslu annarra og leiðir áfram.</p>
      </div>
      <div class="card">
        <div class="icon">🔄</div>
        <h3>Gerandi sem vill breyta</h3>
        <p>Að taka ábyrgð og breyta hegðun sinni er hugrekki. Hér er sérstakt lokað svæði fyrir þá vegferð.</p>
      </div>
    </div>
  </div>
</section>

<!-- HVERNIG VIRKAR ÞETTA -->
<section>
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Hvernig virkar þetta</p>
      <h2>Þrjú einföld skref</h2>
    </div>
    <div class="grid grid-3 steps">
      <div class="step">
        <div class="num">1</div>
        <h3>Skráðu þig</h3>
        <p>Nafnlaust ef þú vilt. Þú velur gælunafn og ræður sjálfur hversu mikið þú deilir.</p>
      </div>
      <div class="step">
        <div class="num">2</div>
        <h3>Tengstu samfélaginu</h3>
        <p>Lestu, spjallaðu og deildu reynslu með öðrum sem skilja hvar þú stendur.</p>
      </div>
      <div class="step">
        <div class="num">3</div>
        <h3>Fáðu aðstoð</h3>
        <p>Aðgangur að lögfræðilegri og sálfræðilegri ráðgjöf í gegnum samfélagið.</p>
      </div>
    </div>
  </div>
</section>

<!-- STUÐNINGUR -->
<section class="bg-surface">
  <div class="container">
    <div class="cta-band">
      <p class="eyebrow">Stuðningur samfélagsins</p>
      <h2>Byggt á frjálsum framlögum</h2>
      <p class="lead" style="margin:0 auto 1.6rem;">Allt hér er rekið af samfélaginu. Framlög fara beint til lögfræðilegrar og sálfræðilegri aðstoðar fyrir þá sem þurfa á að halda.</p>
      <a href="/styrkja" class="btn btn-primary btn-lg">Styðja verkefnið</a>
    </div>
  </div>
</section>

<!-- NEYÐARHJÁLP -->
<section class="crisis">
  <div class="container">
    <div class="section-head" style="margin-bottom:0;">
      <p class="eyebrow" style="color:var(--danger);">Bráðahjálp</p>
      <h2>Þarftu hjálp núna?</h2>
      <p>Ef líf er í hættu, hringdu strax. Þú ert ekki byrði — það er styrkur að leita sér hjálpar.</p>
    </div>
    <div class="crisis-grid">
      <div class="crisis-item">
        <div class="num">112</div>
        <div class="label">Neyðarlínan — bráð hætta og ofbeldi</div>
      </div>
      <div class="crisis-item">
        <div class="num">1717</div>
        <div class="label">Hjálparsími Rauða krossins — sólarhringsvakt</div>
      </div>
      <div class="crisis-item">
        <div class="num">1700</div>
        <div class="label">Heilsuvera ráðgjöf — heilsa og líðan</div>
      </div>
    </div>
    <p class="center" style="margin-top:22px;"><a href="/neydarhjalp" class="accent">Sjá allar neyðar- og hjálparleiðir →</a></p>
  </div>
</section>`;

/** Inner page helper: page-hero + prose body. */
function innerPage(
  eyebrow: string,
  title: string,
  lead: string,
  bodyHtml: string,
): string {
  return `<section class="page-hero">
  <div class="container">
    <p class="eyebrow">${eyebrow}</p>
    <h1>${title}</h1>
    <p class="lead" style="margin:0 auto;">${lead}</p>
  </div>
</section>
<section>
  <div class="container prose">
${bodyHtml}
  </div>
</section>`;
}

export const PAGES: SeedPage[] = [
  {
    slug: "forsida",
    title: "EkkiEinn.is — Þú ert ekki einn",
    menuTitle: "Forsíða",
    category: "",
    metaDescription:
      "Samfélag og stuðningur fyrir karlmenn á Íslandi. Þú ert ekki einn.",
    content: FORSIDA,
  },
  {
    slug: "studningur",
    title: "Stuðningur — EkkiEinn.is",
    menuTitle: "Stuðningur",
    category: "about",
    metaDescription:
      "Lögfræðileg, sálfræðileg og samfélagsleg aðstoð fyrir karlmenn.",
    content: innerPage(
      "Stuðningur",
      "Þú þarft ekki að gera þetta einn",
      "Þrjár tegundir stuðnings — þú velur það sem hentar þér.",
      `    <h2>Lögfræðileg aðstoð</h2>
    <p>Ráðgjöf um réttindi þín, forsjármál og hvernig á að bregðast við ásökunum.</p>
    <h2>Sálfræðileg aðstoð</h2>
    <p>Stuðningur við áföll, kvíða og þunglyndi — einstaklings- og hópviðtöl.</p>
    <h2>Samfélagslegur stuðningur</h2>
    <p>Á <a href="/samfelag" class="accent">spjallsvæðinu</a> hittir þú aðra karlmenn sem skilja stöðuna.</p>
    <h2>Réttindi þín</h2>
    <ul>
      <li>Þú átt rétt á að vera trúað og tekið alvarlega.</li>
      <li>Karlmenn geta líka verið þolendur heimilisofbeldis.</li>
      <li>Þú átt rétt á jafnri meðferð í forsjár- og umgengnismálum.</li>
    </ul>
    <p>Ef málið er bráðatilvik, hafðu samband við <a href="/neydarhjalp" class="accent">neyðarhjálp</a> strax.</p>`,
    ),
  },
  {
    slug: "um-okkur",
    title: "Um okkur — EkkiEinn.is",
    menuTitle: "Um okkur",
    category: "about",
    metaDescription:
      "Um EkkiEinn.is — samfélag og stuðningsvettvangur fyrir karlmenn.",
    content: innerPage(
      "Um verkefnið",
      "Þú ert ekki einn",
      "Öruggt rými þar sem karlmenn geta talað hreint út og fengið stuðning.",
      `    <p>Margir karlmenn ganga í gegnum erfiða tíma í þögn. Of oft er engin augljós leið til að leita sér aðstoðar. Við viljum breyta því.</p>
    <h2>Markmið okkar</h2>
    <p>Að búa til öruggt rými þar sem karlmenn geta talað hreint út, fengið stuðning frá öðrum í sömu stöðu og tengst faglegri aðstoð þegar þeir þurfa á henni að halda.</p>
    <h2>Gildin okkar</h2>
    <ul>
      <li><strong>Öryggi og trúnaður</strong> — þú ræður hversu mikið þú segir og hvort þú ert nafnlaus.</li>
      <li><strong>Samfélag án dóma</strong> — hér mætir þú öðrum sem skilja.</li>
      <li><strong>Vernd nafnleyndar</strong> — nöfn eru fjarlægð úr færslum.</li>
    </ul>
    <p>Verkefnið er rekið án hagnaðarsjónarmiða. Þú getur <a href="/styrkja" class="accent">stutt verkefnið</a>.</p>`,
    ),
  },
  {
    slug: "styrkja",
    title: "Styrktu EkkiEinn.is",
    menuTitle: "Styrktu okkur",
    category: "",
    metaDescription:
      "Styddu EkkiEinn.is — framlög fara beint í aðstoð fyrir karlmenn.",
    content: innerPage(
      "Framlög",
      "Saman gerum við gæfumuninn",
      "Allt hér er byggt á frjálsum framlögum frá samfélaginu.",
      `    <p>Hver króna fer beint til þeirra sem þurfa á aðstoð að halda.</p>
    <h2>Hvernig er fjármunum varið?</h2>
    <ul>
      <li><strong>Lögfræðiaðstoð</strong> fyrir menn sem standa frammi fyrir ásökunum eða forsjármálum.</li>
      <li><strong>Sálfræðiþjónusta</strong> — niðurgreidd viðtöl fyrir þá sem hafa ekki efni á því sjálfir.</li>
      <li><strong>Vitundarvakning</strong> til að ná til fleiri karlmanna sem þurfa stuðning.</li>
    </ul>`,
    ),
  },
  {
    slug: "neydarhjalp",
    title: "Neyðarhjálp — EkkiEinn.is",
    menuTitle: "Neyðarhjálp",
    category: "contact",
    metaDescription: "Neyðarnúmer og úrræði fyrir karlmenn í bráðri hættu.",
    content: `<section class="page-hero">
  <div class="container">
    <p class="eyebrow" style="color:var(--danger);">Neyðarhjálp</p>
    <h1>Þarftu hjálp núna?</h1>
    <p class="lead" style="margin:0 auto;">Þú ert ekki einn. Ef líf liggur við, hikaðu ekki við að hringja.</p>
  </div>
</section>
<section class="crisis" style="border-top:none;">
  <div class="container">
    <div class="crisis-grid" style="margin-top:0;">
      <div class="crisis-item">
        <div class="num">112</div>
        <div class="label">Neyðarlínan — bráð hætta, ofbeldi eða lífshættulegt ástand.</div>
      </div>
      <div class="crisis-item">
        <div class="num">552-2218</div>
        <div class="label">Píeta samtökin — sjálfsvígsforvarnir, allan sólarhringinn.</div>
      </div>
      <div class="crisis-item">
        <div class="num">1717</div>
        <div class="label">Hjálparsími Rauða krossins — trúnaður og nafnleynd.</div>
      </div>
    </div>
  </div>
</section>
<section>
  <div class="container prose">
    <h2>Önnur úrræði</h2>
    <ul>
      <li><strong>Bjarkarhlíð</strong> — þjónustumiðstöð fyrir þolendur ofbeldis, einnig karla.</li>
      <li><strong>Heimilisfriður</strong> — meðferð fyrir þá sem beita ofbeldi og vilja breyta hegðun sinni.</li>
      <li><strong>Stígamót</strong> — ráðgjöf fyrir þolendur kynferðisofbeldis.</li>
      <li><strong>Geðheilsuteymi heilsugæslunnar</strong> — þverfagleg aðstoð við geðrænan vanda.</li>
    </ul>
    <p>Þú getur líka leitað stuðnings hjá <a href="/samfelag" class="accent">samfélaginu</a> eða óskað eftir <a href="/studningur" class="accent">fagaðstoð</a>.</p>
  </div>
</section>`,
  },
  {
    slug: "samband",
    title: "Samband — EkkiEinn.is",
    menuTitle: "Samband",
    category: "contact",
    metaDescription: "Hafðu samband við teymið á bak við EkkiEinn.is.",
    content: innerPage(
      "Samband",
      "Hafðu samband",
      "Spurningar, ábendingar eða viltu leggja verkefninu lið?",
      `    <p>Við lesum öll skilaboð og förum með þau sem trúnaðarmál.</p>
    <h2>Tölvupóstur</h2>
    <p>Sendu okkur línu á <a href="mailto:info@ekkieinn.is" class="accent">info@ekkieinn.is</a>. Ef málið er viðkvæmt máttu nota gælunafn — netfangið þitt er aðeins notað til að svara þér.</p>
    <h2>Bráðatilvik</h2>
    <p>Ef þú þarft aðstoð strax, ekki bíða eftir svari í tölvupósti — sjá <a href="/neydarhjalp" class="accent">neyðarhjálp</a> eða hringdu í 112.</p>`,
    ),
  },
  {
    slug: "personuvernd",
    title: "Persónuvernd — EkkiEinn.is",
    menuTitle: "Persónuvernd",
    category: "legal",
    metaDescription:
      "Persónuverndarstefna EkkiEinn.is — hvernig við meðhöndlum gögn.",
    content: innerPage(
      "Persónuvernd",
      "Persónuverndarstefna",
      "Við tökum persónuvernd alvarlega, í samræmi við GDPR og íslensk lög.",
      `    <h2>Hvaða gögnum söfnum við?</h2>
    <p>Aðeins því sem nauðsynlegt er: netfangi við skráningu, valfrjálsu gælunafni og því efni sem þú birtir sjálf(ur). Þú getur tekið þátt nafnlaust.</p>
    <h2>Nafnleynd og nöfn í færslum</h2>
    <p>Mannanöfn eru fjarlægð úr færslum áður en þær birtast. Trúnaðarupplýsingar sem þú gefur sérstaklega upp eru aldrei birtar opinberlega.</p>
    <h2>Réttindi þín</h2>
    <ul>
      <li>Aðgangur að gögnum þínum.</li>
      <li>Leiðrétting á röngum upplýsingum.</li>
      <li>Eyðing gagna þinna.</li>
    </ul>
    <p>Sendu beiðni á <a href="mailto:info@ekkieinn.is" class="accent">info@ekkieinn.is</a>.</p>`,
    ),
  },
  {
    slug: "skilmalar",
    title: "Skilmálar — EkkiEinn.is",
    menuTitle: "Skilmálar",
    category: "legal",
    metaDescription: "Notkunarskilmálar EkkiEinn.is.",
    content: innerPage(
      "Skilmálar",
      "Notkunarskilmálar",
      "Með því að nota EkkiEinn.is samþykkir þú eftirfarandi skilmála.",
      `    <h2>Tilgangur</h2>
    <p>EkkiEinn.is er stuðningsvettvangur, ekki staðgengill fyrir bráðaþjónustu, læknishjálp eða lögfræðiráðgjöf. Ef þú ert í bráðri hættu, hringdu í 112.</p>
    <h2>Hegðun á vettvangi</h2>
    <ul>
      <li>Bannað er að nafngreina einstaklinga eða birta persónugreinanlegar upplýsingar.</li>
      <li>Engin hatursorðræða, áreitni eða hótanir.</li>
      <li>Ekki hvetja til ofbeldis eða ólöglegra athafna.</li>
    </ul>
    <p>Umsjónarmenn áskilja sér rétt til að fjarlægja efni og loka aðgöngum sem brjóta gegn skilmálum. Spurningar má senda á <a href="mailto:info@ekkieinn.is" class="accent">info@ekkieinn.is</a>.</p>`,
    ),
  },
  {
    slug: "samfelag",
    title: "Samfélag — EkkiEinn.is",
    menuTitle: "Samfélag",
    category: "",
    metaDescription:
      "Spjallsvæði og samfélag fyrir karlmenn — deildu reynslu og fáðu stuðning.",
    content: innerPage(
      "Samfélag",
      "Samfélagið",
      "Öruggt rými til að deila reynslu, fá ráð og finna fólk í sömu stöðu.",
      `    <p>Til að vernda alla eru nöfn fjarlægð úr færslum.</p>
    <h2>Flokkar</h2>
    <ul>
      <li><strong>Almennt</strong> — kynntu þig og talaðu um daginn og veginn.</li>
      <li><strong>Ofbeldi og brot</strong> — deildu reynslu af ofbeldi.</li>
      <li><strong>Löglegar spurningar</strong> — ráðgjöf tengd réttarkerfinu.</li>
      <li><strong>Geðheilsa</strong> — sálfræðilegur stuðningur og bataferli.</li>
      <li><strong>Gerendur</strong> — fyrir þá sem vilja taka ábyrgð (þarf umsókn).</li>
    </ul>
    <p>Farðu á <a href="/samfelag" class="accent">spjallsvæðið</a> til að byrja.</p>`,
    ),
  },
];
