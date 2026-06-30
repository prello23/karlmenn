# EKKIEINN Admin Settings V2 — Email, API Keys, AI Prompt

## Goal

Add a comprehensive **Settings** page at `/admin/settings` with three sections:
1. **Email Settings** — configure and test email
2. **API Keys** — manage OpenAI API key (and future keys)
3. **AI Prompt** — view and edit the system prompt used for AI features

## CRITICAL RULES
- Do NOT touch auth, threads, moderation, forum, pages, or any existing code
- Only ADD new files and minimal route additions
- Build must pass, smoke test all existing routes still 200
- Push to **beta** branch only

---

## 1. Email Settings (`/admin/settings/email`)

### What to build

A settings panel where admin can:

- **See current email configuration** (read from `.env`):
  - `SMTP_HOST` (or "Local sendmail/postfix")
  - `SMTP_PORT`
  - `SMTP_USER` (masked)
  - `EMAIL_FROM` (e.g., `info@ekkieinn.is`)
  - `EMAIL_FROM_NAME` (e.g., `EkkiEinn.is`)

- **Edit email settings** via form fields → saves to a `Settings` table in DB (NOT `.env` — app reads DB settings with `.env` as fallback)

- **Send test email** button:
  - Input: recipient email address
  - Sends a simple test email: "Prófunarpóstur frá EkkiEinn.is — Ef þú færð þennan póst virkar tölvupósturinn rétt!"
  - Shows success ✅ or error ❌ with error message

- **Instructions section** (always visible, collapsible):
  ```
  📧 Tölvupóststillingar

  EkkiEinn.is notar staðbundinn póstþjón (postfix/sendmail) til að senda tölvupóst.
  
  Núverandi uppsetning:
  • Sendandi: info@ekkieinn.is
  • Þjónn: Staðbundinn sendmail
  • DNS: MX og SPF færslur stilltar á ForwardEmail.net
  • Móttaka: info@ekkieinn.is → elvarpa@gmail.com (áframsending)
  
  Til að breyta sendanda eða bæta við SMTP þjóni, breyttu stillingum hér að ofan.
  ```

### Database

Add to Prisma schema:

```prisma
model Setting {
  id        Int      @id @default(autoincrement())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt
}
```

Settings keys: `email_from`, `email_from_name`, `email_smtp_host`, `email_smtp_port`, `email_smtp_user`, `email_smtp_pass`

### API Routes

```
GET  /api/admin/settings/email     → returns current email config (passwords masked)
PUT  /api/admin/settings/email     → saves email settings to DB
POST /api/admin/settings/email/test → sends test email, returns {success, error?}
```

All routes require admin session.

### Nodemailer integration

Update the existing Nodemailer transport to check DB settings first, fall back to `.env`:

```typescript
async function getEmailTransport() {
  const settings = await prisma.setting.findMany({
    where: { key: { startsWith: 'email_' } }
  });
  const config = Object.fromEntries(settings.map(s => [s.key, s.value]));
  
  if (config.email_smtp_host) {
    return nodemailer.createTransport({
      host: config.email_smtp_host,
      port: parseInt(config.email_smtp_port || '587'),
      auth: config.email_smtp_user ? {
        user: config.email_smtp_user,
        pass: config.email_smtp_pass,
      } : undefined,
    });
  }
  
  // Fallback: local sendmail
  return nodemailer.createTransport({ sendmail: true });
}
```

---

## 2. API Keys (`/admin/settings/api-keys`)

### What to build

A panel where admin can manage API keys:

- **OpenAI API Key**:
  - Input field (type=password, with show/hide toggle)
  - Current status: ✅ "Lykill stilltur" or ❌ "Enginn lykill"
  - "Vista" button to save
  - "Prófa" button → calls OpenAI API with a simple completion, shows success/error
  - Saved to `Setting` table as `openai_api_key`

- **Future-proof**: The UI should be a list of API key cards, easy to add more later:
  ```
  ┌──────────────────────────────────┐
  │ 🤖 OpenAI API Lykill            │
  │ Staða: ✅ Lykill stilltur        │
  │ [••••••••••••a1]  👁 Sýna       │
  │ [Vista] [Prófa tengingu]         │
  └──────────────────────────────────┘
  ```

### API Routes

```
GET  /api/admin/settings/api-keys          → returns list of configured keys (masked)
PUT  /api/admin/settings/api-keys/:provider → saves key (provider = "openai")
POST /api/admin/settings/api-keys/:provider/test → tests key, returns {success, error?}
```

### OpenAI integration

Update any existing AI code to read the key from DB first, fallback to `process.env.OPENAI_API_KEY`:

```typescript
async function getOpenAIKey(): Promise<string | null> {
  const setting = await prisma.setting.findUnique({ where: { key: 'openai_api_key' } });
  return setting?.value || process.env.OPENAI_API_KEY || null;
}
```

---

## 3. AI Prompt Management (`/admin/settings/ai-prompt`)

### What to build

A panel where admin can view and edit the AI system prompt used for content moderation / name detection / any AI features:

- **Large textarea** (min 10 rows) showing the current system prompt
- **Default prompt** shown as placeholder or "Sjálfgefið" button to reset
- **"Vista"** button to save custom prompt to DB
- **"Endurstilla"** button to reset to default
- **Preview section**: Shows a test input + AI response using the current prompt
  - Input: text field for test message
  - "Prófa" button → sends test message with current prompt to OpenAI
  - Shows AI response

### Default prompt (baked in code, editable via UI):

```
Þú ert efnisstjóri (content moderator) fyrir EkkiEinn.is — samfélagsvettvang fyrir karla sem hafa orðið fyrir ofbeldi, rangsæri eða vilja breyta hegðun sinni.

Þitt hlutverk:
1. Greina hvort texti innihaldi persónuauðkenni (nöfn, kennitölur, símanúmer, netföng)
2. Greina hvort texti sé óviðeigandi (hótanir, haturstal, ruslpóstur)
3. Svara á íslensku

Svaraðu með JSON:
{
  "containsPII": true/false,
  "isInappropriate": true/false,
  "reason": "Stuttur skýring ef eitthvað fannst",
  "detectedItems": ["listi af fundnum atriðum"]
}
```

### Database

Settings key: `ai_system_prompt`

### API Routes

```
GET  /api/admin/settings/ai-prompt       → returns {prompt, isDefault}
PUT  /api/admin/settings/ai-prompt       → saves custom prompt
DELETE /api/admin/settings/ai-prompt     → resets to default (deletes DB entry)
POST /api/admin/settings/ai-prompt/test  → {testInput} → runs prompt, returns AI response
```

---

## 4. Settings Navigation

The `/admin/settings` page should have a **tab navigation**:

```
[Tölvupóstur] [API Lyklar] [AI Prompt]
```

Each tab shows its section. Use client-side tabs (no page reload).

### Admin sidebar update

Add "⚙️ Stillingar" to the admin sidebar/nav, linking to `/admin/settings`.
If a sidebar already exists with links to /admin/pages, /admin/moderation, /admin/notendur, add Stillingar at the bottom.

---

## 5. UI Design

Must match the existing dark theme of the admin panel:
- Dark background (`bg-gray-900` / `bg-gray-800`)
- Gold accent colors for buttons and headings (matching the page-content theme)
- Form inputs: dark background, light text, gold focus border
- Cards with subtle borders
- Responsive — works on mobile

---

## 6. Build & Deploy Checklist

1. `npx prisma db push` (adds Setting model)
2. `npm run build` — must pass with zero errors
3. Smoke test: ALL existing routes must return 200/307 as before
4. New routes: `/admin/settings` → 200, `/api/admin/settings/*` → 200
5. `pm2 restart ekkieinn`
6. `git add . && git commit && git push origin beta`

## 7. File structure (suggested)

```
src/app/admin/settings/
├── page.tsx              # Main settings page with tabs
├── EmailSettings.tsx     # Email config component
├── ApiKeySettings.tsx    # API keys component
├── AiPromptSettings.tsx  # AI prompt component
src/app/api/admin/settings/
├── email/
│   ├── route.ts          # GET, PUT email settings
│   └── test/route.ts     # POST test email
├── api-keys/
│   ├── [provider]/
│   │   ├── route.ts      # PUT save key
│   │   └── test/route.ts # POST test key
│   └── route.ts          # GET list keys
└── ai-prompt/
    ├── route.ts           # GET, PUT, DELETE prompt
    └── test/route.ts      # POST test prompt
```
