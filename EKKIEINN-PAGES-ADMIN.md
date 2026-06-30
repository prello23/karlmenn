# EKKIEINN-PAGES-ADMIN.md
## Verkefni: Bæta við "Síður (texti)" í admin stjórnborð á ekkieinn.is

### Markmið
Admin á ekkieinn.is (`/admin`) þarf að geta breytt, bætt við og eytt síðum á síðunni — nákvæmlega eins og karlmenn.outzone.is/admin/pages.

---

## 1. Prisma Schema — Bæta við `Page` model

Í `prisma/schema.prisma`, bæta við:

```prisma
model Page {
  id              Int      @id @default(autoincrement())
  slug            String   @unique  // t.d. "forsida", "um-okkur", "studningur"
  title           String            // Titill síðu (birtist í vafraflipa)
  menuTitle       String            // Heiti í valmynd
  metaDescription String   @default("")
  content         String   @default("")  // HTML content
  updatedAt       DateTime @updatedAt
  createdAt       DateTime @default(now())
}
```

Keyra: `npx prisma migrate dev --name add-pages`

---

## 2. Seed gögn — Búa til allar núverandi síður í DB

Í `prisma/seed.ts` (eða sér skrá `scripts/seed-pages.ts`), bæta við:

```typescript
const pages = [
  { slug: 'forsida', title: 'EkkiEinn.is — Þú ert ekki einn', menuTitle: 'Forsíða', metaDescription: 'Samfélag og stuðningur fyrir karlmenn...', content: '' },
  { slug: 'studningur', title: 'Stuðningur — EkkiEinn.is', menuTitle: 'Stuðningur', metaDescription: '', content: '' },
  { slug: 'um-okkur', title: 'Um okkur — EkkiEinn.is', menuTitle: 'Um okkur', metaDescription: '', content: '' },
  { slug: 'styrkja', title: 'Styrktu EkkiEinn.is', menuTitle: 'Styrktu okkur', metaDescription: '', content: '' },
  { slug: 'neydarhjalp', title: 'Neyðarhjálp — EkkiEinn.is', menuTitle: 'Neyðarhjálp', metaDescription: '', content: '' },
  { slug: 'samband', title: 'Samband — EkkiEinn.is', menuTitle: 'Samband', metaDescription: '', content: '' },
  { slug: 'personuvernd', title: 'Persónuvernd — EkkiEinn.is', menuTitle: 'Persónuvernd', metaDescription: '', content: '' },
  { slug: 'skilmalar', title: 'Skilmálar — EkkiEinn.is', menuTitle: 'Skilmálar', metaDescription: '', content: '' },
];

for (const page of pages) {
  await prisma.page.upsert({
    where: { slug: page.slug },
    update: {},
    create: page,
  });
}
```

---

## 3. API Routes

### GET /api/admin/pages
Skilar lista af öllum síðum (id, slug, menuTitle, updatedAt).  
Krefst admin session.

### GET /api/admin/pages/[id]
Skilar einni síðu með öllu efni.

### PUT /api/admin/pages/[id]
Body: `{ title, menuTitle, metaDescription, content }`  
Uppfærir síðuna. Skilar uppfærðu síðunni.

### POST /api/admin/pages
Body: `{ slug, title, menuTitle, metaDescription, content }`  
Býr til nýja síðu.

### DELETE /api/admin/pages/[id]
Eyðir síðu.

---

## 4. Admin UI — `/app/admin/pages/page.tsx`

**Listi yfir síður:**
- Tafla með dálkum: SÍÐA, SLÓÐ, UPPFÆRT, [Breyta hnappur]
- "Bæta við síðu" hnappur efst til hægri
- Sama útlit og karlmenn.outzone.is/admin/pages (dark theme, gult/orange accent)

```
Síður — texti og myndir
Smelltu á síðu til að breyta öllum texta og myndum á henni.

[Tafla]
SÍÐA        SLÓÐ              UPPFÆRT     [Breyta]
Forsíða     /                 í gær       [Breyta]
Stuðningur  /studningur       í gær       [Breyta]
...
                                    [+ Bæta við síðu]
```

---

## 5. Admin UI — `/app/admin/pages/[id]/page.tsx`

**Breyta síðu form:**
- `Titill síðu` (birtist í vafraflipa) — text input
- `Heiti í valmynd` — text input  
- `Lýsing fyrir leitarvélar` (meta description) — text input
- `Efni síðunnar` — Rich text editor (sjá neðar)
- [Vista breytingar] hnappur
- [Skoða síðu ↗] link efst til hægri
- [Eyða síðu] rauður hnappur neðst (með staðfestingu)

---

## 6. Rich Text Editor

Nota **tiptap** eða **@uiw/react-textarea-code-editor** ef tiptap er þegar í repo.  
Ef ekki, nota einfalt `<textarea>` fyrir HTML content með toolbar:
- H2, H3, ¶ (paragraph), B (bold), I (italic), Listi, Hlekkur, Mynd, Hreinsa, `</> HTML`

Ef tiptap er EKKI installað, nota `react-simple-wysiwyg` (létt, < 10KB):
```
npm install react-simple-wysiwyg
```

---

## 7. Admin Sidebar — Bæta við "Síður (texti)" link

Í admin layout/sidebar component, bæta við link:
```
📄 Síður (texti)   →  /admin/pages
```
Setja hann á milli "Yfirlit" og "Þræðir" í valmyndinni.

---

## 8. Beinar síður renderar (optional — ef síður eru ekki þegar hard-coded)

Ef ekkieinn.is síður eru hard-coded í Next.js routes (t.d. `/app/um-okkur/page.tsx`), EKKI breyta þeim — admin getur bara breytt DB efni sem er svo sýnt á síðunni.

Ef við viljum að DB content birtist á síðunum: bæta við `getPage(slug)` call efst í hverri síðu og sýna `page.content` HTML með `dangerouslySetInnerHTML`.

**ÞETTA ER OPTIONAL** — aðalverkefnið er admin UI til að breyta síðum.

---

## 9. Útlit (design tokens)

Sama dark theme og annars staðar í admin:
- Background: `#0f1117` / `#1a1d2e`
- Card/panel: `#1e2235`
- Accent/highlight: `#f59e0b` (amber/orange)
- Text: `#e2e8f0`
- Border: `#2d3748`
- Hnappar: amber background + dark text

---

## 10. Skref í röð

1. Bæta `Page` model við Prisma schema
2. Keyra migration
3. Seed gögn (núverandi síður)
4. Búa til API routes: GET/PUT/POST/DELETE
5. Admin list page `/admin/pages`
6. Admin edit page `/admin/pages/[id]`
7. Bæta sidebar link við
8. Build og PM2 restart
9. Ýta á beta branch

**MIKILVÆGT:** Ýta ALLTAF á beta branch — ALDREI á main!

```bash
git add -A
git commit -m "feat: add pages admin panel to ekkieinn.is admin"
git push origin beta
```
