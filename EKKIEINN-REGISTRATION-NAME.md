# EkkiEinn.is — Registration Name Field + Gender Assessment

## Overview
Add a **required "Nafn" (Name) field** to the registration form, and build a gender assessment system so admin can evaluate whether the registrant is likely male. The site is a men's support community, so this is important for trust and safety.

## 1. Registration Form Changes

### Current fields:
- Netfang (email) — required
- Gæluafn (valfrjálst) — optional display name
- Birtist í samfélaginu — display name shown in community
- Lykilorð — required
- Staðfestu lykilorð — required

### Add new field:
- **Nafn** (Full Name) — **required**, placed as the FIRST field (before Netfang)
- Label: "Nafn" 
- Placeholder: "Fullt nafn"
- Validation: minimum 2 characters, required

### Database:
- Add `name` field to the `User` model in Prisma schema (String, required)
- Migration: existing users get `name` = their `displayName` or `email` prefix as fallback

## 2. Gender Assessment System

Build an automated heuristic that evaluates the likelihood that a registrant is male, based on:

### a) Icelandic Name Heuristic (primary)
Icelandic names are strongly gendered:
- **Male indicators**: names ending in `-son` (patronymic), common male first names (Jón, Guðmundur, Sigurður, Ólafur, Gunnar, Magnús, Kristján, Björn, Stefán, Helgi, Ragnar, Þór, etc.)
- **Female indicators**: names ending in `-dóttir` (patronymic), common female first names (Guðrún, Sigríður, Kristín, Margrét, Ingibjörg, Helga, Sigrún, Anna, Jóhanna, etc.)
- Build a list of ~100 common Icelandic male names and ~100 common female names
- Score: check first name against lists, check patronymic suffix

### b) Email Domain Heuristic (secondary)
- Generic domains (gmail, outlook, etc.) = neutral
- Work domains = neutral  
- Disposable/temp email domains = flag for review

### c) Assessment Result
Store on the User model:
- `genderAssessment`: enum — `LIKELY_MALE`, `LIKELY_FEMALE`, `UNCERTAIN`
- `genderAssessmentScore`: Float (0.0 to 1.0, where 1.0 = very likely male)
- `genderAssessmentDetails`: String (JSON with reasoning)

### d) Admin Visibility
- In `/admin/notendur` (user management), show:
  - The user's **Nafn** (full name)
  - Gender assessment badge: 🟢 Likely Male | 🟡 Uncertain | 🔴 Likely Female
  - Assessment score and details on hover/click
- In the pending approval queue, show the assessment prominently to help admin decide

### e) Auto-approval Enhancement
- If `genderAssessment === LIKELY_MALE` AND `genderAssessmentScore >= 0.8`: auto-approve (no admin needed)
- If `genderAssessment === LIKELY_FEMALE` OR score < 0.3: hold for manual admin review
- Otherwise: hold for review with "Uncertain" badge

## 3. AI-Enhanced Assessment (if OpenAI key is configured)

If `OPENAI_API_KEY` is set in env, ALSO run the name through GPT for a second opinion:
- Prompt: "Given the name '{name}' and email '{email}', assess the likelihood this person is male. This is for a men's support community registration. Return JSON: {likely_male: boolean, confidence: number, reasoning: string}"
- Merge AI result with heuristic result for final score
- If no API key, rely solely on heuristic

## 4. Technical Notes

- PM2 process name: `ekkieinn`
- PM2 binary: `/home/aiuser/.npm-local/node_modules/pm2/bin/pm2`
- DB: SQLite at `/home/deploy/karlmenn/prod.db`
- Framework: Next.js 15 + Prisma + NextAuth
- Build: `npm run build` in `/home/deploy/karlmenn/`
- After changes: build → smoke test → pm2 restart → push to beta
- DO NOT break existing functionality — only ADD new fields/features
- Keep the dark theme styling consistent with existing forms
