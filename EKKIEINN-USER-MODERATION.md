# EkkiEinn.is — User Verification, Approval & AI Name Redaction

## 1. Email Verification on Registration

**Goal:** New users must verify their email before they can log in.

### Flow:
1. User fills registration form (name, email, password)
2. Account is created with `emailVerified: false` (or null)
3. System sends verification email with a unique token link: `https://ekkieinn.is/verify?token=<UUID>`
4. User clicks link → `emailVerified` is set to current timestamp
5. Until email is verified, login attempts show: **"Vinsamlegast staðfestu netfangið þitt. Athugaðu pósthólfið þitt."**
6. Resend verification link button on login page

### Email content (Icelandic):
- Subject: "Staðfestu netfangið þitt — EkkiEinn.is"
- Body: Welcome message + verification link + expires in 24 hours
- Send via local sendmail/postfix (Nodemailer, same as existing setup)

### Database:
- Add `emailVerified DateTime?` to User model if not already present (NextAuth may already have this)
- Add `verificationToken String?` and `verificationExpires DateTime?` — OR use NextAuth's built-in verification token table

---

## 2. Admin Approval for New Users

**Goal:** After email verification, admin must approve users before they can fully access the community (threads, comments). This ensures only men ("karlmenn") gain access.

### Flow:
1. User verifies email → account status becomes `PENDING_APPROVAL`
2. User sees message on login: **"Aðgangurinn þinn bíður samþykkis stjórnanda."**
3. Admin gets notification (on admin dashboard + optional email to info@ekkieinn.is)
4. Admin panel shows list of pending users: name, email, registration date
5. Admin can **Samþykkja** (approve) or **Hafna** (reject) each user
6. On approval → user status becomes `APPROVED`, user gets email: "Aðgangurinn þinn hefur verið samþykktur!"
7. On rejection → user gets email explaining rejection, account is marked `REJECTED`

### Database:
- Add `approvalStatus` enum to User: `PENDING_APPROVAL`, `APPROVED`, `REJECTED` (default: `PENDING_APPROVAL`)
- Admin users (role=ADMIN) skip this — always approved

### Admin UI:
- New section in admin panel: **"Notendur sem bíða samþykkis"**
- Table: Name | Email | Registered | Actions (Samþykkja / Hafna)
- Badge count on admin nav showing number of pending users

---

## 3. AI Name Redaction (OpenAI GPT Integration)

**Goal:** Automatically detect real names in threads and comments to protect privacy. Names are replaced with placeholders (xxx, aaa, bbb, etc.). Admin controls whether this happens automatically or manually.

### Mode: Start with MANUAL mode
- **Manual mode (default):** GPT scans content → if names detected → flags for admin review. Content is NOT auto-modified. Admin sees flagged items and can approve GPT's suggested redactions or edit manually.
- **Auto mode (future):** GPT scans and auto-redacts names before publishing. Admin can still review.

### Flow (Manual mode):
1. User creates new thread or posts comment
2. Background job sends content to OpenAI API (GPT-4o-mini recommended for cost)
3. GPT prompt: "Analyze the following Icelandic text. Identify any real person names (first names, last names, full names). Return a JSON array of detected names and their suggested replacements. Use placeholders like 'Xxx', 'Yyy', 'Zzz' for different people. If no names found, return empty array."
4. If names detected:
   - Thread/comment is flagged: `needsReview: true`
   - Admin notification: "Nýr þráður/athugasemd með hugsanlegum nöfnum — þarfnast yfirferðar"
   - Admin sees: original text with names highlighted + GPT's suggested redacted version side-by-side
5. Admin can:
   - **Samþykkja tillögu** — apply GPT's redactions
   - **Breyta** — manually edit the text
   - **Hunsa** — mark as reviewed, no changes needed (names are ok / not real names)

### API Integration:
- Use OpenAI API: `https://api.openai.com/v1/chat/completions`
- Model: `gpt-4o-mini` (cost-effective)
- API key: Store in `.env` as `OPENAI_API_KEY`
- **I will provide the API key separately** — add placeholder in .env

### GPT System Prompt:
```
Þú ert nafnagreiningartól fyrir íslenskt samfélagssvæði. Þú átt að finna öll raunveruleg mannanöfn (eiginnöfn, kenninöfn, fullt nafn) í texta.

Skilaðu JSON:
{
  "names_found": [
    {"original": "Jón Jónsson", "replacement": "Xxx", "context": "...texti í kring..."},
    {"original": "Sigga", "replacement": "Yyy", "context": "...texti í kring..."}
  ],
  "has_names": true/false
}

Reglur:
- Hunsa almenn orð sem gætu verið nöfn en eru notuð sem almennt orð
- Nafn í titli/fyrirsögn telst líka
- Sama manneskja = sama placeholder
- Ef engin nöfn finnast, skilaðu {"names_found": [], "has_names": false}
```

### Database:
- Add to Thread model: `needsReview Boolean @default(false)`, `aiSuggestions Json?`
- Add to Comment model: `needsReview Boolean @default(false)`, `aiSuggestions Json?`
- Add site setting: `aiModerationMode: "manual" | "auto"` (default: "manual")

### Admin UI — Moderation Panel:
- New admin section: **"Nafnagreining / Efnisyfirferð"**
- List of flagged threads/comments
- Each item shows:
  - Original text (names highlighted in yellow/red)
  - GPT suggested version (redacted names shown)
  - Buttons: Samþykkja tillögu | Breyta | Hunsa
- Toggle at top: "Sjálfvirk nafnagreining" ON/OFF (manual vs auto mode)
- Badge count on admin nav

---

## 4. Live Preview in Page Editor

**Goal:** When editing page content in admin, show a live preview that looks exactly like the published page — same styling, layout, fonts, colors.

### Implementation:
- Split the page editor into two panels (or tabbed view):
  - **Left/Top: Editor** (TipTap rich editor — already implemented)
  - **Right/Bottom: Live Preview** — renders the HTML content with the EXACT same CSS/styling as the public-facing page
- Preview updates in real-time as admin types/edits
- The preview panel should use the same component/layout that renders the public page
- Mobile: Use tabs instead of side-by-side (Breyta | Forskoðun)

### Technical approach:
- Create a `<PagePreview>` component that imports the same styles/layout used on the public page route
- Pass the editor's HTML content to this component
- Update on every content change (debounced ~300ms)
- Include page title, description in the preview as well

---

## Priority Order:
1. Email verification (security baseline)
2. Admin approval (ensures community safety)
3. Live preview in editor (admin UX improvement)
4. AI name redaction (can add OpenAI key later)

## Notes:
- All UI text must be in Icelandic
- Email sending uses existing Nodemailer + local postfix setup
- OpenAI API key will be provided separately — use `process.env.OPENAI_API_KEY`
- Do NOT auto-redact in manual mode — only flag and suggest
