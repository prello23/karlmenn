# EkkiEinn.is — Content Moderation + Registration Auto-Approval

## Overview
Three interconnected features:
1. **Thread content moderation** — Auto-detect names in thread text, block publication until cleaned
2. **Registration auto-approval** — Smart threshold-based auto-approve using name + email analysis
3. **Gender assessment improvements** — Fix Icelandic name database, add email lookup

## 1. Thread Content Moderation

### Problem
Users post threads containing real names (e.g., "Jóhönnu", "Jóhanna"). These must NOT be published with identifiable names visible.

### Solution
When a user submits a thread:

1. **Server-side name detection** runs on the thread text before publishing
2. Scan text against a comprehensive Icelandic name database (see section 3)
3. If names are detected:
   - Thread status = `PENDING_REVIEW` (new status, not published)
   - User sees a message: "Þráður þinn inniheldur hugsanlega nöfn sem þarf að fjarlægja áður en hann birtist. Vinsamlegast breyttu textanum og reyndu aftur."
   - Show which words were flagged as potential names (highlighted)
   - User can edit the text and resubmit
   - Admin can also see flagged threads in `/admin/threads` with a "Nöfn fundin" badge
   - Admin can edit the thread text, remove names, and approve/publish
4. If NO names detected: thread publishes normally (subject to existing approval rules)

### Database Schema Changes
```prisma
model Thread {
  // ... existing fields
  status        String   @default("PUBLISHED") // PUBLISHED, PENDING_REVIEW, HIDDEN, DRAFT
  flaggedNames  String?  // JSON array of detected names, e.g. ["Jóhanna", "Gunnar"]
  moderationNote String? // Admin note about why it was flagged/approved
}
```

### Name Detection Algorithm
```typescript
function detectNames(text: string): string[] {
  // 1. Load Icelandic name list (male + female names)
  // 2. Tokenize text into words
  // 3. For each word, check against name database
  // 4. Also check declined/conjugated forms (Icelandic declension):
  //    - Jóhanna → Jóhönnu (dative), Jóhönnu (genitive), Jóhönnu (accusative)
  //    - Gunnar → Gunnari (dative), Gunnars (genitive)
  //    - Handle common patterns: -ar → -ari/-ars, -a → -u, etc.
  // 5. Ignore common words that happen to be names (e.g., "von" is not flagged)
  // 6. Return array of detected name-forms with their base name
  
  // Common Icelandic name declension patterns:
  // Feminine -a names: nom -a, acc -u, dat -u, gen -u
  // Masculine -ur names: nom -ur, acc -∅, dat -i, gen -s/-ar
  // Masculine -i names: nom -i, acc -a, dat -a, gen -a
  
  return detectedNames;
}
```

### Icelandic Name Database
Create a comprehensive list at `src/lib/icelandic-names.ts`:
- Download/scrape from Þjóðskrá (National Registry) or use the well-known Icelandic name list
- Include ALL approved Icelandic names (mannanafnaskrá): https://www.island.is/mannanofn
- Categorize as MALE or FEMALE
- Include at minimum 500+ male names and 500+ female names
- Include common foreign names used in Iceland
- Store as simple arrays: `export const MALE_NAMES: string[]` and `export const FEMALE_NAMES: string[]`

### UI Changes

#### User submitting thread:
- After submit, if names detected, show error banner:
  ```
  ⚠️ Nöfn fundust í textanum
  Eftirfarandi orð gætu verið nöfn: [Jóhönnu], [Gunnari]
  Vinsamlegast fjarlægðu eða breyttu nöfnum áður en þráðurinn birtist.
  Þú getur notað dulnefni eða skammstafanir (t.d. "J." eða "fyrrverandi mín").
  [Breyta og reyna aftur]
  ```
- The thread is saved as DRAFT so user doesn't lose their text
- User can edit and resubmit

#### Admin `/admin/threads`:
- Show `PENDING_REVIEW` threads with orange badge "Bíður yfirferðar"
- Show flagged names in the thread row
- Admin can click to view full thread
- Admin can:
  - Edit thread text (remove/replace names)
  - Approve and publish (changes status to PUBLISHED)
  - Reject with note (notifies user)
  - Hide (existing isHidden functionality)

### Important Rules
- The name detection should be SENSITIVE (catch more, not fewer) — better to flag a false positive than miss a real name
- Common Icelandic words that are also names should have an exception list (e.g., "ást", "von", "sól" in lowercase are not names, but "Ást", "Von", "Sól" capitalized could be)
- Only flag words that start with uppercase letter (proper noun pattern)
- Exception: Also flag lowercase versions of very common names in case users try to sneak them in
- Admin can configure sensitivity in `/admin/settings`

## 2. Registration Auto-Approval

### Current Behavior
All new registrations require manual admin approval (or auto-approve if gender assessment says "likely male").

### New Behavior
Admin can configure an auto-approval threshold (percentage) in `/admin/settings`:

```
Sjálfvirk samþykki skráningar
├── Kveikt/Slökkt toggle
├── Lágmarksskor (%): [slider 50-100, default 80]
├── Athuganir:
│   ☑ Nafnagreining (Icelandic name database)
│   ☑ Tölvupóstgreining (email pattern analysis)
│   ☑ Netleit (online lookup - if available)
└── [Vista stillingar]
```

### How it works:
1. User registers with Name + Email
2. System calculates a "male confidence score" (0-100%):
   - **Name analysis** (weight: 60%): Check against Icelandic name database
     - Known male name → 100 points
     - Known female name → 0 points
     - Unknown → 50 points
     - Also check the NAME ITSELF not just first letter patterns
   - **Email analysis** (weight: 20%): 
     - Email contains known male name (e.g., gunnar@, jon@) → 100 points
     - Email contains known female name → 0 points
     - Neutral → 50 points
   - **Online lookup** (weight: 20%):
     - If available, check genderize.io API (free tier: 100/day)
     - Or check Þjóðskrá if API available
     - Fallback: 50 points (neutral)
3. If final score >= admin threshold → AUTO-APPROVE after email verification
4. If final score < threshold → PENDING manual admin approval
5. Show the score and breakdown in admin user detail page

### Email Verification Flow (auto-approved):
1. User registers → verification email sent
2. User clicks verification link
3. If auto-approved: user can log in immediately
4. If not auto-approved: user sees "Aðgangur þinn bíður samþykkis stjórnanda"

### Admin Settings for this:
Add to existing `/admin/settings` page under new tab "Skráningar":
- Toggle: "Sjálfvirk samþykki" (on/off)
- Slider: "Lágmarksskor" (50-100%)
- Checkboxes for which checks to run
- Test field: Enter a name+email to see what score it would get

## 3. Gender Assessment Improvements

### Fix Icelandic Name Database
The current heuristic-based system incorrectly handles names like "Jóhanna" (should be 100% female).

Create `src/lib/icelandic-names.ts` with comprehensive name lists:

```typescript
// Top 200+ Icelandic male names
export const MALE_NAMES = [
  'Jón', 'Sigurður', 'Guðmundur', 'Gunnar', 'Ólafur', 'Kristján',
  'Magnús', 'Stefán', 'Jóhann', 'Björn', 'Árni', 'Helgi', 'Einar',
  'Ragnar', 'Pétur', 'Karl', 'Eiríkur', 'Bjarni', 'Hallur', 'Þór',
  'Davíð', 'Þorsteinn', 'Friðrik', 'Sveinn', 'Haraldur', 'Gísli',
  'Viktor', 'Páll', 'Elvar', 'Ágúst', 'Haukur', 'Ingvar', 'Valur',
  // ... 200+ more
];

// Top 200+ Icelandic female names  
export const FEMALE_NAMES = [
  'Guðrún', 'Sigríður', 'Kristín', 'Margrét', 'Helga', 'Sigrún',
  'Anna', 'Jóhanna', 'Katrín', 'María', 'Ingibjörg', 'Hildur',
  'Þóra', 'Ragnheiður', 'Erla', 'Ásta', 'Birna', 'Elín', 'Hrafnhildur',
  'Jónína', 'Kolbrún', 'Linda', 'Nanna', 'Ólöf', 'Rós', 'Sólveig',
  'Unnur', 'Valdís', 'Vigdís',
  // ... 200+ more
];
```

### Declension Support
For name detection in text, support common Icelandic name declensions:

```typescript
function getNameForms(name: string, gender: 'male' | 'female'): string[] {
  const forms = [name];
  
  if (gender === 'female') {
    // -a → -u pattern (most common feminine)
    if (name.endsWith('a')) {
      forms.push(name.slice(0, -1) + 'u'); // Jóhanna → Jóhönnu... wait
      // Special: a→ö before nn: Jóhanna → Jóhönnu
      // This needs proper Icelandic declension rules
    }
    // -ún → -únu: Guðrún → Guðrúnu  
    if (name.endsWith('ún')) {
      forms.push(name + 'u');
      forms.push(name + 'ar');
    }
  }
  
  if (gender === 'male') {
    // -ur → -i/-ar/-s: Sigurður → Sigurði/Sigurðar/Sigurðs
    if (name.endsWith('ur')) {
      const stem = name.slice(0, -2);
      forms.push(stem + 'i');
      forms.push(stem + 'ar');
      forms.push(stem + 's');
    }
    // -n → -ni/-ns/-nar: Jón → Jóni/Jóns
    if (name.endsWith('n') || name.endsWith('r')) {
      forms.push(name + 'i');
      forms.push(name + 's');
    }
  }
  
  return forms;
}
```

**IMPORTANT**: For `Jóhanna → Jóhönnu` — this is u-umlaut (a→ö before nasal + u). The declension engine must handle this:
- Jóhanna (nom) → Jóhönnu (acc/dat/gen) — the a before nn becomes ö
- Anna → Önnu
- Hanna → Hönnu
- This pattern: when -anna → -önnu, -anna → -önnu

### Email-Based Gender Lookup
Use genderize.io free API (100 requests/day, no API key needed):
```
GET https://api.genderize.io/?name=Gunnar&country_id=IS
Response: { "name": "Gunnar", "gender": "male", "probability": 0.99, "count": 1234 }
```

Also try extracting name from email:
- `gunnar.palsson@gmail.com` → extract "gunnar" → lookup
- `jonsi85@gmail.com` → extract "jonsi" → might match "Jón" pattern
- `g.palsson@company.is` → extract "g" → too short, skip

### Admin User Detail Enhancements
In the admin user detail page, show:
- Full name
- Email
- Gender assessment score with breakdown:
  - Name score: X% (Gunnar = male name, 100%)
  - Email score: X% (gunnar@ pattern, 100%)  
  - Online score: X% (genderize.io: male, 99%)
  - **Final score: X%**
- Assessment result: ✅ Sjálfvirkt samþykkt / ⏳ Bíður yfirferðar / ❌ Hafnað

## 4. Implementation Order

1. Create `src/lib/icelandic-names.ts` with comprehensive name lists (500+ male, 500+ female)
2. Create `src/lib/name-detection.ts` with declension support and text scanning
3. Update Thread model with `status` and `flaggedNames` fields
4. Update thread creation API to run name detection
5. Update thread display to respect status
6. Update `/admin/threads` with moderation UI
7. Update registration to use improved gender assessment with threshold
8. Add auto-approval settings to `/admin/settings`
9. Add genderize.io integration for email lookup
10. Build, smoke test, push to beta

## 5. Testing Checklist
- [ ] "Jóhanna" correctly detected as female name
- [ ] "Jóhönnu" (declined) correctly detected as name in text
- [ ] Thread with "Sambandið okkar Jóhönnu byrjaði..." gets flagged
- [ ] Thread without names publishes normally
- [ ] User can edit flagged thread and resubmit
- [ ] Admin can edit and approve flagged thread
- [ ] Registration with "Gunnar" auto-approves (score > threshold)
- [ ] Registration with "Jóhanna" does NOT auto-approve
- [ ] Admin can adjust threshold in settings
- [ ] genderize.io lookup works for names
