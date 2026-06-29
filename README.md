# Ekki Einn — ekkieinn.is

> Samfélag og stuðningur fyrir karlmenn. „Þú ert ekki einn.“

Vefsíða og samfélag fyrir karlmenn sem þurfa á stuðningi að halda — hvort sem
um ræðir ofbeldi, rangar sakir, geðheilsu eða löngun til að breyta hegðun sinni.

## Stack
- Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui
- Prisma + SQLite (skiptanlegt yfir í PostgreSQL)
- NextAuth.js v5 (Credentials + email-staðfesting)
- Stripe (frjáls framlög)
- Nodemailer (staðfestingarpóstar og admin-tilkynningar)

## Uppsetning (þróun)

```bash
npm install
cp .env.example .env          # fylltu inn gildi
npx prisma db push            # býr til gagnagrunninn
npm run db:seed               # flokkar, stillingar og admin-aðgangur
npm run dev                   # http://localhost:3002
```

### Skipanir
| Skipun | Lýsing |
| --- | --- |
| `npm run dev` | Þróunarþjónn (port 3002) |
| `npm run build` | `prisma generate` + production build |
| `npm start` | Production þjónn (port 3002) |
| `npm run db:push` | Keyra schema í gagnagrunn |
| `npm run db:seed` | Sá grunngögnum |
| `npm run db:studio` | Skoða gögn í Prisma Studio |

## Aðgangur stjórnanda
`npm run db:seed` býr til admin-aðgang:
- **Netfang:** `admin@ekkieinn.is` (eða `ADMIN_EMAIL`)
- **Lykilorð:** `ekkieinn-admin` (eða `ADMIN_PASSWORD`) — **breyttu í alvöru umhverfi**

Stjórnkerfið er á `/admin` (þræðir, notendur, flokkar, stillingar).

## Eiginleikar
- **Forsíða, um okkur, neyðarhjálp, persónuvernd, skilmálar, samband** — opið öllum.
- **Samfélag (`/samfelag`)** — krefst innskráningar. Flokkar, þræðir, svör, upvote.
- **Innskráning krafist** til að sjá og skrifa í þræði.
- **Email-staðfesting** við nýskráningu (eins-nota token, rennur út eftir 48 klst).
- **Nafnaúrvinnsla (AI):** mannanöfn eru sjálfkrafa fjarlægð úr þráðum áður en
  þeir eru vistaðir (`[AAA]`, `[BBB]` …). Svör sem innihalda nöfn eru flögguð og
  admin fær tilkynningu. Notar Anthropic/OpenAI ef API-lykill er settur, annars
  innbyggða íslenska heuristíku.
- **Trúnaðarreitir:** nafn þolanda/geranda eru geymd en aldrei birt — aðeins
  sýnileg admin, og hægt að leita eftir geranda til að finna tengd mál.
- **Stjórnkerfi:** umsjón með þráðum, notendum (hlutverk), flokkum (bæta við /
  breyta nafni / eyða) og stillingum (texti staðfestingarpósts).
- **Framlög (`/dona`):** Stripe Checkout (test eða live).

## Umhverfisbreytur
Sjá `.env.example`. Helstu:
`DATABASE_URL`, `AUTH_SECRET`/`NEXTAUTH_SECRET`, `NEXTAUTH_URL`,
`SMTP_HOST`/`SMTP_PORT`/`SMTP_SECURE`/`SMTP_FROM`, `NEXT_PUBLIC_APP_URL`,
`ANTHROPIC_API_KEY` eða `OPENAI_API_KEY` (valfrjálst), `STRIPE_SECRET_KEY`
(valfrjálst).

## Hýsing
- **Production:** https://ekkieinn.is (VPS, PM2 á porti 3002, sjá `ecosystem.config.js`)
- Sjálfvirk útgáfa með GitHub Actions (`.github/workflows/deploy.yml`) við push á `main`.
- **Email:** info@ekkieinn.is

## Repo
https://github.com/prello23/karlmenn
