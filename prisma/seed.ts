import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  {
    slug: "almennt",
    name: "Almennt",
    description: "Almennt spjall — kynntu þig og talaðu um daginn og veginn.",
    icon: "💬",
    order: 0,
    restricted: false,
  },
  {
    slug: "ofbeldi-og-brot",
    name: "Ofbeldi og brot",
    description: "Öruggt rými til að deila reynslu af ofbeldi, líkamlegu eða andlegu.",
    icon: "🛡️",
    order: 1,
    restricted: false,
  },
  {
    slug: "loglegar-spurningar",
    name: "Löglegar spurningar",
    description: "Ráðgjöf og reynsla tengd réttarkerfinu, forsjá og ásökunum.",
    icon: "⚖️",
    order: 2,
    restricted: false,
  },
  {
    slug: "gedheilsa",
    name: "Geðheilsa",
    description: "Sálfræðilegur stuðningur, kvíði, þunglyndi og bataferli.",
    icon: "🧠",
    order: 3,
    restricted: false,
  },
  {
    slug: "gerendur",
    name: "Gerendur",
    description:
      "Sérstakt svæði fyrir þá sem vilja taka ábyrgð og breyta hegðun sinni. Þarf umsókn.",
    icon: "🔄",
    order: 4,
    restricted: true,
  },
];

const SETTINGS = [
  {
    key: "verify_email_subject",
    value: "Staðfestu netfangið þitt hjá Ekki einn",
  },
  {
    key: "verify_email_body",
    value: `Halló,

Þú ert að skrá þig á ekkieinn.is — samfélag og stuðningsvettvangur.

Smelltu á linkinn hér að neðan til að staðfesta netfangið þitt:

{{link}}

Ef þú skráðir þig ekki, hunsa þennan póst.

Kveðja,
Teymið hjá Ekki einn`,
  },
  { key: "admin_notification_email", value: "info@ekkieinn.is" },
];

async function main() {
  // Categories
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        description: c.description,
        icon: c.icon,
        order: c.order,
        restricted: c.restricted,
      },
      create: c,
    });
  }
  console.log(`Seeded ${CATEGORIES.length} categories`);

  // Settings
  for (const s of SETTINGS) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log(`Seeded ${SETTINGS.length} settings`);

  // Editable static pages
  const PAGES = [
    {
      slug: "forsida",
      title: "EkkiEinn.is — Þú ert ekki einn",
      menuTitle: "Forsíða",
      metaDescription: "Samfélag og stuðningur fyrir karlmenn.",
    },
    {
      slug: "studningur",
      title: "Stuðningur — EkkiEinn.is",
      menuTitle: "Stuðningur",
      metaDescription: "",
    },
    {
      slug: "um-okkur",
      title: "Um okkur — EkkiEinn.is",
      menuTitle: "Um okkur",
      metaDescription: "",
    },
    {
      slug: "styrkja",
      title: "Styrktu EkkiEinn.is",
      menuTitle: "Styrktu okkur",
      metaDescription: "",
    },
    {
      slug: "neydarhjalp",
      title: "Neyðarhjálp — EkkiEinn.is",
      menuTitle: "Neyðarhjálp",
      metaDescription: "",
    },
    {
      slug: "samband",
      title: "Samband — EkkiEinn.is",
      menuTitle: "Samband",
      metaDescription: "",
    },
    {
      slug: "personuvernd",
      title: "Persónuvernd — EkkiEinn.is",
      menuTitle: "Persónuvernd",
      metaDescription: "",
    },
    {
      slug: "skilmalar",
      title: "Skilmálar — EkkiEinn.is",
      menuTitle: "Skilmálar",
      metaDescription: "",
    },
  ];
  for (const page of PAGES) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: { ...page, content: "" },
    });
  }
  console.log(`Seeded ${PAGES.length} pages`);

  // Admin user
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@ekkieinn.is").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ekkieinn-admin";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", emailVerified: true },
    create: {
      email: adminEmail,
      passwordHash,
      displayName: "Umsjón",
      role: "ADMIN",
      emailVerified: true,
      isAnonymous: false,
    },
  });
  console.log(`Admin user: ${adminEmail} (password: ${adminPassword})`);

  // Welcome thread
  const almennt = await prisma.category.findUnique({
    where: { slug: "almennt" },
  });
  if (almennt) {
    const existing = await prisma.thread.findFirst({
      where: { categoryId: almennt.id },
    });
    if (!existing) {
      await prisma.thread.create({
        data: {
          categoryId: almennt.id,
          authorId: admin.id,
          title: "Velkomin í samfélagið",
          content:
            "Þetta er öruggt rými fyrir karlmenn. Hér máttu tala hreint út, deila reynslu þinni og styðja aðra. Mundu: þú ert ekki einn. Nöfn eru sjálfkrafa fjarlægð úr færslum til að vernda alla.",
          isAnonymous: false,
          isPinned: true,
        },
      });
      console.log("Created welcome thread");
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
