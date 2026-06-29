/**
 * Static content used across the site. Forum categories here mirror the seed
 * data in prisma/seed.ts so pages render meaningfully even without a database.
 */

export type ForumCategory = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  restricted?: boolean;
};

export const FORUM_CATEGORIES: ForumCategory[] = [
  {
    slug: "almennt",
    name: "Almennt",
    description: "Almennt spjall — kynntu þig og talaðu um daginn og veginn.",
    icon: "💬",
  },
  {
    slug: "ofbeldi-og-brot",
    name: "Ofbeldi og brot",
    description: "Öruggt rými til að deila reynslu af ofbeldi, líkamlegu eða andlegu.",
    icon: "🛡️",
  },
  {
    slug: "loglegar-spurningar",
    name: "Löglegar spurningar",
    description: "Ráðgjöf og reynsla tengd réttarkerfinu, forsjá og ásökunum.",
    icon: "⚖️",
  },
  {
    slug: "gedheilsa",
    name: "Geðheilsa",
    description: "Sálfræðilegur stuðningur, kvíði, þunglyndi og bataferli.",
    icon: "🧠",
  },
  {
    slug: "gerendur",
    name: "Gerendur",
    description:
      "Sérstakt svæði fyrir þá sem vilja taka ábyrgð og breyta hegðun sinni. Þarf umsókn.",
    icon: "🔄",
    restricted: true,
  },
];

export type CrisisLine = {
  name: string;
  number: string;
  description: string;
  urgent?: boolean;
};

export const CRISIS_LINES: CrisisLine[] = [
  {
    name: "Neyðarlínan",
    number: "112",
    description: "Bráð hætta, ofbeldi eða lífshættulegt ástand. Hringdu strax.",
    urgent: true,
  },
  {
    name: "Píeta samtökin — sjálfsvígsforvarnir",
    number: "552-2218",
    description: "Sólarhringsvakt fyrir fólk með sjálfsvígshugsanir og aðstandendur.",
    urgent: true,
  },
  {
    name: "Hjálparsími Rauða krossins",
    number: "1717",
    description: "Opið allan sólarhringinn. Trúnaður, nafnleynd og hlustun.",
  },
  {
    name: "Heilsuvera — netspjall",
    number: "1700",
    description: "Ráðgjöf hjúkrunarfræðinga um heilsu og líðan.",
  },
];

export type Supporter = {
  name: string;
  role: string;
  field: "legal" | "psych";
  description: string;
  availability: string;
};

export const SUPPORTERS: Supporter[] = [
  {
    name: "Lögfræðiþjónusta í sjálfboðavinnu",
    role: "Lögfræðingur",
    field: "legal",
    description:
      "Almenn ráðgjöf um réttindi, forsjármál og hvernig á að bregðast við ásökunum.",
    availability: "Eftir samkomulagi",
  },
  {
    name: "Sálfræðiráðgjöf",
    role: "Sálfræðingur",
    field: "psych",
    description:
      "Stuðningur við áföll, kvíða og þunglyndi. Bæði einstaklings- og hópviðtöl.",
    availability: "Biðlisti — sækjum um styrki",
  },
  {
    name: "Jafningjastuðningur",
    role: "Sjálfboðaliði",
    field: "psych",
    description:
      "Karlmenn sem hafa gengið í gegnum svipaða reynslu og bjóða hlustun og leiðsögn.",
    availability: "Í gegnum samfélagið",
  },
];

export const DONATION_PRESETS = [1500, 3500, 7500] as const;

export const SITE = {
  name: "Ekki einn",
  domain: "ekkieinn.is",
  tagline: "Samfélag og stuðningur fyrir karlmenn.",
  email: "info@ekkieinn.is",
} as const;

/** Public base URL of the app (used in emails and metadata). */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://ekkieinn.is";
