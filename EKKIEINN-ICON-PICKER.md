# EKKIEINN Icon Picker — Editor Enhancement

## Goal

Add an **Icon Picker** to the WYSIWYG admin editor so the admin can:
1. Insert icons/logos anywhere in page content
2. Replace existing icons (e.g., swap the shield for the site logo)
3. Control icon size (small → extra-large)
4. Choose from a built-in icon pack + logo variants

## IMPORTANT RULES

- **DO NOT** break any existing functionality (auth, threads, moderation, forum, pages, etc.)
- **DO NOT** touch any code outside the editor/pages system
- **ONLY** modify editor toolbar + icon-related code
- Test with `npm run build` before deploying
- Push to **beta** branch only

## Implementation

### 1. New Toolbar Button: "Ikon"

Add a new toolbar button **"🎨 Ikon"** (between "Mynd" and "Hreinsa") that opens an Icon Picker modal/popup.

### 2. Icon Picker Modal

A modal overlay with:

#### Tab 1: "Lógó" (Logo variants)
Display all logo variants stored in `/public/icons/logos/`:
- `logo-color.png` — full color logo (the EkkiEinn.is logo from the header)
- `logo-white.png` — white/light version
- `logo-transparent.png` — transparent background version  
- `shield.svg` — the current gold shield SVG (inline)

**On first deploy**: Copy the existing site logo (from the header/favicon) into these paths. The shield SVG is already in the seed HTML — extract it and save as `shield.svg`.

The admin can also **upload new logo variants** via a small upload button in this tab. Uploaded logos go to `/public/icons/logos/` and appear in the grid.

#### Tab 2: "Ikon" (Icon Pack)
A grid of commonly useful SVG icons. Use **Lucide icons** (already popular in Next.js ecosystem). Include at least these categories:

**Fólk & Samfélag (People & Community):**
- Heart, Users, UserPlus, HandHeart, Shield, ShieldCheck, Star, Award, Handshake

**Neyðarhjálp (Emergency/Support):**
- Phone, PhoneCall, AlertTriangle, Siren, LifeBuoy, Cross, Ambulance, HeartPulse

**Samskipti (Communication):**
- MessageCircle, Mail, Send, Globe, Link, ExternalLink

**Almenn (General):**
- Home, BookOpen, FileText, CheckCircle, ArrowRight, Clock, Calendar, MapPin, Lock, Unlock, Eye, Settings, Info, HelpCircle

Each icon shown as a clickable tile with its name below. Clicking selects it.

#### Tab 3: "Sérsniðið" (Custom)
- Upload any SVG or PNG file as a custom icon
- Stored in `/public/icons/custom/`
- Appears in grid alongside built-in icons
- Delete button (trash icon) on hover for custom-uploaded icons

### 3. Size Control

Below the icon grid, a **size selector**:

```
Stærð: [XS] [S] [M] [L] [XL] [Sérsniðið: ___px]
```

Sizes map to:
- **XS**: 24×24px (inline with text)
- **S**: 40×40px 
- **M**: 64×64px
- **L**: 96×96px (current shield size)
- **XL**: 128×128px
- **Sérsniðið**: Custom pixel input (16–256px range)

Default selection: **L** (96px) for logos, **M** (64px) for icons.

### 4. Color Control (Icons only, not logos)

For Lucide SVG icons (not uploaded images), show a color picker:
- Preset swatches: Gold (#F59E0B), White (#FFFFFF), Gray (#9CA3AF), Blue (#3B82F6), Red (#EF4444), Green (#10B981)
- Custom hex input

### 5. Insert Behavior

When admin clicks "Setja inn" (Insert) button:

**For SVG icons (Lucide + shield):**
- Insert as inline `<svg>` with the selected size as `width` and `height` attributes
- Add class `editor-icon` and data attribute `data-icon-name="heart"` (or whatever)
- Wrap in `<div class="icon-wrapper" style="text-align: center;">` if inserted on its own line
- If inserted within text, add `style="display: inline; vertical-align: middle;"`

**For PNG/uploaded images:**
- Insert as `<img>` tag with `width`/`height` set, class `editor-icon`
- `data-icon-type="logo"` or `data-icon-type="custom"`

### 6. Replace Existing Icon

When admin clicks on an existing icon (SVG or img with class `editor-icon` or class `shield-lg`) in the editor:
- Show a floating toolbar above the icon with: [🔄 Skipta] [📏 Stærð] [🗑️ Eyða]
- **Skipta** opens the Icon Picker modal with "replace" mode — new icon replaces the old one at the same position
- **Stærð** shows quick size buttons (XS/S/M/L/XL) to resize in place
- **Eyða** removes the icon

### 7. File Storage & API Routes

#### API Routes needed:

**GET `/api/admin/icons`**
Returns all available icons:
```json
{
  "logos": [
    { "name": "logo-color", "path": "/icons/logos/logo-color.png", "type": "png" },
    { "name": "shield", "path": "/icons/logos/shield.svg", "type": "svg" }
  ],
  "custom": [
    { "name": "my-icon", "path": "/icons/custom/my-icon.svg", "type": "svg" }
  ],
  "lucide": ["Heart", "Users", "Shield", "Phone", ...]
}
```

**POST `/api/admin/icons/upload`**
- Accepts SVG or PNG file upload (max 500KB)
- Saves to `/public/icons/custom/` or `/public/icons/logos/`
- Returns the new icon entry

**DELETE `/api/admin/icons/custom/:name`**
- Deletes a custom-uploaded icon

#### File structure:
```
public/
  icons/
    logos/
      logo-color.png      ← site logo (copy from existing)
      logo-white.png       ← white version
      logo-transparent.png ← transparent version  
      shield.svg           ← extracted gold shield
    custom/
      (user uploads go here)
```

### 8. Lucide Icons Integration

Install `lucide-react` package:
```bash
npm install lucide-react
```

Import only the needed icons to keep bundle small. Use dynamic import or a lookup map:

```tsx
import { Heart, Users, Shield, Phone, ... } from 'lucide-react';

const ICON_MAP = {
  Heart, Users, Shield, Phone, ...
};
```

When rendering in the icon picker grid, show each as a React component.
When inserting into the editor HTML, render to SVG string first:
```tsx
import { renderToString } from 'react-dom/server';
const svgString = renderToString(<Heart size={64} color="#F59E0B" />);
```

### 9. UI Design

The modal should match the existing dark theme:
- **Background**: `#1a1a2e` / `var(--bg-surface)` 
- **Border**: `var(--border)` 
- **Selected icon**: Gold border (`#F59E0B`) with subtle glow
- **Tabs**: Underline style, gold active indicator
- **Grid**: 4-5 columns on desktop, 3 on mobile
- **Icon tiles**: 64×64px hover area, icon centered, name below in small text
- **Size selector**: Pill buttons, gold active state
- **Insert button**: Gold primary button "Setja inn" at bottom

### 10. Initial Logo Files Setup

On the first build/seed, create the `/public/icons/` structure:

1. **shield.svg**: Extract from the existing seed HTML (the gold shield SVG that's currently inline)
2. **logo-color.png**: Copy the site logo that appears in the header (the EkkiEinn.is logo with the yellow figure)
3. **logo-white.png**: If available; otherwise skip for now (admin can upload later)
4. **logo-transparent.png**: If available; otherwise skip

The site logo is already at a known path — check the `<header>` or `<nav>` component to find it and copy.

### 11. Mobile-Friendly

The modal must work well on mobile (the admin uses mobile often):
- Full-screen modal on mobile (< 640px)
- Touch-friendly icon tiles (min 48×48px tap target)
- Swipeable tabs
- Size selector with comfortable spacing

## Testing

After implementation:
1. `npm run build` — must pass
2. Seed database: `npm run db:seed`
3. Start on test port: `PORT=3019 npm start`
4. Verify:
   - `GET /admin/pages/1` — editor loads with toolbar showing "Ikon" button
   - Click "Ikon" — modal opens with Lógó/Ikon/Sérsniðið tabs
   - Select shield → set size L → "Setja inn" — shield appears in editor
   - Click on shield in editor → floating toolbar appears
   - Replace shield with Lucide Heart icon → works
   - Upload custom PNG → appears in Sérsniðið tab
   - Save page → reload → icons persist in content
5. Verify untouched routes:
   - `/` — 200
   - `/samfelag` — 200  
   - `/admin/moderation` — 200
   - `/admin/notendur` — 200
6. Kill test: `pkill -f "next start -p 3019"`
7. Restart PM2: `pm2 restart ekkieinn`
8. Push to beta branch

## Summary

This gives the admin a powerful but simple icon system:
- 📦 **Built-in icon pack** (30+ Lucide icons)
- 🛡️ **Logo variants** (shield, color logo, transparent, white)
- 📤 **Custom upload** (any SVG/PNG)
- 📏 **Size control** (XS to XL + custom px)
- 🎨 **Color control** (for SVG icons)
- 🔄 **Click-to-replace** existing icons
- 📱 **Mobile-friendly** modal
