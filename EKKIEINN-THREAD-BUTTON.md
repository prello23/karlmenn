# EkkiEinn.is — Thread Button + Page Name Bug Fix

## Overview
The community threads page (`/samfelag` or `/thraedir`) must NOT auto-open a "new thread" form. Instead, show a clear button that users click to create a new thread.

## Current Behavior (WRONG)
- When users visit the threads/community page, a new thread form may be automatically visible/open

## Desired Behavior
1. **Thread list page**: Shows only the list of existing threads
2. **"Búa til nýjan þráð" button**: A prominent button at the top of the thread list
3. **Click to open**: Only when the user clicks the button does the new thread form appear
4. The form can appear as:
   - A modal/dialog overlay, OR
   - An expandable section that slides open above the thread list, OR
   - A separate page/route (e.g., `/samfelag/nyr`)
5. The button should be styled consistently with the site design — warm tones, clear text

## Button Design
- Text: **"Búa til nýjan þráð"** (Create new thread)
- Icon: A "+" or pen/write icon
- Position: Top-right or top-center of the thread list
- Style: Primary action button (stands out but fits the warm EkkiEinn.is design)

## Form Fields (when opened)
- **Titill** (Title) — required
- **Flokkur** (Category) — dropdown/select from existing categories
- **Efni** (Content) — rich text editor (TipTap if already integrated)
- **Senda / Birta** (Submit/Publish) button
- **Hætta við** (Cancel) button — closes the form and returns to thread list

## 2. BUG FIX: Page Name Changes Not Reflecting on Site

### Problem
When an admin changes a page title/name through the admin dashboard (stjórnborð), the change does NOT appear on the live site. The old name continues to show.

### Fix Requirements
- Page titles changed in admin dashboard MUST appear on the live site immediately (no rebuild needed)
- Page content changed in admin dashboard MUST appear on the live site immediately
- Navigation menu must use dynamic page titles (not hardcoded)
- All page routes must use dynamic data fetching — set `revalidate = 0` or `dynamic = 'force-dynamic'` for page routes that display admin-editable content
- Navigation/header/footer links must pull page titles from the database dynamically
- Check ALL places where page titles or slugs are referenced — they must come from DB, not hardcoded strings

### Pages affected
- All pages managed through `/api/admin/pages` — titles and content must be live-updated
- Navigation menu items that reference these pages
- Footer links if they use page titles

## Notes
- Users must be logged in to see the "Búa til" button
- If not logged in, show a message: "Skráðu þig inn til að búa til þráð"
- The thread list itself should always be visible to everyone (logged in or not)
