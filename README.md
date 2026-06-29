# Ekki Einn — ekkieinn.is

> Samfélag og stuðningur fyrir karlmenn. "Þú ert ekki einn."

## Um verkefnið
Vefsíða og samfélag fyrir karlmenn sem þurfa á stuðningi að halda — hvort sem um ræðir ofbeldi, rangar sakir eða geðheilsu.

## Uppsetning

```bash
npm install
cp .env.example .env.local
# Settu inn DATABASE_URL, NEXTAUTH_SECRET o.fl. í .env.local
npx prisma db push
npm run dev
```

## Stack
- Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui
- Prisma + SQLite (dev) / PostgreSQL (prod)
- NextAuth.js v5
- Stripe

## Hýsing
- **Production**: https://ekkieinn.is (VPS 2.24.69.9)
- **Email**: info@ekkieinn.is

## Repo
https://github.com/prello23/karlmenn
