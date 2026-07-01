# EKKIEINN-RENAME-NAFNALEIT.md (v2)
## Rename "Nafnaleit" → "Er Gerandi skráður" + Front Page Search Widget

### What
1. Rename all references to "Nafnaleit" → **"Er Gerandi skráður"** throughout the app
2. The `/nafnaleit` page route should still work but the title/heading must say "Er Gerandi skráður"
3. **IMPORTANT: Add a search widget directly on the FRONT PAGE (`/`)** — not just a link, but the actual search form embedded on the page
4. Place the search widget **at the bottom of the front page**, before the footer
5. The search widget must be **accessible to EVERYONE** — no login required
6. The `/nafnaleit` page must ALSO be accessible without login (remove any auth guard)

### Front Page Search Widget Design
- Section title: **"Er gerandi skráður?"**
- Subtitle: "Leitaðu að nafni til að athuga hvort viðkomandi sé skráður í gagnagrunn okkar"
- Clean search input with placeholder "Sláðu inn nafn..."
- Search button: "Leita"
- Result appears inline below the input:
  - If found: "✅ Já — viðkomandi er skráður í gagnagrunn"
  - If not found: "❌ Nei — ekkert fannst undir þessu nafni"
  - If empty/error: appropriate message
- Style: Dark card matching the site theme, neat spacing, professional look
- Position: Near bottom of front page, above footer

### Nav link
- Add "Er Gerandi skráður" link in the navigation menu (accessible without login)
- Link points to `/nafnaleit` for the full-page version

### Files to modify
- `src/app/page.tsx` — add search widget section at bottom
- `src/app/nafnaleit/page.tsx` — rename title, remove auth requirement
- `src/app/nafnaleit/actions.ts` — ensure search action works without auth
- Navigation component — add link, no auth guard
