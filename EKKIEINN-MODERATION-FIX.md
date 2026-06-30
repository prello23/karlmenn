# EkkiEinn.is — Content Moderation CRITICAL FIX

## ⚠️ THIS SUPERSEDES ALL PREVIOUS MODERATION SPECS

The current implementation has THREE critical bugs:

### Bug 1: Names NOT replaced in suggestion
The "TILLAGA (NÖFN FJARLÆGÐ)" column still shows the original names like "Jóhönnubyrjaði".
The system MUST replace ALL detected names with placeholder letters.

**Example:**
- Original: `Sambandið okkar Jóhönnubyrjaði af mikilli ást og von`
- MUST become: `Sambandið okkar [AAA] af mikilli ást og von`

Rules:
- First detected name → `[AAA]`, second → `[BBB]`, third → `[CCC]` etc.
- Same name in different declension forms gets SAME placeholder (Jóhanna, Jóhönnu, Jóhönnum → all `[AAA]`)
- The suggestion column must show the CLEANED text with ALL names replaced
- Compound words containing names must also be caught: "Jóhönnubyrjaði" → "[AAA]byrjaði" or just "[AAA]"

### Bug 2: Thread visible without approval
Threads are appearing on the public site BEFORE admin/AI approval. This MUST NOT happen.

**Rules:**
- Every new thread starts with `status = 'pending'`
- ONLY threads with `status = 'approved'` appear on public pages
- The public thread list query MUST filter: `WHERE status = 'approved'` (or `isApproved = true`)
- The thread detail page MUST return 404 for non-approved threads (unless viewer is the author or admin)

### Bug 3: No user feedback on moderation status
The thread author cannot see:
- Whether their thread is pending/approved/rejected
- WHY it was flagged (e.g., "Nafn fannst í texta")
- What changes to make

## Required Implementation

### 1. AI Content Scanner (server-side, on thread creation)
When a user submits a thread:
1. Scan text for names using the Icelandic name database + declension detection
2. If names found:
   - Set `status = 'pending'` (or 'needs_review')
   - Store `moderationReason = 'Nafn fannst í texta: Jóhanna'`
   - Generate `suggestedText` with names replaced by [AAA], [BBB], etc.
   - Store mapping: `nameMap = {"AAA": "Jóhanna", "BBB": "Gunnar"}`
3. If NO names and no hate speech:
   - Auto-approve: `status = 'approved'`
4. Admin can override any decision

### 2. Author View — "Mínar færslur" or thread status page
The author sees their threads with status:
- 🟡 **Bíður samþykktar** — "Nafn fannst í texta"
  - Shows the SUGGESTED text with [AAA] replacements
  - Author can:
    - **Samþykkja tillögu** — Accept the [AAA] version → auto-publishes
    - **Breyta texta** — Edit manually → re-scan → if clean, auto-publishes
- 🟢 **Samþykkt** — Thread is live
- 🔴 **Hafnað** — Shows reason

### 3. Admin Thread Moderation
Admin sees all pending threads with:
- Original text (left)
- Suggested text with [AAA] (right) — names ACTUALLY replaced
- Buttons: Samþykkja / Hafna / Breyta
- Can manually edit and approve

### 4. Name Detection — MUST catch declension forms
The Icelandic name database must include ALL common declension forms.
- Jóhanna → Jóhönnu, Jóhönnum (dative)
- Anna → Önnu
- Gunnar → Gunnars, Gunnari
- Sigríður → Sigríði, Sigríðar
- Compound detection: "Jóhönnubyrjaði" contains "Jóhönnu" → MUST be detected

### 5. Perpetrator Name Registry Search (NEW PAGE)
A separate public page (e.g., `/leit-ad-geranda` or `/nafnaleit`) where:
- User types a name
- System searches an internal database/registry
- Returns: **Já** (name found in registry) or **Nei** (not found)
- This is a simple lookup — admin maintains the registry via admin panel
- Admin can add/remove names from the registry
- This is NOT connected to the thread system — it's a standalone feature

### 6. genderize.io Integration for Registration
When a new user registers:
1. Extract first name from the name field
2. Extract name from email prefix (e.g., johanna@gmail.com → "johanna")  
3. Call genderize.io API: `GET https://api.genderize.io?name={name}`
4. If response gender = "male" AND probability >= admin threshold (default 70%):
   - Auto-approve registration
   - User can log in after email verification
5. If gender = "female" OR probability below threshold:
   - Hold for admin review
   - User sees: "Skráning þín bíður samþykktar"
6. Admin can set threshold percentage in Settings
7. Free tier: 100 lookups/day (sufficient for this site)

## Database Schema Changes
```prisma
model Thread {
  // ... existing fields
  status           String   @default("pending") // pending, approved, rejected
  moderationReason String?  // Why flagged
  suggestedText    String?  // Text with names replaced by [AAA]
  nameMap          String?  // JSON: {"AAA": "Jóhanna", "BBB": "Gunnar"}
}

model PerpetratorRegistry {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  addedBy   String?  // admin who added
  addedAt   DateTime @default(now())
}

model SiteSettings {
  // ... existing
  genderThreshold  Int @default(70) // percentage for auto-approve
  requireApproval  Boolean @default(true) // all threads need approval
}
```

## CRITICAL: Public query filter
```typescript
// EVERY public thread query MUST include this:
where: { status: 'approved' }

// Thread detail for non-admin:
where: { id: threadId, OR: [{ status: 'approved' }, { authorId: currentUserId }] }
```
