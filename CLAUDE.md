# Ekki Einn — ekkieinn.is — Developer Guide

## Stack
- Next.js 15 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL (Prisma ORM)
- NextAuth.js v5
- Stripe

## Domain
- Production: https://ekkieinn.is
- Staging: https://karlmenn.outzone.is (redirects to ekkieinn.is)
- Email: info@ekkieinn.is

## Package manager check
Before installing packages, run: `which <package>` or `npm ls <package>`
If not found, write a provision script and ask Tasklet agent to run it — NOT user.

## Commands
- `npm run dev` — þróunarþjónn (port 3002)
- `npm run build` — production build
- `npm start` — production server
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

## IMPORTANT
- Domain is ekkieinn.is — NOT karlmenn.is
- Repo name is still "karlmenn" but all code uses ekkieinn.is
- All email references must use info@ekkieinn.is
- Push to main branch (no beta/prod split for this project)


## Learned Rules (from past mistakes)
- **DO NOT rename or delete existing CSS classes** — add new ones if needed, never rename
- **DO NOT restructure working component initialization** — only add new props/sections
- **ALWAYS run `npm run build` and verify ZERO errors before committing**
- **ALWAYS verify the app loads in browser after deploy** (curl http://localhost:3002/admin)
- **Only change files explicitly listed in the spec** — touch NOTHING else
- **If build fails, FIX the error before committing** — never push broken code
- **Push to beta branch ONLY — NEVER push to main**
