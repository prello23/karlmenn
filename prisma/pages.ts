// Canonical content for the editable static pages, seeded into the Page table.
// Content is FULL styled HTML using the shared `.page-content` classes
// (see src/app/public-content.css) so the admin editor renders identically to
// the live public page (WYSIWYG V3).

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
    content: `<section class="hero">
  <span class="badge-pill">🔒 Nafnlaust · Öruggt · Trúnaður</span>
  <h1>Þú ert ekki einn.</h1>
  <p class="lead">Samfélag og stuðningur fyrir karlmenn.</p>
  <div class="btn-row">
    <a class="btn-primary" href="/skra">Skrá mig →</a>
    <a class="btn-outline" href="/um-okkur">Kynna mér meira</a>
  </div>
</section>

<section>
  <div class="center">
    <span class="section-label">Hverjum er þetta ætlað</span>
    <h2>Hér er pláss fyrir þig</h2>
    <p class="lead">Sama hver staða þín er — þú átt skilið stuðning, hlustun og virðingu.</p>
  </div>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="icon">🛡️</div>
      <h3>Fórnarlamb ofbeldis</h3>
      <p>Hefur þú orðið fyrir líkamlegu eða andlegu ofbeldi? Hér er rými þar sem þér er trúað og hlustað á þig — án dóma.</p>
    </div>
    <div class="feature-card">
      <div class="icon">⚖️</div>
      <h3>Logið uppá þig</h3>
      <p>Rangar ásakanir og mannorðsskaði geta brotið mann niður. Fáðu stuðning, ráðgjöf og fólk sem skilur stöðuna.</p>
    </div>
    <div class="feature-card">
      <div class="icon">🔄</div>
      <h3>Gerandi sem vill breyta</h3>
      <p>Að taka ábyrgð er hugrekki. Hér er stuðningur fyrir þá sem vilja breyta hegðun sinni og verða betri.</p>
    </div>
  </div>
</section>

<section>
  <div class="center">
    <span class="section-label">Hvernig virkar þetta</span>
    <h2>Þrjú einföld skref</h2>
  </div>
  <div class="steps">
    <div class="step">
      <div class="num">1</div>
      <h3>Skráðu þig</h3>
      <p>Þú getur tekið þátt nafnlaust með gælunafni. Engin krafa um að gefa upp hver þú ert.</p>
    </div>
    <div class="step">
      <div class="num">2</div>
      <h3>Tengstu samfélaginu</h3>
      <p>Deildu reynslu þinni, lestu sögur annarra og finndu fólk sem er í sömu stöðu.</p>
    </div>
    <div class="step">
      <div class="num">3</div>
      <h3>Fáðu aðstoð</h3>
      <p>Lögfræðileg og sálfræðileg ráðgjöf frá fagfólki.</p>
    </div>
  </div>
</section>

<section>
  <div class="cta-box">
    <div class="icon">❤️</div>
    <h2>Byggt á frjálsum framlögum</h2>
    <p class="lead">Allt hér er byggt á frjálsum framlögum frá samfélaginu. Framlög fara beint til lögfræðilegrar og sálfræðilegrar aðstoðar fyrir karlmenn sem þurfa á henni að halda.</p>
    <div class="btn-row">
      <a class="btn-primary" href="/styrkja">❤️ Styðja verkefnið</a>
    </div>
  </div>
</section>

<section>
  <div class="center">
    <span class="section-label">Bráðabirgðahjálp</span>
    <h2>Þarftu hjálp núna?</h2>
    <p class="lead">Ef líf liggur við eða þú ert í bráðri hættu — hikaðu ekki við að hringja.</p>
  </div>
  <div class="emergency-grid">
    <div class="emergency-card red"><a href="tel:112"><span class="num">112</span></a><p>Neyðarlínan — bráð hætta eða ofbeldi.</p></div>
    <div class="emergency-card red"><a href="tel:5522218"><span class="num">552-2218</span></a><p>Píeta — sjálfsvígsforvarnir, allan sólarhringinn.</p></div>
    <div class="emergency-card orange"><a href="tel:1717"><span class="num">1717</span></a><p>Hjálparsími Rauða krossins — trúnaður og hlustun.</p></div>
    <div class="emergency-card orange"><a href="tel:1700"><span class="num">1700</span></a><p>Heilsuvera — ráðgjöf hjúkrunarfræðinga.</p></div>
  </div>
  <p class="center muted" style="margin-top:1.5rem">Sjá öll úrræði á <a href="/neydarhjalp">neyðarhjálparsíðunni</a>.</p>
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
  <span class="section-label">Stuðningur</span>
  <h2>Þú þarft ekki að gera þetta einn</h2>
  <p>Við bjóðum upp á þrjár tegundir stuðnings. Þú velur það sem hentar þér — og mátt nýta allt.</p>
</section>
<section>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="icon">⚖️</div>
      <h3>Lögfræðileg aðstoð</h3>
      <p>Ráðgjöf um réttindi þín, forsjármál og hvernig á að bregðast við ásökunum.</p>
    </div>
    <div class="feature-card">
      <div class="icon">🧠</div>
      <h3>Sálfræðileg aðstoð</h3>
      <p>Stuðningur við áföll, kvíða og þunglyndi — einstaklings- og hópviðtöl.</p>
    </div>
    <div class="feature-card">
      <div class="icon">💬</div>
      <h3>Samfélagslegur stuðningur</h3>
      <p>Á <a href="/samfelag">spjallsvæðinu</a> hittir þú aðra karlmenn sem skilja stöðuna.</p>
    </div>
  </div>
</section>
<section>
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
  <span class="section-label">Um verkefnið</span>
  <h2>Þú ert ekki einn</h2>
  <p>Margir karlmenn ganga í gegnum erfiða tíma í þögn. Of oft er engin augljós leið til að leita sér aðstoðar. Við viljum breyta því.</p>
  <p>Markmið okkar er einfalt: að búa til öruggt rými þar sem karlmenn geta talað hreint út, fengið stuðning frá öðrum í sömu stöðu og tengst faglegri aðstoð.</p>
</section>
<section>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="icon">🛡️</div>
      <h3>Öryggi og trúnaður</h3>
      <p>Þú ræður hversu mikið þú segir og hvort þú ert nafnlaus.</p>
    </div>
    <div class="feature-card">
      <div class="icon">🤝</div>
      <h3>Samfélag án dóma</h3>
      <p>Hér mætir þú öðrum sem skilja. Engir dómar — bara stuðningur.</p>
    </div>
    <div class="feature-card">
      <div class="icon">🔒</div>
      <h3>Vernd nafnleyndar</h3>
      <p>Nöfn eru fjarlægð úr færslum svo enginn er nafngreindur á opnum vettvangi.</p>
    </div>
  </div>
</section>
<section>
  <div class="cta-box">
    <div class="icon">❤️</div>
    <h2>Verkefni byggt á samstöðu</h2>
    <p class="lead">Ekki einn er rekið án hagnaðarsjónarmiða og byggir á frjálsum framlögum og sjálfboðavinnu.</p>
    <div class="btn-row">
      <a class="btn-primary" href="/skra">Vertu með</a>
      <a class="btn-outline" href="/styrkja">Styðja verkefnið</a>
    </div>
  </div>
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
  <span class="section-label">Framlög</span>
  <h2>Saman gerum við gæfumuninn</h2>
  <p>Allt á EkkiEinn.is er byggt á frjálsum framlögum frá samfélaginu. Hver króna fer beint til þeirra sem þurfa á aðstoð að halda.</p>
</section>
<section>
  <h3>Hvernig er fjármunum varið?</h3>
  <ul>
    <li><strong>Lögfræðiaðstoð</strong> fyrir menn sem standa frammi fyrir ásökunum eða forsjármálum.</li>
    <li><strong>Sálfræðiþjónusta</strong> — niðurgreidd viðtöl fyrir þá sem hafa ekki efni á því sjálfir.</li>
    <li><strong>Vitundarvakning</strong> til að ná til fleiri karlmanna sem þurfa stuðning.</li>
  </ul>
</section>`,
  },
  {
    slug: "neydarhjalp",
    title: "Neyðarhjálp — EkkiEinn.is",
    menuTitle: "Neyðarhjálp",
    category: "contact",
    metaDescription: "Neyðarnúmer og úrræði fyrir karlmenn í bráðri hættu.",
    content: `<section class="hero">
  <span class="section-label">Neyðarhjálp</span>
  <h1>Þarftu hjálp núna?</h1>
  <p class="lead">Þú ert ekki einn. Ef líf liggur við, hikaðu ekki við að hringja í neyðarlínuna.</p>
</section>
<section>
  <div class="emergency-grid">
    <div class="emergency-card red"><a href="tel:112"><span class="num">112</span></a><p>Neyðarlínan — bráð hætta, ofbeldi eða lífshættulegt ástand.</p></div>
    <div class="emergency-card red"><a href="tel:5522218"><span class="num">552-2218</span></a><p>Píeta samtökin — sjálfsvígsforvarnir, allan sólarhringinn.</p></div>
    <div class="emergency-card orange"><a href="tel:1717"><span class="num">1717</span></a><p>Hjálparsími Rauða krossins — trúnaður og nafnleynd.</p></div>
    <div class="emergency-card orange"><a href="tel:1700"><span class="num">1700</span></a><p>Heilsuvera — ráðgjöf hjúkrunarfræðinga.</p></div>
  </div>
</section>
<section>
  <h2>Önnur úrræði</h2>
  <ul>
    <li><strong>Bjarkarhlíð</strong> — þjónustumiðstöð fyrir þolendur ofbeldis, einnig karla.</li>
    <li><strong>Heimilisfriður</strong> — meðferð fyrir þá sem beita ofbeldi og vilja breyta hegðun sinni.</li>
    <li><strong>Stígamót</strong> — ráðgjöf fyrir þolendur kynferðisofbeldis.</li>
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
  <span class="section-label">Samband</span>
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
  <span class="section-label">Persónuvernd</span>
  <h2>Persónuverndarstefna</h2>
  <p>Við tökum persónuvernd alvarlega, í samræmi við GDPR og íslensk lög.</p>
  <h3>Hvaða gögnum söfnum við?</h3>
  <p>Aðeins því sem nauðsynlegt er: netfangi við skráningu, valfrjálsu gælunafni og því efni sem þú birtir sjálf(ur). Þú getur tekið þátt nafnlaust.</p>
  <h3>Nafnleynd og nöfn í færslum</h3>
  <p>Mannanöfn eru fjarlægð úr færslum áður en þær birtast. Trúnaðarupplýsingar sem þú gefur sérstaklega upp eru aldrei birtar opinberlega.</p>
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
  <span class="section-label">Skilmálar</span>
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
  <span class="section-label">Samfélag</span>
  <h2>Samfélagið</h2>
  <p>Spjallsvæðið okkar er öruggt rými til að deila reynslu, fá ráð og finna fólk í sömu stöðu. Til að vernda alla eru nöfn fjarlægð úr færslum.</p>
  <h3>Flokkar</h3>
  <ul>
    <li><strong>Almennt</strong> — kynntu þig og talaðu um daginn og veginn.</li>
    <li><strong>Ofbeldi og brot</strong> — deildu reynslu af ofbeldi.</li>
    <li><strong>Löglegar spurningar</strong> — ráðgjöf tengd réttarkerfinu.</li>
    <li><strong>Geðheilsa</strong> — sálfræðilegur stuðningur og bataferli.</li>
    <li><strong>Gerendur</strong> — fyrir þá sem vilja taka ábyrgð (þarf umsókn).</li>
  </ul>
  <p>Farðu á <a href="/samfelag">spjallsvæðið</a> til að byrja.</p>
</section>`,
  },
];
