# SPEC: karlmenn.is — Samfélag og stuðningur fyrir karlmenn

## Verkefnislýsing
Vefsíða og samfélag fyrir karlmenn sem hafa:
- Lent í andlegu eða líkamlegu ofbeldi
- Verið logið uppá opinberlega (false accusations)
- Þurft á aðstoð að halda (lögfræðileg, sálfræðileg)
- Viljað bara spjalla við aðra í sömu stöðu

Einnig stuðningur fyrir karlmenn sem eru **gerendur** og vilja breyta hegðun sinni.

---

## Tæknistaðall
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL (eða SQLite í þróun)
- **Auth**: NextAuth.js v5 (email magic link + Google)
- **Payments/Donations**: Stripe (frjáls framlög)
- **Repo**: https://github.com/prello23/karlmenn (public)
- **Branch workflow**: feature → main

---

## Útlit og hönnun — MJÖG MIKILVÆGT
Þetta á **EKKI** að líta út eins og venjulegar íslenskar vefsíður.

**Lykillinn er:**
- Hreint, nútímalegt, traust — líkt og t.d. BetterHelp, HeadsUpGuys, eða CALM (Campaign Against Living Miserably)
- Dökkt en hlýtt litaþema — dökkur bakgrunnur (navy eða charcoal) með hlýjum accent lit (amber/gold)
- Stórar, fallegar myndir/illustrations — ekki stock photos
- Mikið "white space" (eða dark space)
- Letur: stórt, skýrt, San-serif (Inter eða Geist)
- Engar flimrandi animations eða cluttered menus
- Mobile-first

**Litaþema:**
- Background: `#0F1117` (næstum svart)
- Surface: `#1A1F2E` (dökk navy)
- Accent: `#F59E0B` (amber/gold)
- Text: `#F8F9FA` (hvítt)
- Muted: `#6B7280`
- Success/safe: `#10B981` (green)

---

## Síður sem á að búa til (MVP)

### 1. Forsíða (/)
**Hero section:**
- Stór heading: "Þú ert ekki einn." 
- Sub: "Samfélag og stuðningur fyrir karlmenn."
- Tveir CTA hnappir: "Skrá mig" og "Kynna mér meira"
- Bakgrunnsmynd: abstract, masculine, dökk

**Section 2 — Hverjum er þetta ætlað:**
3 kort:
- 🛡️ "Fórnarlamb ofbeldis" — líkamlegt eða andlegt
- ⚖️ "Logið uppá þig" — false accusations, reputation damage
- 🔄 "Gerandi sem vill breyta" — rehabilitation, accountability

**Section 3 — Hvernig virkar þetta:**
1. Skráðu þig (nafnlægt ef þú vilt)
2. Tengstu samfélaginu
3. Fáðu aðstoð — lögfræði eða sálfræðiþjónusta

**Section 4 — Stuðningur:**
- "Allt hér er byggt á frjálsum framlögum frá samfélaginu"
- Donate button
- "Framlög fara til lögfræðilegrar og sálfræðilegrar aðstoðar"

**Section 5 — Bráðabirgðahjálp:**
- Lífi í hættu? Sjálfsvígsíðan: 1717
- Ofbeldi: 112
- Ráðgjafasími karla: [placeholder]

**Footer:**
- Lítil links: Persónuvernd, Skilmálar, Samband
- Email: info@karlmenn.is

---

### 2. Samfélagið (/samfelag)
Forum-líkt — þráðar og svör.

**Flokkar:**
- 💬 Almælt — almennt spjall
- 🛡️ Ofbeldi og brot — deila reynslu
- ⚖️ Löglegar spurningar — ráðgjöf og reynsla
- 🧠 Geðheilsa — sálfræðilegt
- 🔄 Gerendur — sérstakt svæði, þarf umsókn

**Features:**
- Nafnlæg þátttaka (notendur velja gælunafn)
- Upvote kerfi
- Moderator kerfi

---

### 3. Stuðningur (/studningur)
- Listi af lögfræðingum/sálfræðingum (volunteer eða greiddir)
- "Biðja um stuðning" form — tengist admin
- Upplýsingar um réttindi karla

---

### 4. Framlög (/framlög eða /dona)
- Stripe integration
- Sýna hvernig fjármunum er varið
- Mánaðarleg/ein framlög
- Nafnlægt ef þú vilt

---

### 5. Innskráning og notandastjórnun
- /skra — nýskráning
- /innskra — innskráning
- /stillingar — breyta prófíl, nafnlæg stillingar

---

### 6. Upplýsingasíður
- /um-okkur — um verkefnið
- /personuvernd — GDPR
- /skilmalar — terms
- /samband — contact form → info@karlmenn.is
- /neydarhjälp — crisis resources

---

## Database Schema (PostgreSQL)

```sql
-- Notendur
users (id, email, username, display_name, is_anonymous, role, created_at)

-- Forum þráðar
threads (id, category_id, user_id, title, content, upvotes, is_pinned, created_at)

-- Svör
replies (id, thread_id, user_id, content, upvotes, created_at)

-- Framlög
donations (id, amount, currency, stripe_payment_id, is_anonymous, donor_name, created_at)

-- Stuðningsbeiðnir
support_requests (id, user_id, type [legal/psych], description, status, created_at)
```

---

## CLAUDE.md (setja í repo root)

```markdown
# Karlmenn.is — Developer Guide

## Stack
- Next.js 15 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL (prisma ORM)
- NextAuth.js v5
- Stripe

## Commands
- `npm run dev` — þróunarþjónn
- `npm run build` — production build
- `npx prisma db push` — keyra migrations
- `npx prisma studio` — skoða gögn

## Design Philosophy
ALDREI clipart eða stock photos. Alltaf hreint, dökkt, traust útlit.
Litaþema: background #0F1117, accent #F59E0B, text #F8F9FA.
Þetta á að líta út eins og vestræn "men's mental health" vefsíða, ekki íslenskt þjónustusíða.

## Architecture
/app — Next.js App Router síður
/components — UI components
/lib — utilities, db, auth
/prisma — schema
```

---

## Verkefnalisti fyrir Claude Code

1. **Setja upp Next.js 15 + TypeScript + Tailwind + shadcn/ui**
2. **Búa til litaþema** í tailwind.config.ts
3. **Forsíða** — hero, 3 sections, donate CTA, crisis info
4. **Layout** — header með navigation, footer
5. **NextAuth.js** — email magic link auth
6. **Prisma + PostgreSQL schema** — users, threads, replies, donations
7. **Forum síða** — /samfelag með categories og threads
8. **Framlög síða** — Stripe integration (test mode)
9. **Allar upplýsingasíður** — um-okkur, personuvernd, skilmalar, samband, neydarhjálp
10. **README.md** með setup leiðbeiningum

---

## Athugasemdir
- Allt í íslenska tungumáli
- Nafnlæg þátttaka í boði á forum
- GDPR-samhæft (Ísland = EEA)
- Ekkert klæðnaðarmerki eða lógó fyrst — við finnum það seinna
- Mobile-first á öllu
