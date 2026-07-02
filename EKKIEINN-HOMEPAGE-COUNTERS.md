# EkkiEinn.is — Homepage Counters & Encouragement

## Overview
Add counter section to homepage showing real statistics and encouraging visitors to sign up and share.

## Requirements

### Counter Section
Prominent section on homepage (after hero, before other content).

#### Counters
1. **Sögur deildar** — Total published/approved stories count from DB (icon: 📝)
2. **Meðlimir** — Total registered users count from DB (icon: 👥)

#### Design
- Large, bold numbers with count-up animation on scroll (Intersection Observer)
- Clean, modern, matching site aesthetic
- Responsive — stacked on mobile, side-by-side on desktop
- Use site color scheme

### Encouragement Section
Below/integrated with counters:

#### Headline
"Þú ert ekki einn — og rödd þín skiptir máli"

#### Subtext
"Deildu sögu þinni nafnlaust og hjálpaðu öðrum sem eiga í sama stað. Hér er öruggt, nafnlaust og ókeypis."

#### CTA Buttons
1. **Primary:** "Segðu þína sögu" → `/nyskraning` (or post form if logged in)
2. **Secondary:** "Skoða sögur" → thread listing page

### API Endpoint
`GET /api/stats` returning:
```json
{"stories": 42, "members": 128}
```
- Real DB counts, published stories only
- Cache 5 minutes

### Implementation
- React component `HomepageStats.tsx`
- Fetch on page load
- Count-up animation with CSS/lightweight JS
- Intersection Observer trigger

## DO NOT
- Add fake numbers — real counts only
- Break existing homepage layout
- Add heavy JS libraries
