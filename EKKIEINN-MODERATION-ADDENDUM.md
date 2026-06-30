# EkkiEinn.is — Content Moderation ADDENDUM (CRITICAL)

## ⚠️ IMPORTANT CHANGES TO MODERATION FLOW

This overrides/clarifies parts of `EKKIEINN-CONTENT-MODERATION.md`.

### 1. ALL threads require approval before being visible

**NO thread may be visible to anyone except the author and admins until approved.**

- When a user creates a thread, it goes to `status: "pending"` state
- The thread list (`/samfelag`) must ONLY show threads with `status: "approved"`
- The author can see their own pending/rejected threads (with a status badge)
- Admins can see all threads in `/admin/threads`

### 2. AI Auto-Moderation Flow

When a thread is created:
1. AI (GPT or heuristic) scans the content for:
   - **Names** (Icelandic names including ALL declension forms: Jóhanna, Jóhönnu, Jóhönnu, etc.)
   - **Hate speech** or offensive content
   - **Personal information** (phone numbers, kennitala, addresses)
2. If content is **clean** → `status: "approved"` automatically, thread becomes visible
3. If content has **issues** → `status: "pending_review"`, thread stays hidden from public

### 3. Name Detection MUST catch declensions

The current system finds "Jóhanna" but NOT "Jóhönnu" (dative/genitive form).

**Fix**: The `icelandic-names.ts` database MUST include common declension forms:
- Jóhanna → Jóhönnu, Jóhönnu (all cases)
- Guðrún → Guðrúnar, Guðrúnu
- Sigríður → Sigríði, Sigríðar
- etc.

For each name, generate at least nominative + genitive + dative + accusative forms.

Also use regex pattern matching: if "Jóhann" is a known name root, match any word starting with "Jóhann" (Jóhanna, Jóhönnu, Jóhannes, etc.)

### 4. User-Facing Thread Status

On the user's own thread page and in the thread list (for author only), show:

- 🟡 **"Bíður samþykktar"** — Thread is pending review
- 🟢 **"Samþykkt og birt"** — Thread is approved and visible
- 🔴 **"Hafnað — vinsamlegast breyttu texta"** — Thread was rejected

### 5. Suggestion UI (for author)

When AI finds issues, the author sees at the bottom of their thread:

```
━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ TILLAGA FRÁ KERFI

Nöfn fundust í textanum og þurfa að vera fjarlægð áður en þráður birtist.

Fundin nöfn: Jóhanna → [Nafn], Jóhönnu → [Nafn]

[Samþykkja tillögu]  [Breyta handvirkt]
━━━━━━━━━━━━━━━━━━━━━━━━
```

- **"Samþykkja tillögu"** → Replaces all found names with `[Nafn]`, resubmits for AI check
- **"Breyta handvirkt"** → Opens edit form where user can change text themselves
- After edit/accept → AI checks again → if clean → auto-approve

### 6. The "TILLAGA" section

The suggestion section (shown in IMG_6161.png) already exists but needs fixes:
- The **original text with names MUST NOT be visible** to anyone except the author
- Public visitors see NOTHING until the thread is approved
- Only the author sees the original + suggestion side by side
- Replace `[AAA]` placeholder with `[Nafn]` (more meaningful in Icelandic)

### 7. Admin thread moderation

In `/admin/threads`, admin sees:
- All threads with status column (Pending/Approved/Rejected/Hidden)
- Can click to view full thread
- Buttons: **Samþykkja** (approve), **Hafna** (reject with optional message), **Fela** (hide)
- Admin can edit thread content directly if needed

### 8. Database changes

Add to Thread model if not already present:
```prisma
model Thread {
  // ... existing fields
  status        String   @default("pending") // "pending", "pending_review", "approved", "rejected", "hidden"
  moderationNote String? // AI or admin note about why rejected
  aiSuggestion  String?  // AI-suggested cleaned version
  foundNames    String?  // JSON array of found names
}
```

### 9. Thread list filtering

```typescript
// Public thread list - ONLY approved
where: { status: "approved", isHidden: false }

// Author's own threads - show all with status
where: { OR: [{ status: "approved" }, { authorId: currentUser.id }] }

// Admin - show all
where: {} // no filter
```

### 10. Declension matching strategy

Instead of exact matching only, use this approach:
1. Build a stem map: extract the first 4-6 chars of each known name as a "stem"
2. Match any word that starts with a known stem AND has a common Icelandic suffix
3. Common suffixes: -u, -ar, -i, -a, -s, -nu, -ni, -nar, -nni, -nnar
4. Example: stem "Jóhann" matches: Jóhanna, Jóhönnu, Jóhannes, Jóhanni, Jóhanns

This catches virtually all declension forms without needing a complete declension database.
