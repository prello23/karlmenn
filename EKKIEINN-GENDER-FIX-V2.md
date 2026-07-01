# EKKIEINN-GENDER-FIX-V2.md — Fix email gender analysis NOW

## Problem
The email gender analysis is BROKEN. When testing with name "elvar pall" and email "johanna@gmail.com":
- Netfangsskor shows 50% and says "Ekkert nafn greinanlegt í netfangi"
- But "johanna" IS clearly a female name (Jóhanna) — should give 0%

## Root cause
The email prefix extraction does NOT look up the name in the Icelandic name database (nafnaskrá). It was supposed to map ASCII→Icelandic (johanna→Jóhanna) and check.

## Requirements

### 1. Email prefix → name lookup
- Extract email prefix before @ (e.g. "johanna" from "johanna@gmail.com")
- Strip numbers and dots (e.g. "johanna123" → "johanna", "jon.gunnar" → split both "jon" and "gunnar")
- Search the nafnaskrá (perpetrator registry DB) for matches — BUT ALSO search the ICELANDIC NAMES list
- Map common ASCII to Icelandic: jo→jó, a→á, i→í, o→ó, u→ú, th→þ, d→ð etc.
- Try all variations: "johanna" → check "johanna", "jóhanna", "Jóhanna", "Johanna"
- If ANY match is found as a FEMALE name → Netfangsskor = 0%
- If ANY match is found as a MALE name → Netfangsskor = 100%
- Only if NO name detected → Netfangsskor = 50% (neutral)

### 2. Consider removing genderize.io weight
- genderize.io searches for "elvar pall" (the entered name) — it returns "karl 100%" which is correct for the NAME
- But the problem is genderize.io does NOT analyze the EMAIL separately
- Current weights: 0.6×name + 0.3×genderize + 0.1×email
- NEW weights: 0.5×name + 0.0×genderize + 0.5×email
- REMOVE genderize.io entirely — it adds nothing that the Icelandic nafnaskrá doesn't already provide
- This way if name="elvar" (100% male) but email="johanna@gmail.com" (0% female), the score becomes 50% — NOT auto-approved, needs admin review

### 3. The scoring logic
- Nafnaskor: Check entered name against Icelandic name database (already works)
- Netfangsskor: Check email prefix against Icelandic name database (MUST FIX)
- Final score = 0.5 × Nafnaskor + 0.5 × Netfangsskor
- If name says male (100%) but email says female (0%) → 50% → needs admin review ✅
- If name says male (100%) and email says male (100%) → 100% → auto-approved ✅
- If name says female (0%) and email says female (0%) → 0% → rejected ✅

### 4. Display
- Show what name was detected from email: e.g. "johanna → Jóhanna (kvennmannsnafn)"
- Remove all genderize.io references from UI and API

## Files to check
- The gender scoring service/utility (wherever `Netfangsskor` and `Nafnaskor` are calculated)
- The admin settings page test widget
- The registration API

## After changes
- Build, restart PM2 ekkieinn, push to beta
- Test: name="elvar pall" email="johanna@gmail.com" should give ~50% score, NOT 95%
