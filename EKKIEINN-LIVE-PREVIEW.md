# EKKIEINN-LIVE-PREVIEW.md — Admin Page Editor Live Preview

## Goal
The TipTap page editor in admin must show content EXACTLY as it appears on the live public page. Currently the editor area has generic/plain styling that doesn't match the actual rendered page. Fix this so it's a true WYSIWYG experience.

## Requirements

### 1. Style TipTap editor to match public page
The `.ProseMirror` content area inside the TipTap editor must use the SAME CSS styling as the public page renders content:
- Same font family, sizes, line-height, letter-spacing
- Same heading styles (H2, H3) — size, weight, color, margin
- Same paragraph spacing
- Same bullet list styling (dots, indentation, spacing)
- Same link colors and hover states
- Same background color as the public page content area (dark background)
- Same max-width and padding as public page content

### 2. Add Live Preview panel below editor
Below the TipTap editor toolbar + content area, add a **"Forskoðun" (Preview)** section:
- Separated by a divider/heading "👁️ Forskoðun"
- Renders the current editor HTML in real-time as you type
- Uses the EXACT same component/CSS as the public `[slug]/page.tsx` renders
- Shows the page title (from the title input field) as H1 at the top
- Shows the full content below with proper page styling
- Updates live as user types in the editor (no save needed)
- Wraps content in same container/card styling as public page

### 3. Implementation approach
- Extract the public page's content rendering CSS into a shared stylesheet or component
- Import those styles into both the public page AND the admin editor
- For the preview: render the editor's `getHTML()` output using `dangerouslySetInnerHTML` inside a styled container that mirrors the public page layout
- Use a React `useEffect` or TipTap's `onUpdate` to keep preview in sync

### 4. Mobile responsive
- The preview must work on mobile (the admin is used on phone too)
- Stack editor and preview vertically on mobile
- On desktop, optionally side-by-side or stacked

## What NOT to do
- Do NOT add an iframe — use a styled div with the same CSS classes
- Do NOT remove any existing editor functionality
- Do NOT change the toolbar buttons

## Files to check
- `src/app/admin/pages/[id]/edit/page.tsx` or similar — the editor page
- `src/app/[slug]/page.tsx` — the public page rendering
- `src/components/TipTapEditor.tsx` or similar — the editor component
- Public page CSS/Tailwind classes for content rendering

## Testing
1. Go to /admin → Síður → click Breyta on any page (e.g., "Um okkur")
2. The editor content area should look like the live page (dark bg, proper heading sizes, styled lists)
3. Below the editor, the "Forskoðun" section should show the page exactly as it appears at ekkieinn.is/um-okkur
4. Type in the editor → preview updates in real-time
5. Test on mobile — should be readable and usable
