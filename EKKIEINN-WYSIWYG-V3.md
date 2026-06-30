# EKKIEINN WYSIWYG V3 — Editor Must Match Public Page

## Problem

The page editor (admin/pages/[id]) does NOT look like the public page. The user wants the editor to be a visual WYSIWYG where the editor IS the page — exactly like karlmenn.outzone.is does it.

### Root Cause

Currently ekkieinn.is uses TWO rendering systems:
1. **Public pages** — Custom React components (hero sections, cards, steps, emergency numbers) defined in code, NOT stored in DB
2. **Admin editor** — Shows only the DB `content` field (simple h2/p/ul HTML)

In karlmenn.outzone.is (the PHP reference site at /var/www/karlmenn/), ALL page content — including shield icons, styled buttons, section headers, centered text, everything — is stored as HTML in the database. The admin editor is a contenteditable div that loads the same `styles.css` as the public pages. So the editor IS the page.

### What Must Change

Convert ekkieinn.is to the karlmenn model: **ALL visual content must be stored as HTML in the DB content field**, and the public page must render that HTML with shared CSS.

## Implementation Plan

### Step 1: Create shared content CSS (`public-content.css`)

Create a CSS file that styles the page content to match the current public page design. This CSS must be loaded in BOTH the editor and public pages.

The CSS should handle:
- `text-align: center` for hero sections
- Gold/amber section labels (`.section-label` — uppercase, letter-spacing, color: #d97706)
- Large headings (h2 — 2rem+, font-weight bold, white)
- Subheadings (h3 — 1.5rem, white)
- Paragraphs (color: #9ca3af, line-height 1.75)
- Bullet lists (styled, white text, proper spacing)
- Links (color: #d97706, hover underline)
- Feature cards (grid layout, dark background cards with icons)
- Styled buttons (`.btn-primary` golden, `.btn-outline` bordered)
- Emergency cards (colored borders — red, orange, gray)
- Images (max-width 100%, rounded)
- Section dividers
- Responsive (mobile-friendly)

Reference: Look at how the public forsíða currently renders (React components in `src/app/page.tsx` or `src/components/db-page.tsx`) and extract the equivalent CSS rules.

### Step 2: Update ALL page DB content to include full styled HTML

For EACH page in the database, update the `content` field to contain the FULL HTML that produces the same visual result as the current public page.

**IMPORTANT**: Do NOT just paste raw React JSX. Convert each page's visual output to plain HTML that works with the shared CSS.

For the forsíða specifically, the HTML content must include:
- Hero section with centered heading, subtitle, and button links
- "Hverjum er þetta ætlað" section with feature cards
- "Hvernig virkar þetta" steps section
- "Byggt á frjálsum framlögum" section with styled button
- "Þarftu hjálp núna?" emergency section with phone numbers

For other pages (Um okkur, Stuðningur, Samfélag, Neyðarhjálp, Styrktu okkur, Skilmálar, Persónuvernd, Samband):
- Export their current visual content to HTML
- Include all styled elements

### Step 3: Update public page rendering

Modify `src/components/db-page.tsx` (or wherever pages are rendered publicly) to:
1. Render the DB `content` field inside a div with class `page-content`
2. Load the shared `public-content.css`
3. Remove or simplify the hardcoded React components for forsíða (since content is now in DB)

The public pages MUST look the same after this change. Use the CSS to replicate the exact same visual appearance.

### Step 4: Update the editor

The editor contenteditable div (`src/components/admin/tiptap-editor.tsx`) must:
1. Have the class `page-content` on the contenteditable div
2. Load the shared `public-content.css`
3. Render the full HTML content from the DB

The editor MUST look like the public page — centered text, gold section labels, styled cards, buttons, icons, etc.

### Step 5: Build & test

1. `npm run build` — must compile with NO errors
2. Smoke test:
   - curl localhost:3002 → 200 (forsíða)
   - curl localhost:3002/um-okkur → 200
   - curl localhost:3002/admin → 307 (redirect to login)
   - curl localhost:3002/admin/pages/1 → 200
3. Check that the editor HTML includes hero section elements
4. Check that public page renders correctly

### Step 6: Deploy

```bash
cd /home/deploy/karlmenn && git pull origin beta && npm run build && /home/aiuser/.npm-local/node_modules/pm2/bin/pm2 restart ekkieinn
```

## Critical Rules

- Do NOT break existing functionality (moderation, approval flow, threads, etc.)
- Do NOT change authentication or user flows
- The public pages MUST look identical or better after the change
- The editor MUST show the same visual content as the public page
- Mobile responsive — must work on phone screens
- Use the SAME `page-content` class for both editor and public rendering
- Keep the toolbar (H2, H3, ¶, B, I, Listi, Hlekkur, Mynd, Hreinsa, HTML)
- Do NOT remove any existing pages from the database

## Reference Files

- Karlmenn PHP styles: `/var/www/karlmenn/public/styles.css` (358 lines)
- Karlmenn PHP admin: `/var/www/karlmenn/public/admin.css`
- Ekkieinn globals: `/home/deploy/karlmenn/src/app/globals.css` (has `.page-content` and `.tiptap-content`)
- Ekkieinn editor: `/home/deploy/karlmenn/src/components/admin/tiptap-editor.tsx`
- Ekkieinn page editor: `/home/deploy/karlmenn/src/components/admin/page-editor.tsx`
- Ekkieinn DB page component: `/home/deploy/karlmenn/src/components/db-page.tsx`
- Ekkieinn public pages: check `src/app/page.tsx` and `src/app/[slug]/page.tsx`
- Database: `/home/deploy/karlmenn/prod.db` (SQLite, Prisma)
