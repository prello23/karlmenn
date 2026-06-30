/**
 * Icelandic given-name database (from the public mannanafnaskrá / common usage)
 * plus frequently-used foreign names. Used by:
 *   - gender assessment (registration auto-approval)
 *   - name detection in forum content (privacy moderation)
 *
 * Plain data only — safe to import from server or client. Lookups should use
 * the precomputed lowercased Sets below.
 */

export const MALE_NAMES: string[] = [
  // Most common
  "Jón","Sigurður","Guðmundur","Gunnar","Ólafur","Kristján","Magnús","Stefán",
  "Jóhann","Björn","Árni","Helgi","Einar","Ragnar","Pétur","Karl","Eiríkur",
  "Bjarni","Hallur","Þór","Davíð","Þorsteinn","Friðrik","Sveinn","Haraldur",
  "Gísli","Viktor","Páll","Elvar","Ágúst","Haukur","Ingvar","Valur","Aðalsteinn",
  "Andri","Arnar","Arnór","Aron","Atli","Axel","Baldur","Baldvin","Benedikt",
  "Benjamín","Bergur","Birgir","Birkir","Bjarki","Bjartur","Bogi","Bragi",
  "Brynjar","Brynjólfur","Dagur","Daníel","Egill","Eiður","Elías","Emil",
  "Erlendur","Erling","Eyjólfur","Eysteinn","Eyþór","Finnbogi","Finnur",
  "Fjölnir","Garðar","Geir","Gestur","Gunnlaugur","Gylfi","Hafsteinn","Hafþór",
  "Halldór","Hallgrímur","Hannes","Hávarður","Heiðar","Heimir","Héðinn",
  "Hilmar","Hjalti","Hjörtur","Hlynur","Hólmgeir","Hörður","Hrafn","Hrafnkell",
  "Hreggviður","Hreinn","Húnbogi","Ívar","Indriði","Ingi","Ingimar","Ingólfur",
  "Ísak","Ísleifur","Jakob","Jens","Jóakim","Jóhannes","Jökull","Júlíus",
  "Kári","Ketill","Kjartan","Kolbeinn","Konráð","Kristinn","Kristófer","Lárus",
  "Leifur","Logi","Lúðvík","Markús","Marteinn","Matthías","Mikael","Mörður",
  "Njáll","Óðinn","Ómar","Orri","Óskar","Ottó","Rafn","Reynir","Ríkharður",
  "Róbert","Rúnar","Rögnvaldur","Sæmundur","Sævar","Sebastian","Sigmar",
  "Sigmundur","Sigtryggur","Sigurjón","Sindri","Skúli","Snorri","Snæbjörn",
  "Sófus","Stefnir","Steinar","Steingrímur","Steinþór","Sturla","Styrmir",
  "Svavar","Sverrir","Tómas","Tryggvi","Úlfar","Úlfur","Unnar","Valdimar",
  "Valgeir","Valtýr","Viðar","Vignir","Vilberg","Vilhjálmur","Vilhelm","Þórður",
  "Þórarinn","Þórður","Þorgeir","Þorgils","Þórhallur","Þórir","Þorlákur",
  "Þormóður","Þorvaldur","Þráinn","Þröstur","Ægir","Örn","Örvar","Patrekur",
  "Hákon","Marel","Máni","Breki","Kjarval","Antoní","Alexander","Adam","Anton",
  "Alex","Óliver","Mikkael","Viktor","Tristan","Theódór","Filippus","Frosti",
  "Garpur","Hugi","Kormákur","Loftur","Leó","Nói","Ríkarður","Rökkvi","Starkaður",
];

export const FEMALE_NAMES: string[] = [
  // Most common
  "Guðrún","Sigríður","Kristín","Margrét","Helga","Sigrún","Anna","Jóhanna",
  "Katrín","María","Ingibjörg","Hildur","Þóra","Ragnheiður","Erla","Ásta",
  "Birna","Elín","Hrafnhildur","Jónína","Kolbrún","Linda","Nanna","Ólöf","Rós",
  "Sólveig","Unnur","Valdís","Vigdís","Aðalheiður","Agnes","Alda","Aldís",
  "Alexandra","Andrea","Anný","Arndís","Arney","Arnfríður","Ásdís","Ásgerður",
  "Áslaug","Ásthildur","Auður","Bára","Berglind","Bergþóra","Bertha","Birgitta",
  "Bjarney","Björg","Björk","Bryndís","Brynhildur","Dagbjört","Dagmar","Dagný",
  "Dagrún","Díana","Díanna","Dóra","Dröfn","Edda","Elísabet","Elsa","Embla",
  "Erna","Eva","Eydís","Eygló","Fanney","Fjóla","Fríða","Freyja","Gerður",
  "Gígja","Gréta","Guðbjörg","Guðfinna","Guðlaug","Guðný","Gunnhildur",
  "Gyða","Hafdís","Halla","Halldóra","Hanna","Harpa","Heiða","Heiður","Hekla",
  "Helena","Herdís","Hjördís","Hólmfríður","Hrefna","Hrund","Hugrún","Inga",
  "Ingileif","Ingunn","Íris","Íslín","Jóddís","Jódís","Jóhanný","Jórunn",
  "Júlía","Karen","Karitas","Karólína","Katla","Klara","Kristbjörg",
  "Kristjana","Lára","Laufey","Lilja","Lísa","Lovísa","Magnea","Margrjet",
  "Marín","Marta","Matthildur","Nína","Oddný","Ólína","Perla","Petra","Ragna",
  "Rakel","Rannveig","Rebekka","Regína","Rósa","Rut","Salka","Salóme","Sandra",
  "Sara","Selma","Sif","Sigurlaug","Sigurveig","Silja","Sóley","Sólrún",
  "Steinunn","Stefanía","Svala","Svanhildur","Sæunn","Telma","Thelma","Tinna",
  "Tía","Tóta","Una","Védís","Vala","Valgerður","Védís","Vilborg","Þórdís",
  "Þórhildur","Þórunn","Þuríður","Ýr","Ýrr","Æsa","Ágústa","Árdís","Ásrún",
  "Birta","Eir","Emelía","Emilía","Emma","Eyrún","Glódís","Hrafntinna",
  "Ingveldur","Ísabella","Ísold","Júníana","Kría","Lóa","Mist","Móeiður",
  "Sóldís","Sunna","Tara","Védís","Viktoría","Þórgunnur",
];

/** Lowercased lookup sets (normalised). */
export const MALE_SET = new Set(MALE_NAMES.map((n) => n.trim().toLowerCase()));
export const FEMALE_SET = new Set(
  FEMALE_NAMES.map((n) => n.trim().toLowerCase()),
);

/**
 * Common Icelandic words that begin sentences (and could be capitalised) but
 * are NOT names — never flag these even if capitalised.
 */
export const COMMON_WORD_EXCEPTIONS = new Set(
  [
    "ég","þú","hann","hún","það","við","þið","þeir","þær","þetta","þessi","þar",
    "þá","þegar","svo","en","og","eða","ef","að","á","í","úr","til","frá","með",
    "eftir","áður","núna","nú","já","nei","ekki","mér","mig","minn","sem","var",
    "eru","er","hef","hafði","hér","hvað","hvar","hvernig","af","um","fyrir",
    "sæll","sæl","kær","kæri","kæra","takk","halló","góðan","daginn","kvöld",
    "ástin","ástina","vinur","vinurinn","maðurinn","konan","fólk","allt","allir",
  ].map((w) => w.toLowerCase()),
);

/**
 * A small set of very common names that should be caught even in lowercase
 * (users sometimes lowercase a name to sneak it past moderation).
 */
export const VERY_COMMON_NAMES = new Set(
  [
    "jón","gunnar","anna","jóhanna","kristín","sigurður","helga","guðrún",
    "margrét","ólafur","einar","stefán","björn","katrín","maría","sigríður",
    "magnús","kristján","helgi","pétur","elín","hildur","þóra","ásta","sara",
    "hanna","klara","björk","lilja","emil","aron","alexander","viktor",
  ].map((n) => n.toLowerCase()),
);
