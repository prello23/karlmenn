# EkkiEinn.is — Counters V2: Editor-Managed Widget

## Summary
The current hardcoded HomepageStats component must be replaced with an editor-embeddable widget so the admin can place it anywhere in the WYSIWYG page editor, control its position, size, and surrounding text/fonts.

## Requirements

### 1. Remove member counter
- Only show stories count ("Sögur deildar") — remove the "Meðlimir" card entirely.

### 2. Smaller design
- The counter section should be compact — not two big cards. Think of it as an inline stat badge or a single small counter block, not a full-width hero section.
- Example: A single line or small block like "📝 13 sögur hafa verið deildar" — compact, elegant, not dominating.

### 3. Editor-embeddable (KEY REQUIREMENT)
The counter must be part of the page HTML content managed via the admin WYSIWYG editor, NOT a hardcoded React component in page.tsx.

Implementation approach:

a) Remove the HomepageStats component import and usage from src/app/page.tsx.

b) Create a shortcode system: When the page HTML content contains [sogur-teljari], the frontend renders it as the live story counter widget.

c) How it works:
   - In the admin editor, the admin types [sogur-teljari] wherever they want the counter to appear
   - The DbPageFull (or its renderer) detects this shortcode and replaces it with a live counter component
   - The counter fetches from /api/stats and displays the stories count
   - Everything AROUND the shortcode (text, headings, spacing) is normal editable HTML that the admin controls

d) Admin can control:
   - Position: By placing the shortcode anywhere in the page content
   - Surrounding text: Write any heading, description, CTA text around it
   - Font/size: The surrounding text uses whatever the admin sets in the editor (headings, bold, etc.)
   - The counter widget itself has minimal default styling that blends in

e) The counter widget renders as:
   - A compact inline-block element
   - Shows: the number (animated count-up) + "sögur deildar" label
   - Subtle styling — border, slight background, small icon
   - Responsive but compact (NOT full-width cards)

f) Keep /api/stats endpoint — it still returns { stories: N, members: N } but frontend only uses stories.

### 4. Shortcode rendering
In the component that renders page HTML (likely DbPageFull or a child), after setting dangerouslySetInnerHTML, use a post-render replacement approach:

Option A (recommended): 
- Render the HTML content
- Use a useEffect + DOM query to find [sogur-teljari] text nodes and replace them with a mounted React counter component (via createRoot or a portal)

Option B:
- Before rendering, split the HTML at [sogur-teljari] and render React components between the HTML chunks

Choose whichever is cleaner with the existing code.

### 5. Editor preview
In the admin WYSIWYG editor, [sogur-teljari] should ideally show as a visible placeholder (e.g., a styled badge that says "📊 Söguteljari") so the admin knows where it is. This is a nice-to-have — at minimum it can just show as the text [sogur-teljari].

### 6. Also add the CTA section as editable content
The "Þú ert ekki einn — og rödd þín skiptir máli" heading, description text, and "Segðu þína sögu" / "Skoða sögur" buttons should ALSO be regular editable HTML in the forsida page content — NOT a hardcoded component. Remove all hardcoded motivational text.

The admin will write this content themselves in the editor. If it's not already there, add it as default content in the forsida page so it appears, but it must be editable.

### 7. Insert default content
After implementing, update the "forsida" page content in the database to include:
- The [sogur-teljari] shortcode
- The motivational text and CTA buttons (as HTML)
- Placed after the hero/top section, before the nafnaleit widget

Use the EXISTING text from the current HomepageStats component as the default.

## Files to modify
- src/app/page.tsx — remove HomepageStats import/usage
- src/components/HomepageStats.tsx — delete or repurpose into shortcode widget
- Page renderer component (DbPageFull or similar) — add shortcode detection
- Database: update forsida page content

## Do NOT
- Do NOT keep any hardcoded motivational text or counter in page.tsx
- Do NOT break the existing WYSIWYG editor
- Do NOT remove the /api/stats endpoint

## Push to beta when done.
