# EKKIEINN-RICH-EDITOR.md — Upgrade Pages Admin Editor

## Goal
Upgrade the admin pages editor at `/admin/pages/[id]` to match the rich editor on karlmenn.outzone.is. The current `react-simple-wysiwyg` is too basic.

## Requirements

### 1. Replace WYSIWYG Editor
Replace `react-simple-wysiwyg` with **TipTap** (or equivalent rich editor). The toolbar must have these buttons in order:

| Button | Function |
|--------|----------|
| H2 | Heading level 2 |
| H3 | Heading level 3 |
| ¶ | Normal paragraph |
| **B** | Bold |
| *I* | Italic |
| • Listi | Bullet list |
| 🔗 Hlekkur | Insert/edit link |
| 🖼️ Mynd | Insert image (upload or URL) |
| 🔄 Hreinsa | Clear formatting |
| </> HTML | Toggle raw HTML view |

### 2. Rich Content Display
- The editor area must show formatted content live (WYSIWYG) — not plain text
- Headers should render as actual headers
- Links should be clickable in preview
- Images should display inline

### 3. Image Upload
- Add image upload support — upload to `/uploads/` directory or store as base64
- "Mynd" button should open a dialog: paste URL or upload file
- Uploaded images stored in `public/uploads/` directory

### 4. HTML Toggle
- "</> HTML" button toggles between WYSIWYG view and raw HTML source
- User can edit HTML directly and switch back to see rendered result

### 5. Content Quality
- Update ALL existing page content in the database seed to have proper rich HTML:
  - Use `<section>` wrappers
  - Use `<h2>`, `<h3>` headings
  - Use `<p>` paragraphs  
  - Use `<a href="...">` links where appropriate (e.g., link to /neydarhjalp from studningur page)
  - Use `<ul><li>` lists where appropriate
- Each page should have substantial, well-formatted content (not just 1-2 sentences)

### 6. Styling
- Keep the dark theme admin UI
- Editor toolbar: dark background, light text, hover highlights
- Editor area: slightly lighter background for content area
- Match the look of karlmenn.outzone.is/admin/pages editor

## Pages Content Guide
Update these pages with rich formatted Icelandic content:

1. **Forsíða** — Welcome, mission statement, what EkkiEinn.is offers
2. **Stuðningur** — Support resources, three types of support (legal, psychological, community)
3. **Um okkur** — About the organization, mission, values
4. **Styrktu okkur** — How to donate, why support matters, link to /styrkja
5. **Neyðarhjálp** — Emergency contacts (112, 1717, Rauði krossinn, etc.)
6. **Samband** — Contact info (info@ekkieinn.is), social media links
7. **Persónuvernd** — Privacy policy
8. **Skilmálar** — Terms of service
9. **Samfélag** — Community features, discussion forum, how to participate

## Technical Notes
- Install TipTap: `npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-placeholder`
- The editor component is in the admin pages edit page
- Keep the existing API routes (`/api/admin/pages/[id]`) unchanged
- After changes: `npm run build` and `pm2 restart ekkieinn`
