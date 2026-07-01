# EKKIEINN-AI-CONTENT-MODERATION.md
## AI-Powered Content Moderation — GPT/LLM Text Analysis

### Goal
Add AI-powered content analysis to the moderation pipeline. The AI must **read and understand** the Icelandic text — not just pattern-match keywords. It must detect threats, harassment, hate speech, defamation, and rule violations by comprehending the meaning and context.

### Current State
- `contentCheck.ts` has regex-based detection: names, kennitala, phone numbers, hate-word list
- Threads default to `pending` status; admin approves/rejects
- `aiAnalysis` JSON field exists on Thread model
- `.env` has `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` placeholders (both empty — one must be filled)

### Requirements

#### 1. AI Analysis in contentCheck pipeline
Add an `analyzeContentWithAI(text: string)` function in `src/lib/contentCheck.ts` (or a new `src/lib/aiModeration.ts` file):

```typescript
interface AIAnalysisResult {
  safe: boolean;           // true = content is OK
  confidence: number;      // 0-100
  categories: string[];    // e.g. ["threats", "harassment"]
  reasoning: string;       // AI explanation in Icelandic
  suggestedAction: 'approve' | 'review' | 'reject';
}
```

#### 2. What the AI must detect
The AI system prompt must instruct it to analyze Icelandic text for:
- **Hótanir (Threats)** — direct or implied threats of violence
- **Níð / Einelti (Harassment/Bullying)** — targeting individuals, repeated attacks
- **Hatursáróður (Hate speech)** — based on gender, sexuality, race, religion, disability
- **Ærumeiðingar (Defamation)** — false accusations, character assassination
- **Persónuupplýsingar (Personal info)** — addresses, workplaces, identifying details about third parties (beyond what regex catches)
- **Sjálfskaði (Self-harm)** — content suggesting self-harm or suicide
- **Ólöglegt efni** — content describing illegal activities in detail
- **Brot á reglum síðunnar** — anything that violates EkkiEinn.is community guidelines

#### 3. System Prompt (Icelandic)
The AI must receive a system prompt like:

```
Þú ert efnisgreiningarvél fyrir EkkiEinn.is — samfélagssíðu fyrir karla sem hafa orðið fyrir ofbeldi eða rangsæri.
Þú átt að lesa texta og meta hvort hann standist reglur síðunnar.

Reglur:
1. Engar hótanir eða ofbeldisfull ummæli
2. Ekkert níð, einelti eða áreitni
3. Enginn hatursáróður
4. Engar ærumeiðingar eða rangar ásakanir sem ekki er hægt að sanna
5. Engar persónuupplýsingar um þriðja aðila (heimilisföng, vinnustaðir, kennitölur, símanúmer)
6. Ekkert efni sem hvetur til sjálfskaða
7. Ekkert ólöglegt efni

Svaraðu á JSON formi:
{
  "safe": true/false,
  "confidence": 0-100,
  "categories": ["threats", "harassment", ...],
  "reasoning": "Stuttur skýring á íslensku",
  "suggestedAction": "approve" | "review" | "reject"
}

Ef textinn er sögulýsing á reynslu manns sem hefur orðið fyrir ofbeldi — það er LEYFILEGT. 
Fólk á rétt á að segja sína sögu. En nöfn á gerendur eiga að vera fjarlægð (annað kerfi sér um það).
Ef þú ert í vafa, veldu "review" svo admin geti yfirfarið.
```

#### 4. Integration into createThread
In `createThread` server action (or API route):
1. Run existing `buildSuggestion()` (names, kennitala, phone redaction)
2. **Then** run `analyzeContentWithAI(text)` on the ORIGINAL text
3. Store result in `aiAnalysis` JSON field
4. Auto-decision logic:
   - If AI says `approve` AND no names detected → status = `approved`
   - If AI says `reject` (confidence > 80) → status = `rejected`, set `moderationReason` from AI reasoning
   - If AI says `review` OR confidence < 80 → status = `pending` (admin must review)

#### 5. Also analyze comments
Comments must also go through AI analysis before being visible. Add same pipeline to comment creation.

#### 6. API Provider Support
Support both OpenAI and Anthropic. Check env vars:
- If `OPENAI_API_KEY` is set → use `gpt-4o-mini` (cheap, fast, good at Icelandic)
- If `ANTHROPIC_API_KEY` is set → use `claude-3-haiku` (also cheap and fast)
- If neither → fall back to current heuristic-only approach (no AI analysis)

Use direct `fetch()` to the API — do NOT add `openai` or `@anthropic-ai/sdk` npm packages. Keep it simple:

```typescript
// OpenAI
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: text }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  })
});
```

#### 7. Admin visibility
On `/admin/threads/[id]` review page, show the AI analysis:
- "AI mat: Leyfilegt ✅" or "AI mat: Hafnað ❌"
- Categories detected
- AI reasoning text
- Confidence score

#### 8. Rate limiting / Cost control
- Cache AI results in `aiAnalysis` field — don't re-analyze on page loads
- Only analyze on thread/comment CREATION and when user RESUBMITS after rejection
- `gpt-4o-mini` costs ~$0.15/1M input tokens — very cheap for short posts

#### 9. Error handling
- If AI API call fails (timeout, rate limit, key invalid) → fall back to heuristic-only, set status to `pending`
- Log errors but don't crash the thread creation
- Show admin: "AI greining mistókst — handvirk yfirferð nauðsynleg"

### Files to modify
- `src/lib/aiModeration.ts` — NEW: AI analysis function
- `src/lib/contentCheck.ts` — integrate AI call
- `src/app/community/actions.ts` — update createThread to use AI
- `src/app/admin/threads/[id]/page.tsx` — show AI analysis details
- `.env.example` — document the API key vars

### DO NOT
- Do NOT add npm packages for OpenAI/Anthropic — use raw fetch
- Do NOT block thread creation if AI is slow — use a 10s timeout, fall back to heuristic
- Do NOT remove existing regex-based checks — AI is IN ADDITION to them
- Do NOT change the name redaction system ([AAA]/[BBB]) — AI runs separately
