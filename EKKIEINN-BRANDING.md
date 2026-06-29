# EKKIEINN BRANDING UPDATE — EkkiEinn

## Task
Replace all user-facing display text instances of "ekkieinn" and "ekkieinn.is" with the correctly branded "EkkiEinn" and "EkkiEinn.is".

## Rules
- **ONLY change display text / UI strings** — NOT code, variables, URLs, API routes, database field names, env keys, or file names
- In running text: "ekkieinn.is" → "EkkiEinn.is"
- In running text: "ekkieinn" (as a name/brand) → "EkkiEinn"
- Do NOT rename files or folders
- Do NOT change URL paths (e.g. `/styrkja`, `/skilmalar` etc. stay the same)
- Do NOT change Next.js config, package.json, or any config files
- Do NOT change CSS class names or IDs
- Do NOT change database schema or Prisma models
- Do NOT change environment variable names

## Scope — files to search and update
Search all `.tsx`, `.ts`, `.md` files under `src/` for user-visible strings.

Key places to check:
- `src/app/layout.tsx` — metadata title/description
- `src/app/page.tsx` — home page content
- `src/app/styrkja/page.tsx` — support/donation page
- `src/app/skilmalar/page.tsx` — terms of service
- `src/app/persónuvernd/page.tsx` — privacy policy (if exists)
- `src/components/` — any component with "ekkieinn" in text
- Any `<title>`, `<meta>`, OpenGraph tags, footer text, nav items, headings, paragraphs

## Examples of what to change
- `"ekkieinn.is"` in a title → `"EkkiEinn.is"`
- `Velkomin á ekkieinn.is` → `Velkomin á EkkiEinn.is`
- `Styrkja ekkieinn` → `Styrkja EkkiEinn`
- `© 2025 ekkieinn.is` → `© 2025 EkkiEinn.is`

## After changes
1. Run `npm run build` to verify no errors
2. Restart PM2: `/home/aiuser/.npm-local/node_modules/pm2/bin/pm2 restart ekkieinn --update-env`
3. Report all files changed

Working directory: `/home/deploy/karlmenn`
