# Uppfærðar kröfur #2 — ekkieinn.is

## 1. Innskráning krafist fyrir þræði

- **Sjá þræði**: Aðeins innskráðir notendur geta skoðað þræði og svör
- **Búa til þráð**: Aðeins innskráðir notendur
- **Svara**: Aðeins innskráðir notendur
- Óinnskráðir sjá forsíðu + um okkur + leiðbeiningar + skráningarform — EN EKKI þræðina

## 2. Staðfestingarpóstur við nýskráningu (Email Verification)

- Þegar notandi skráir sig → fær staðfestingarpóst á email
- Getur EKKI innskráð sig fyrr en hann hefur smellt á staðfestingarlinkinn í póstinum
- Staðfestingarlink er eins-nota token (breytist eftir notkun)
- Token rennur út eftir 48 klst

### Prisma schema:
```prisma
model User {
  ...
  emailVerified   Boolean  @default(false)
  verifyToken     String?  @unique
  verifyTokenExp  DateTime?
}
```

### Flow:
1. Notandi skráir sig → `emailVerified = false`, `verifyToken = <random>`, `verifyTokenExp = now+48h`
2. Sendir email með link: `https://ekkieinn.is/verify?token=<token>`
3. Notandi smellir → token staðfest → `emailVerified = true`, token hreinsuð
4. Ef token útrunninn → biður um að senda aftur

## 3. Admin getur breytt texta staðfestingarpóstsins

Í `/admin/stillingar` (Settings):
- **Efni (Subject)** text input: t.d. "Staðfestu netfangið þitt hjá Ekki einn"
- **Texti (Body)** textarea: Markdown eða HTML
- Placeholder `{{link}}` er skipt út fyrir staðfestingarlinkinn
- Sjálfgefinn texti:
  ```
  Halló,

  Þú ert að skrá þig á ekkieinn.is — samfélag og stuðningsvettvangur.

  Smelltu á linkinn hér að neðan til að staðfesta netfangið þitt:

  {{link}}

  Ef þú skráðir þig ekki, hunsa þennan póst.

  Kveðja,
  Teymið hjá Ekki einn
  ```
- Vista í DB (Settings tafla: key=`verify_email_subject`, key=`verify_email_body`)

## 4. AI nafnaúrvinnsla í þráðum (Name Anonymization)

### Þegar þráður er búinn til:
1. AI (GPT-4o-mini eða Claude Haiku — nota OpenAI API eða Anthropic API) les textann
2. AI finnur mannsnöfn (fyrst- og eftirnöfn, íslensk og erlend)
3. AI skiptir öllum nöfnum út fyrir `[AAA]`, `[BBB]`, `[CCC]` osfrv. (raðbundið per þráð)
4. Upprunalegur texti (með nöfnum) er ALDREI vistaður — aðeins anonymized útgáfan
5. Sýna notanda preview eftir AI-vinnslu með skilaboðum: *"Nafn(nöfn) hafa verið fjarlægð til að vernda nafnleynd"*

### Þegar svar (reply) er sent:
1. Sama AI-vinnsla á svarinu
2. EF AI finnur nafn → **flaggar** svarið
3. Admin fær tilkynningu (in-app + email) með: "Mögulegt nafn í svari á þráð #X"
4. Svar er birt en merkt sem `flagged = true` í DB

### Prisma:
```prisma
model Thread {
  ...
  hasAnonymizedNames Boolean @default(false)
}

model Reply {
  ...
  flagged      Boolean @default(false)
  flagReason   String?
}
```

### Admin:
- Í `/admin/threads` sést merki á flagged svör
- Admin fær email: "Mögulegt nafn í svari — skoða: [link]"
- Admin getur breytt eða eytt svari

## 5. API/Service uppbygging

```typescript
// lib/ai-anonymize.ts
export async function anonymizeText(text: string): Promise<{
  anonymized: string;
  namesFound: string[];
  replacements: Record<string, string>;
}> {
  // Nota OpenAI gpt-4o-mini eða Anthropic claude-haiku
  // Prompt: "Find all person names in the following Icelandic text and replace them with [AAA], [BBB], etc. in order. Return JSON with anonymized text and list of found names."
}

export async function checkForNames(text: string): Promise<{
  hasNames: boolean;
  confidence: number;
}> {
  // Léttur check - bara hvort nöfn séu til staðar
}
```

## ENV variables þarf:
```
OPENAI_API_KEY=...
# eða
ANTHROPIC_API_KEY=...
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=info@ekkieinn.is
SMTP_PASS=...
```

## MIKILVÆGT:
- Við viljum ALDREI að nöfn gerendanna séu birt opinberlega
- AI anonymization á að gerast ÁÐUR en texti er vistaður
- Flagging á comments er til að vernda gerendur frá nafngreiningu á opnum vettvangi
