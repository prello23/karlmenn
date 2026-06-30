// Canonical content for the editable static pages, seeded into the Page table.
// Content is rich HTML (matches the TipTap admin editor output).

export type SeedPage = {
  slug: string;
  title: string;
  menuTitle: string;
  category: string;
  metaDescription: string;
  content: string;
};

export const PAGES: SeedPage[] = [
  {
    slug: "forsida",
    title: "EkkiEinn.is — Þú ert ekki einn",
    menuTitle: "Forsíða",
    category: "",
    metaDescription:
      "Samfélag og stuðningur fyrir karlmenn á Íslandi. Þú ert ekki einn.",
    content: `<section>
  <h2>Þú ert ekki einn</h2>
  <p>EkkiEinn.is er íslenskt samfélag og stuðningsvettvangur fyrir karlmenn. Hér er öruggt rými til að tala hreint út, finna fólk í sömu stöðu og sækja sér aðstoð — án dóma.</p>
  <h3>Hverjum er þetta ætlað?</h3>
  <ul>
    <li>Þeim sem hafa orðið fyrir andlegu eða líkamlegu ofbeldi.</li>
    <li>Þeim sem hefur verið logið uppá eða ranglega sakaðir.</li>
    <li>Þeim sem glíma við kvíða, þunglyndi eða erfiðar tilfinningar.</li>
    <li>Þeim sem vilja taka ábyrgð og breyta eigin hegðun.</li>
  </ul>
  <h3>Hvað bjóðum við?</h3>
  <p>Spjallsvæði þar sem nöfn eru sjálfkrafa fjarlægð til að vernda alla, tengingu við lögfræðilega og sálfræðilega aðstoð, og samfélag sem hlustar.</p>
  <p>Þarftu hjálp strax? Sjá <a href="/neydarhjalp">neyðarhjálp</a>.</p>
</section>`,
  },
  {
    slug: "studningur",
    title: "Stuðningur — EkkiEinn.is",
    menuTitle: "Stuðningur",
    category: "about",
    metaDescription:
      "Lögfræðileg, sálfræðileg og samfélagsleg aðstoð fyrir karlmenn.",
    content: `<section>
  <h2>Þú þarft ekki að gera þetta einn</h2>
  <p>Við bjóðum upp á þrjár tegundir stuðnings. Þú velur það sem hentar þér — og mátt nýta allt.</p>
  <h3>1. Lögfræðileg aðstoð</h3>
  <p>Ráðgjöf um réttindi þín, forsjármál og hvernig á að bregðast við ásökunum. Fagfólk og sjálfboðaliðar leiðbeina þér í gegnum ferlið.</p>
  <h3>2. Sálfræðileg aðstoð</h3>
  <p>Stuðningur við áföll, kvíða og þunglyndi — bæði einstaklings- og hópviðtöl. Að leita sér hjálpar er styrkleiki, ekki veikleiki.</p>
  <h3>3. Samfélagslegur stuðningur</h3>
  <p>Á <a href="/samfelag">spjallsvæðinu</a> hittir þú aðra karlmenn sem skilja stöðuna. Jafningjastuðningur getur skipt sköpum.</p>
  <h3>Réttindi þín</h3>
  <ul>
    <li>Þú átt rétt á að vera trúað og tekið alvarlega.</li>
    <li>Karlmenn geta líka verið þolendur heimilisofbeldis.</li>
    <li>Þú átt rétt á jafnri meðferð í forsjár- og umgengnismálum.</li>
  </ul>
  <p>Ef málið er bráðatilvik, hafðu samband við <a href="/neydarhjalp">neyðarhjálp</a> strax.</p>
</section>`,
  },
  {
    slug: "um-okkur",
    title: "Um okkur — EkkiEinn.is",
    menuTitle: "Um okkur",
    category: "about",
    metaDescription:
      "Um EkkiEinn.is — samfélag og stuðningsvettvangur fyrir karlmenn.",
    content: `<section>
  <h2>Um EkkiEinn.is</h2>
  <p>Margir karlmenn ganga í gegnum erfiða tíma í þögn. Of oft er engin augljós leið til að leita sér aðstoðar. Við viljum breyta því.</p>
  <h3>Markmið okkar</h3>
  <p>Að búa til öruggt rými þar sem karlmenn geta talað hreint út, fengið stuðning frá öðrum í sömu stöðu og tengst faglegri aðstoð þegar þeir þurfa á henni að halda.</p>
  <h3>Gildin okkar</h3>
  <ul>
    <li><strong>Öryggi og trúnaður</strong> — þú ræður hversu mikið þú segir og hvort þú ert nafnlaus.</li>
    <li><strong>Samfélag án dóma</strong> — hér mætir þú öðrum sem skilja.</li>
    <li><strong>Vernd nafnleyndar</strong> — nöfn eru sjálfkrafa fjarlægð úr færslum.</li>
  </ul>
  <p>Verkefnið er rekið án hagnaðarsjónarmiða og byggir á frjálsum framlögum og sjálfboðavinnu. Þú getur <a href="/styrkja">stutt verkefnið</a>.</p>
</section>`,
  },
  {
    slug: "styrkja",
    title: "Styrktu EkkiEinn.is",
    menuTitle: "Styrktu okkur",
    category: "",
    metaDescription:
      "Styddu EkkiEinn.is — framlög fara beint í aðstoð fyrir karlmenn.",
    content: `<section>
  <h2>Saman gerum við gæfumuninn</h2>
  <p>Allt á EkkiEinn.is er byggt á frjálsum framlögum frá samfélaginu. Hver króna fer beint til þeirra sem þurfa á aðstoð að halda.</p>
  <h3>Hvernig er fjármunum varið?</h3>
  <ul>
    <li><strong>Lögfræðiaðstoð</strong> fyrir menn sem standa frammi fyrir ásökunum eða forsjármálum.</li>
    <li><strong>Sálfræðiþjónusta</strong> — niðurgreidd viðtöl fyrir þá sem hafa ekki efni á því sjálfir.</li>
    <li><strong>Vitundarvakning</strong> til að ná til fleiri karlmanna sem þurfa stuðning.</li>
  </ul>
  <h3>Hvernig styð ég?</h3>
  <p>Þú getur styrkt okkur með einu framlagi eða mánaðarlega — nafnlaust ef þú vilt. Farðu á <a href="/styrkja">framlagasíðuna</a> til að leggja málinu lið.</p>
</section>`,
  },
  {
    slug: "neydarhjalp",
    title: "Neyðarhjálp — EkkiEinn.is",
    menuTitle: "Neyðarhjálp",
    category: "contact",
    metaDescription: "Neyðarnúmer og úrræði fyrir karlmenn í bráðri hættu.",
    content: `<section>
  <h2>Þarftu hjálp núna?</h2>
  <p>Ef líf liggur við eða þú ert í bráðri hættu — hikaðu ekki við að hringja. Þú ert ekki einn.</p>
  <h3>Neyðarnúmer</h3>
  <ul>
    <li><strong>112</strong> — Neyðarlínan. Bráð hætta, ofbeldi eða lífshættulegt ástand.</li>
    <li><strong>1717</strong> — Hjálparsími Rauða krossins. Opinn allan sólarhringinn, trúnaður og nafnleynd.</li>
    <li><strong>552-2218</strong> — Píeta samtökin, sjálfsvígsforvarnir og aðstandendur.</li>
    <li><strong>1700</strong> — Heilsuvera, ráðgjöf hjúkrunarfræðinga.</li>
  </ul>
  <h3>Önnur úrræði</h3>
  <ul>
    <li><strong>Bjarkarhlíð</strong> — þjónustumiðstöð fyrir þolendur ofbeldis, einnig karla.</li>
    <li><strong>Heimilisfriður</strong> — meðferð fyrir þá sem beita ofbeldi og vilja breyta hegðun sinni.</li>
    <li><strong>Geðheilsuteymi heilsugæslunnar</strong> — þverfagleg aðstoð við geðrænan vanda.</li>
  </ul>
  <p>Þú getur líka leitað stuðnings hjá <a href="/samfelag">samfélaginu</a> eða óskað eftir <a href="/studningur">fagaðstoð</a>.</p>
</section>`,
  },
  {
    slug: "samband",
    title: "Samband — EkkiEinn.is",
    menuTitle: "Samband",
    category: "contact",
    metaDescription: "Hafðu samband við teymið á bak við EkkiEinn.is.",
    content: `<section>
  <h2>Hafðu samband</h2>
  <p>Spurningar, ábendingar eða viltu leggja verkefninu lið? Við lesum öll skilaboð og förum með þau sem trúnaðarmál.</p>
  <h3>Tölvupóstur</h3>
  <p>Sendu okkur línu á <a href="mailto:info@ekkieinn.is">info@ekkieinn.is</a>. Ef málið er viðkvæmt máttu nota gælunafn — netfangið þitt er aðeins notað til að svara þér.</p>
  <h3>Bráðatilvik</h3>
  <p>Ef þú þarft aðstoð strax, ekki bíða eftir svari í tölvupósti — sjá <a href="/neydarhjalp">neyðarhjálp</a> eða hringdu í 112.</p>
</section>`,
  },
  {
    slug: "personuvernd",
    title: "Persónuvernd — EkkiEinn.is",
    menuTitle: "Persónuvernd",
    category: "legal",
    metaDescription:
      "Persónuverndarstefna EkkiEinn.is — hvernig við meðhöndlum gögn.",
    content: `<section>
  <h2>Persónuverndarstefna</h2>
  <p>Við tökum persónuvernd alvarlega, í samræmi við GDPR og íslensk lög. Hér útskýrum við hvaða gögn við söfnum og hvernig þau eru notuð.</p>
  <h3>Hvaða gögnum söfnum við?</h3>
  <p>Aðeins því sem nauðsynlegt er: netfangi við skráningu, valfrjálsu gælunafni og því efni sem þú birtir sjálf(ur). Þú getur tekið þátt nafnlaust.</p>
  <h3>Nafnleynd og nöfn í færslum</h3>
  <p>Mannanöfn eru sjálfkrafa fjarlægð úr færslum áður en þær eru vistaðar. Upprunalegur texti með nöfnum er ekki geymdur. Trúnaðarupplýsingar sem þú gefur sérstaklega upp eru aldrei birtar opinberlega.</p>
  <h3>Réttindi þín</h3>
  <ul>
    <li>Aðgangur að gögnum þínum.</li>
    <li>Leiðrétting á röngum upplýsingum.</li>
    <li>Eyðing gagna þinna.</li>
  </ul>
  <p>Sendu beiðni á <a href="mailto:info@ekkieinn.is">info@ekkieinn.is</a>.</p>
</section>`,
  },
  {
    slug: "skilmalar",
    title: "Skilmálar — EkkiEinn.is",
    menuTitle: "Skilmálar",
    category: "legal",
    metaDescription: "Notkunarskilmálar EkkiEinn.is.",
    content: `<section>
  <h2>Notkunarskilmálar</h2>
  <p>Með því að nota EkkiEinn.is samþykkir þú eftirfarandi skilmála. Þeir eru til staðar til að halda samfélaginu öruggu fyrir alla.</p>
  <h3>Tilgangur</h3>
  <p>EkkiEinn.is er stuðningsvettvangur, ekki staðgengill fyrir bráðaþjónustu, læknishjálp eða lögfræðiráðgjöf. Ef þú ert í bráðri hættu, hringdu í 112.</p>
  <h3>Hegðun á vettvangi</h3>
  <ul>
    <li>Bannað er að nafngreina einstaklinga eða birta persónugreinanlegar upplýsingar.</li>
    <li>Engin hatursorðræða, áreitni eða hótanir.</li>
    <li>Ekki hvetja til ofbeldis eða ólöglegra athafna.</li>
  </ul>
  <p>Umsjónarmenn áskilja sér rétt til að fjarlægja efni og loka aðgöngum sem brjóta gegn skilmálum. Spurningar má senda á <a href="mailto:info@ekkieinn.is">info@ekkieinn.is</a>.</p>
</section>`,
  },
  {
    slug: "samfelag",
    title: "Samfélag — EkkiEinn.is",
    menuTitle: "Samfélag",
    category: "",
    metaDescription:
      "Spjallsvæði og samfélag fyrir karlmenn — deildu reynslu og fáðu stuðning.",
    content: `<section>
  <h2>Samfélagið</h2>
  <p>Spjallsvæðið okkar er öruggt rými til að deila reynslu, fá ráð og finna fólk í sömu stöðu. Til að vernda alla eru nöfn sjálfkrafa fjarlægð úr færslum.</p>
  <h3>Flokkar</h3>
  <ul>
    <li><strong>Almennt</strong> — kynntu þig og talaðu um daginn og veginn.</li>
    <li><strong>Ofbeldi og brot</strong> — deildu reynslu af ofbeldi.</li>
    <li><strong>Löglegar spurningar</strong> — ráðgjöf tengd réttarkerfinu.</li>
    <li><strong>Geðheilsa</strong> — sálfræðilegur stuðningur og bataferli.</li>
    <li><strong>Gerendur</strong> — fyrir þá sem vilja taka ábyrgð (þarf umsókn).</li>
  </ul>
  <h3>Hvernig tek ég þátt?</h3>
  <p>Skráðu þig, veldu þér gælunafn og byrjaðu að taka þátt — nafnlaust ef þú vilt. Sýndu öðrum virðingu; þetta er öruggt rými fyrir alla.</p>
  <p>Farðu á <a href="/samfelag">spjallsvæðið</a> til að byrja.</p>
</section>`,
  },
];
