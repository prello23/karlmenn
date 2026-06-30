# EKKIEINN Live Preview V2 — Bug Fix & Proper Implementation

## ⚠️ CRITICAL RULES
1. **DO NOT rename or delete any existing CSS classes** — `.tiptap-content` and `.page-content` must both remain as-is
2. **DO NOT restructure the TipTap toolbar or editor initialization** — only ADD the preview panel
3. **DO NOT change any imports that already work**
4. **DO NOT touch any files other than the two listed below**
5. **Test with `npm run build` BEFORE committing — if build fails, FIX the error, do not commit broken code**
6. **Push to beta ONLY**

## Problem
The previous attempt crashed ekkieinn.is/admin with a client-side exception. The editor must not break.

## What to implement
Add a **read-only live preview panel** below the TipTap editor that renders content exactly like the public page.

## Reference: karlmenn.outzone.is
The working admin at karlmenn.outzone.is/admin uses:
- Same dark background `rgb(11, 13, 19)` in editor
- Same CSS variables as public pages
- Same heading sizes, link colors, bullet styling
- The editor itself looks like the live page

## Files to change (ONLY THESE TWO):

### 1. `src/components/admin/tiptap-editor.tsx`

**What to add** (at the end of the component, AFTER the `{showImage && ...}` block, BEFORE the closing `</div>`):

Add a `previewTitle` prop to the component interface:
```tsx
previewTitle?: string;
```

Add this preview section (AFTER ImageDialog, BEFORE closing </div>):
```tsx
{/* Live Preview */}
{previewTitle && (
  <div className="mt-6">
    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
      <span>👁</span>
      <span>Forskoðun</span>
      <span className="flex-1 border-t border-gray-700"></span>
      <span className="text-xs text-gray-500">eins og síðan birtist</span>
    </div>
    <div className="page-content rounded-xl border border-gray-700 p-6 bg-[rgb(11,13,19)]">
      <h1 className="text-2xl font-bold mb-4">{previewTitle}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  </div>
)}
```

**IMPORTANT**: The component already has an `html` state variable (or can derive it from `editor?.getHTML()`). Use whichever is already available. If `html` state doesn't exist, add:
```tsx
const currentHtml = editor?.getHTML() || value;
```
and use `currentHtml` instead of `html` in the `dangerouslySetInnerHTML`.

### 2. `src/components/admin/page-editor.tsx`

**What to add**: Pass `previewTitle` prop when rendering `<TipTapEditor>`:
```tsx
<TipTapEditor
  value={content}
  onChange={setContent}
  previewTitle={menuTitle || title}
/>
```

Only add the `previewTitle` prop — do NOT change any other props.

### DO NOT CHANGE:
- `src/app/globals.css` — leave ALL CSS as-is
- Any other component files
- The TipTap toolbar buttons
- The editor initialization/extensions
- The ImageDialog component
- Any API routes

## Verification
1. `npm run build` must succeed with zero errors
2. `curl -s -o /dev/null -w '%{http_code}' http://localhost:3002/admin/pages/1` must return 200 (or 307 redirect to login)
3. The public pages must still render with `.page-content` styling (check `/um-okkur`)

## Expected result
Below the TipTap editor, a "👁 Forskoðun" panel appears showing:
- The page title as H1
- The editor content rendered with `.page-content` styling
- Dark background matching the site theme
- Updates in real-time as user types
