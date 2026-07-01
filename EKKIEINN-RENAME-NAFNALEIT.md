# EKKIEINN-RENAME-NAFNALEIT.md
## Rename "Nafnaleit" → "Er Gerandi skráður" + Front Page Link

### Changes Required

1. **Rename the perpetrator search page**:
   - Current: "Nafnaleit" at `/nafnaleit`
   - New title: **"Er Gerandi skráður"**
   - URL can stay `/nafnaleit` (no need to change route)
   - Update ALL references: page title, nav link, breadcrumbs, any text

2. **Add link on the front page (landing/home page)**:
   - Add a visible, prominent link/button to the "Er Gerandi skráður" search page
   - Should be easy to find — perhaps a card or section on the front page
   - Style it consistently with the rest of the site
   - Text suggestion: "Er Gerandi skráður?" with a search icon 🔍
   - Brief description under: "Athugaðu hvort nafn geranda sé skráð í gagnagrunn okkar"

3. **Also update admin nav**:
   - If admin sidebar has "Nafnaleit" or "Nafnaskrá" — keep admin as "Nafnaskrá" (admin manages the registry)
   - Public-facing page title: "Er Gerandi skráður"

### IMPORTANT
- Do NOT break any existing functionality
- Only rename UI text — do NOT change API routes or database schema
