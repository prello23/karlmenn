# EkkiEinn.is — Content Moderation ADDENDUM (CRITICAL UPDATE v2)

## ⚠️ THIS OVERRIDES AND CLARIFIES PARTS OF EKKIEINN-CONTENT-MODERATION.md

Read EKKIEINN-CONTENT-MODERATION.md first, then apply these changes.

---

## 1. THREADS MUST NOT BE VISIBLE WITHOUT APPROVAL

**DEFAULT STATE**: Every new thread has `status = "pending"`. 

**Public thread list** (`/thraedir` or main forum page): ONLY show threads with `status = "approved"`.

**The user who posted** sees their own threads with status badges:
- 🟡 **Bíður samþykktar** — pending
- 🟢 **Samþykkt** — approved (visible to all)
- 🔴 **Hafnað** — rejected (only poster sees it)

**AI auto-approval flow**:
1. User submits thread
2. AI checks content (names, hate speech, personal info)
3. If content is CLEAN → auto-approve → `status = "approved"` → visible immediately
4. If content has issues → `status = "pending"` → admin must review

---

## 2. NAME REPLACEMENT — "Tillaga" (Suggestion)

When AI detects a name in thread content:
- Thread stays `status = "pending"` (NOT visible to public)
- Show the poster a **"Tillaga"** (suggestion) section below their thread text
- The suggestion shows the SAME text but with detected names replaced with `[Nafn]`
- Example: "Ég var með Jóhönnu í bílnum" → "Ég var með [Nafn] í bílnum"
- The poster can:
  - **Accept suggestion** → text is updated, AI re-checks, if clean → auto-approve
  - **Edit manually** → poster rewrites, AI re-checks, if clean → auto-approve
  - **Do nothing** → stays pending for admin review

The suggestion appears as a clearly styled box below the original text:
```
📝 Tillaga — nafn fannst í textanum:
"Ég var með [Nafn] í bílnum og..."
[Samþykkja tillögu]  [Breyta sjálf/ur]
```

---

## 3. NAME DETECTION MUST CATCH DECLENSIONS

Icelandic names change form (declensions). The name database must include ALL forms:
- Jóhanna → Jóhönnu (accusative/dative), Jóhönnu (genitive)
- Guðrún → Guðrúnar, Guðrúnu
- Sigríður → Sigríði, Sigríðar
- Gunnar → Gunnari, Gunnars
- Páll → Páli, Páls

Use **stem matching**: strip common Icelandic suffixes (-ar, -i, -s, -u, -ur, -a) and compare stems.
Also do **fuzzy match** against the full declension database.

---

## 4. EMAIL-BASED GENDER LOOKUP FOR REGISTRATION

When a new user registers, check their gender via MULTIPLE signals:

### a) Name analysis (already in CONTENT-MODERATION spec)
Use the Icelandic name database to check if the provided name is male/female.

### b) Email-based name extraction + genderize.io
1. Extract the name part from the email address:
   - `johanna.sigurdsdottir@gmail.com` → "johanna sigurdsdottir"
   - `gunnar85@hotmail.com` → "gunnar"
   - `g.palsson@company.is` → skip (too short)
2. Send extracted first name to `https://api.genderize.io/?name={name}`
3. API returns: `{ "name": "gunnar", "gender": "male", "probability": 0.97, "count": 1234 }`
4. Use this as an ADDITIONAL signal alongside the Icelandic name database

### c) Combined scoring
- Icelandic name DB says male (weight: 60%)
- genderize.io says male (weight: 30%)  
- Email name extraction says male (weight: 10%)
- If combined score > admin threshold → auto-approve registration
- If score is borderline → pending for admin review

### d) Admin settings
- Admin can set the **auto-approve threshold** (default: 70%)
- Admin can see the breakdown: "Nafn: 90% karl | Email: 85% karl | Heildar: 88%"

---

## 5. HATE SPEECH / BANNED CONTENT

Check thread content for:
- **Names** (Icelandic name DB + declensions)
- **Hate speech** keywords (maintain a list in admin settings)
- **Personal info** (kennitala patterns: 6+4 digits, phone numbers, addresses)
- **Offensive language** targeting individuals

If ANY of these are detected → `status = "pending"` + show poster what was flagged.

---

## 6. ADMIN THREAD REVIEW PAGE

`/admin/threads` must show:
- Filter by status: All | Pending | Approved | Rejected
- Each thread shows: title, poster, date, status badge, AI analysis result
- Click to open → see full text with flagged items highlighted
- Actions: **Samþykkja** (approve) | **Hafna** (reject) | **Breyta** (edit then approve)
- If thread has AI suggestion, show it alongside original

---

## IMPLEMENTATION PRIORITY

1. Thread status field + public filtering (ONLY approved visible)
2. AI content check on submit (names, hate, personal info)
3. Suggestion UI for poster (name replacement)
4. Admin review page improvements
5. genderize.io integration for registration
