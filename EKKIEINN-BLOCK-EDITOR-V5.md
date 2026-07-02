# EkkiEinn.is — Block Editor V5: Page Builder

## Summary
Replace the current simple WYSIWYG contenteditable editor with a block-based page builder. Admin must be able to add, remove, reorder, and configure discrete content blocks — sections, columns, buttons, text, images, spacers, counters, etc. Think WordPress Gutenberg but simpler and lighter. Keep all existing content and shortcodes working.

## Current State
- V4 WYSIWYG editor with contenteditable div
- Font picker, color, size controls in toolbar
- `[sogur-teljari]` shortcode renders story counter
- Pages stored as HTML string in DB (`Page.content`)

## Architecture

### Block Data Model
Store page content as JSON array of blocks instead of raw HTML. Each block has:

```ts
interface Block {
  id: string;           // unique uuid
  type: BlockType;
  props: Record<string, any>;  // type-specific properties
  children?: Block[];   // for container blocks (columns, section)
}

type BlockType = 
  | 'section'      // colored background container
  | 'columns'      // 2-3 column layout
  | 'text'         // rich text (heading, paragraph, etc.)
  | 'button'       // CTA button with link
  | 'image'        // uploaded image
  | 'spacer'       // vertical spacing
  | 'counter'      // story counter (replaces [sogur-teljari])
  | 'divider'      // horizontal line
  | 'card'         // bordered card container
  | 'html'         // raw HTML for advanced users
```

### Migration
- On first load, if `Page.content` is a string (old HTML), wrap it in a single `html` block
- New pages start with empty block array
- Add `Page.contentVersion` field: `1` = legacy HTML, `2` = block JSON

### DB Change
Add column to Page model:
```prisma
model Page {
  // ... existing fields
  contentVersion Int @default(1)  // 1=legacy HTML, 2=block JSON
}
```

## Editor UI

### Layout
```
┌─────────────────────────────────────────────────────┐
│  ← Til baka    Forsíða    [Vista]  [Forskoðun]      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Section Block                          ⋮ ↕  │    │
│  │  ┌──────────────────────────────────────┐   │    │
│  │  │ Text: "Velkomin á EkkiEinn.is"       │   │    │
│  │  └──────────────────────────────────────┘   │    │
│  │  ┌──────────┐  ┌──────────┐                 │    │
│  │  │ Button   │  │ Button   │                 │    │
│  │  └──────────┘  └──────────┘                 │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─ + Bæta við blokk ──────────────────────────┐   │
│  │  📝 Texti  🔘 Takki  🖼️ Mynd  📊 Teljari   │   │
│  │  📐 Dálkar  📦 Kort  ── Skiptir  ↕ Bil      │   │
│  │  </> HTML                                    │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Block Controls
Every block shows on hover/select:
- **Drag handle** (⋮⋮) on the left — drag to reorder
- **Move up/down arrows** (↑↓) — one-click reorder
- **Settings gear** (⚙️) — opens block settings panel
- **Duplicate** (⧉) — clone block
- **Delete** (🗑️) — remove block with confirmation
- **+ button** between blocks — insert new block

### Block Settings Panel
Slides in from the right when ⚙️ is clicked. Shows block-specific settings:

#### Text Block
- Rich text editing (bold, italic, underline, link)
- Font family picker (same as current toolbar)
- Font size (px or preset: sm/md/lg/xl/2xl)
- Text color picker
- Text alignment (left/center/right)
- Heading level (H1-H6, paragraph)

#### Button Block
- Button text
- Link URL
- Style: primary (gold/orange) / secondary (outline) / ghost
- Size: small / medium / large
- Alignment: left / center / right
- Border radius
- Custom colors (bg, text, border)

#### Section Block
- Background color picker
- Background image (upload)
- Padding (top/bottom/left/right)
- Border radius
- Max width
- Contains child blocks (drag blocks into section)

#### Columns Block
- Number of columns: 2 or 3
- Column width ratio (e.g., 50/50, 33/67, 25/75)
- Gap between columns
- Each column is a drop zone for child blocks
- Stacks vertically on mobile automatically

#### Image Block
- Upload image
- Alt text
- Size (width %)
- Alignment
- Border radius
- Link (optional)

#### Counter Block (replaces [sogur-teljari])
- What to count: stories only
- Label text (default "sögur deilt")
- Font size
- Colors (number color, label color)
- CTA text and links below

#### Spacer Block
- Height in px (default 32)

#### Card Block
- Background color
- Border
- Padding
- Shadow
- Contains child blocks

#### HTML Block
- Raw HTML textarea
- For advanced custom content

### Drag and Drop
- Use native HTML5 drag-and-drop (no heavy library)
- Visual drop indicator (blue line) shows where block will land
- Blocks can be dragged between sections/columns
- On mobile: use up/down arrows instead of drag (touch-friendly)

## Rendering (Public Pages)
Create a `BlockRenderer` component that takes the block JSON array and renders each block to proper HTML with Tailwind classes. Must:
- Render sections with background colors/images
- Render columns as CSS grid
- Render buttons as styled links
- Render text with custom fonts/sizes/colors
- Render counter with animation (reuse existing logic)
- Be fully responsive (columns stack on mobile)
- Support dark theme (current site theme)

### Legacy Support
If `contentVersion === 1`, render as `dangerouslySetInnerHTML` (current behavior).

## Page-Specific Settings
Add to editor top bar:
- **Page background color**
- **Page max width** (narrow/medium/wide/full)
- **Page padding**

## API Changes

### PUT /api/admin/pages/[slug]
Accept both formats:
```ts
// New block format
{ content: JSON.stringify(blocks), contentVersion: 2 }
// Legacy format still works
{ content: "<html string>", contentVersion: 1 }
```

### GET /api/admin/pages/[slug]
Return `contentVersion` field so editor knows which mode to use.

## Important Rules
1. **DO NOT break existing pages** — legacy HTML pages must still render correctly
2. **Mobile-friendly editor** — must work on phone (user edits from phone)
3. **Keep it simple** — no overwhelming UI; clean, intuitive
4. **Auto-save draft** — save to localStorage every 30s as backup
5. **Undo/Redo** — Ctrl+Z / Ctrl+Y support for block operations
6. **The site is dark themed** — editor preview must show blocks in dark theme
7. **Reuse existing design** — buttons should match the gold/orange CTA style already on the site
8. **No external dependencies** — use native HTML5 drag-and-drop, no dnd-kit or similar heavy packages
9. **Font picker** — keep the existing font picker from V4, expand to block settings
10. **Keep [sogur-teljari] working** in legacy HTML blocks

## Build & Deploy
- `npm run build` must succeed with zero errors
- Push to `beta` branch only
- Restart PM2: `cd /home/deploy/karlmenn && /home/aiuser/.npm-local/node_modules/pm2/bin/pm2 restart ekkieinn`
