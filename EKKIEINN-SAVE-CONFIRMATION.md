# EKKIEINN-SAVE-CONFIRMATION.md
## "Vistað" confirmation after save

### What
On the admin thread detail page (`/admin/threads/[id]`), when the admin clicks "Vista texta" to save edited thread content, show a **"Vistað ✅"** confirmation text next to the button.

### How
1. After successful save, show "Vistað ✅" text inline next to the "Vista texta" button
2. The text should appear with a fade-in animation
3. It should disappear after ~3 seconds (fade out)
4. While saving, the button text can briefly change to "Vista..." (optional)
5. If save fails, show "Villa!" in red instead

### Style
- "Vistað ✅" in green text, same font size as the button
- Positioned to the RIGHT of the button, inline
- Smooth fade in/out transition

### IMPORTANT
- This is a small UI-only change
- Do NOT break any existing functionality
