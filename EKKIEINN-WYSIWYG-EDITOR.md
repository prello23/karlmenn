# EKKIEINN-WYSIWYG-EDITOR.md — Replace TipTap with contenteditable editor

## Goal
Replace the TipTap editor with a `contenteditable` div editor — **exactly like karlmenn.outzone.is**.
The editor must render page content exactly as it appears on the live public page (true WYSIWYG).

## Why
- karlmenn.outzone.is uses a simple `contenteditable` div that renders ALL HTML faithfully
- ekkieinn.is uses TipTap (ProseMirror) which **strips** custom HTML — buttons, styled divs, icons, inline styles are all lost
- The user has asked multiple times for the admin editor to show the page as it actually looks
- This is the #1 priority — do it well

## Key insight from karlmenn.outzone.is
The karlmenn editor is a `contenteditable div` that loads the **same CSS** as the public pages.
Whatever HTML is stored in the database renders identically in the editor and on the live site.
That is the model to follow.

## Implementation

### Step 1: Rewrite `src/components/admin/tiptap-editor.tsx`

Replace the TipTap-based editor with a `contenteditable` div approach:

```tsx
"use client";
import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
// Keep ImageDialog — copy it exactly from the current file

// The editor component
export function TipTapEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [htmlMode, setHtmlMode] = useState(false);
  const [html, setHtml] = useState(value);
  const [showImage, setShowImage] = useState(false);

  // Capture changes from contenteditable
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setHtml(newHtml);
      onChange(newHtml);
    }
  }, [onChange]);

  // Toolbar formatting using execCommand
  function exec(command: string, value?: string) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }

  function toggleHtml() {
    if (!htmlMode) {
      // Going INTO html mode
      if (editorRef.current) {
        setHtml(editorRef.current.innerHTML);
      }
      setHtmlMode(true);
    } else {
      // Going BACK to WYSIWYG
      if (editorRef.current) {
        editorRef.current.innerHTML = html;
      }
      onChange(html);
      setHtmlMode(false);
    }
  }

  function insertLink() {
    const url = window.prompt("Slóð hlekks:", "https://");
    if (url) {
      exec("createLink", url);
    }
  }

  function insertImage(url: string) {
    exec("insertHTML", `<img src="${url}" style="max-width:100%;height:auto;border-radius:0.5rem;margin:1rem 0" />`);
  }

  // Toolbar component (keep exact same buttons/layout as current)
  // Use exec() calls instead of editor.chain()

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-card p-2 rounded-t-lg">
        <TbBtn title="Fyrirsögn 2" onClick={() => exec("formatBlock", "<h2>")}>H2</TbBtn>
        <TbBtn title="Fyrirsögn 3" onClick={() => exec("formatBlock", "<h3>")}>H3</TbBtn>
        <TbBtn title="Málsgrein" onClick={() => exec("formatBlock", "<p>")}>¶</TbBtn>
        <Separator />
        <TbBtn title="Feitletrað" onClick={() => exec("bold")}><strong>B</strong></TbBtn>
        <TbBtn title="Skáletrað" onClick={() => exec("italic")}><em>I</em></TbBtn>
        <TbBtn title="Listi" onClick={() => exec("insertUnorderedList")}>• Listi</TbBtn>
        <Separator />
        <TbBtn title="Hlekkur" onClick={insertLink}>🔗 Hlekkur</TbBtn>
        <TbBtn title="Mynd" onClick={() => setShowImage(true)}>🖼️ Mynd</TbBtn>
        <TbBtn title="Hreinsa snið" onClick={() => exec("removeFormat")}>🔄 Hreinsa</TbBtn>
        <Separator />
        <TbBtn title="Sýna HTML" active={htmlMode} onClick={toggleHtml}>{"</> HTML"}</TbBtn>
      </div>

      {/* Content area — renders exactly as the live page */}
      {htmlMode ? (
        <textarea
          value={html}
          onChange={(e) => { setHtml(e.target.value); onChange(e.target.value); }}
          spellCheck={false}
          className="block min-h-[400px] w-full resize-y bg-background p-6 font-mono text-xs text-foreground focus:outline-none"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: value }}
          onInput={handleInput}
          className="page-content min-h-[400px] bg-[hsl(225,21%,7%)] p-6 focus:outline-none"
          style={{ caretColor: "hsl(38, 92%, 50%)" }}
        />
      )}

      {showImage && (
        <ImageDialog
          onClose={() => setShowImage(false)}
          onInsert={insertImage}
        />
      )}
    </>
  );
}
```

### Step 2: Keep these UNCHANGED
- `ImageDialog` component — copy it exactly from the current file (same upload logic, same UI)
- `TbBtn` component — copy it exactly (same styling)
- `globals.css` — DO NOT TOUCH
- `page-editor.tsx` — only change if needed for prop compatibility

### Step 3: Remove TipTap imports
Remove these imports from the file:
- `useEditor, EditorContent` from `@tiptap/react`
- `StarterKit` from `@tiptap/starter-kit`
- `Link` from `@tiptap/extension-link`
- `Image` from `@tiptap/extension-image`
- `Placeholder` from `@tiptap/extension-placeholder`

Keep: `useState, useRef, useCallback` from React, `cn` from utils, `Loader2, ImagePlus, X` from lucide-react.

Do NOT uninstall the npm packages (they may be used elsewhere). Just remove the imports from this file.

### Step 4: Remove `previewTitle` prop
The component signature should be `({ value, onChange })` only — no `previewTitle`.
Check `page-editor.tsx` — if it passes `previewTitle`, remove that prop.

### Step 5: Styling details
- **NO border** around the editor content area (no `border border-input rounded-lg`)
- **Toolbar**: `rounded-t-lg border border-border bg-card p-2` — subtle border around toolbar only
- **Content area**: `bg-[hsl(225,21%,7%)]` dark background, matching the public page exactly
- **Padding**: `p-6` (generous, like a real page)
- **Min height**: `min-h-[400px]` — spacious, page-like feel
- **Caret color**: amber `hsl(38, 92%, 50%)` — visible on dark background
- **page-content class**: This gives the content the same h2/h3/p/ul/ol/a/strong/img styling as the public page

### Step 6: Handle paste
Add an `onPaste` handler to preserve formatting from pasted content:
```tsx
onPaste={(e) => {
  // Allow rich paste (HTML preserved)
  // No special handling needed — contenteditable preserves paste by default
}}
```

No need to strip formatting on paste — we WANT rich HTML preserved (unlike TipTap which strips it).

## Testing checklist
1. `npm run build` — must compile with zero errors
2. Start app on test port, navigate to `/admin/pages/1`
3. Verify:
   - Editor renders with dark background
   - Existing page content displays correctly (headings, paragraphs, lists, links, images)
   - Toolbar buttons work: H2, H3, ¶, Bold, Italic, List, Link, Image, Clear, HTML toggle
   - HTML toggle shows raw HTML and switches back correctly
   - Image upload dialog works
   - Changes are saved when clicking "Vista breytingar"
   - Public page (`/um-okkur`) still renders correctly after saving
4. Test on `/admin/pages/2`, `/admin/pages/3` — verify all pages load and save correctly

## Important rules
- ⚠️ DO NOT touch `globals.css`
- ⚠️ DO NOT break the admin pages list, admin threads, admin settings, or any other admin functionality
- ⚠️ DO NOT change any public page rendering
- ⚠️ Build MUST succeed before committing
- ⚠️ If build fails, fix it — do NOT commit broken code
- ⚠️ Push to beta branch ONLY
