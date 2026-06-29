# Claude Code — Build ekkieinn.is

**Vinsamlegast lestu SPEC.md og CLAUDE.md fyrst.**

## Verkefni: Byggja fullkomið Next.js app fyrir ekkieinn.is

**MIKILVÆGT:**
- Lénið er `ekkieinn.is` (EKKI karlmenn.is) 
- Email: `info@ekkieinn.is` (EKKI karlmenn.is)
- Repo heitir `karlmenn` en allur kóðinn á að nota `ekkieinn.is`
- Production port: **3002**

## Skref fyrir skref:

### 1. Setja upp Next.js 15 app
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```
(Ef það spyr um yfirskrifa, samþykkja allt)

### 2. Setja upp shadcn/ui
```bash
npx shadcn@latest init
```

### 3. Búa til litaþema í tailwind.config.ts
```ts
colors: {
  background: '#0F1117',
  surface: '#1A1F2E',
  accent: { DEFAULT: '#F59E0B', foreground: '#0F1117' },
  muted: { DEFAULT: '#6B7280', foreground: '#F8F9FA' },
  success: '#10B981',
}
```

### 4. Setja upp Prisma
```bash
npm install @prisma/client prisma
npx prisma init --datasource-provider sqlite
```
Nota schema úr SPEC.md.

### 5. Búa til allar síður úr SPEC.md:
- `/` — Forsíða (hero: "Þú ert ekki einn.", 3 kort, donate CTA, bráðabirgðahjálp)
- `/samfelag` — Forum
- `/studningur` — Stuðningur  
- `/framlög` — Framlög/Donate
- `/um-okkur` — Um okkur
- `/personuvernd` — Persónuvernd
- `/skilmalar` — Skilmálar
- `/samband` — Samband (form → info@ekkieinn.is)
- `/neydarhjälp` — Neyðarhjálp

### 6. Header + Footer
Footer á að hafa: Persónuvernd · Skilmálar · Samband · info@ekkieinn.is

### 7. Búa til .env.example
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="https://ekkieinn.is"
NEXTAUTH_SECRET="change-me"
NEXT_PUBLIC_SITE_URL="https://ekkieinn.is"
```

### 8. Búa til ecosystem.config.js fyrir PM2
```js
module.exports = {
  apps: [{
    name: 'ekkieinn',
    script: 'node_modules/.bin/next',
    args: 'start -p 3002',
    env: { NODE_ENV: 'production', PORT: '3002' }
  }]
}
```

### 9. Keyra build test
```bash
cp .env.example .env.local
npx prisma db push
npm run build
```
Build á að klára án errors.

### 10. Push til GitHub
```bash
git add -A
git commit -m "feat: complete ekkieinn.is Next.js app"
git push origin main
```

## Athugasemdir
- Öll texti á Íslensku
- Nota dökkt litaþema (background #0F1117, accent #F59E0B)
- Mobile-first design
- Forsíðan á að vera mjög sterk viðtakandi síða
- Engar stock photos — nota SVG illustrations eða abstract shapes
