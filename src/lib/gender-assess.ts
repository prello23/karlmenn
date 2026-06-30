import "server-only";

import { getOpenAIKey } from "@/lib/admin-settings";

/**
 * Gender assessment for registrants. EkkiEinn.is is a men's support community,
 * so this heuristic (optionally augmented by an LLM) helps admins decide whom
 * to approve. The score is on a 0..1 scale where 1.0 = very likely male.
 *
 * Nothing here is authoritative — it only assists a human decision and powers
 * a conservative auto-approval path for high-confidence male assessments.
 */

export type GenderAssessment = "LIKELY_MALE" | "LIKELY_FEMALE" | "UNCERTAIN";

export type AssessmentResult = {
  assessment: GenderAssessment;
  score: number; // 0..1, 1 = very likely male
  details: string; // JSON string with reasoning
};

// ~100 common Icelandic male first names (lowercased).
const MALE_NAMES = new Set(
  [
    "jón","sigurður","guðmundur","gunnar","ólafur","einar","kristján","magnús",
    "stefán","jóhann","björn","árni","helgi","bjarni","þór","þórður","ragnar",
    "halldór","hjalti","páll","pétur","davíð","daníel","aron","alexander","andri",
    "arnar","atli","baldur","benedikt","birgir","bragi","egill","eiður","elvar",
    "emil","eyþór","finnur","friðrik","garðar","gísli","grétar","guðjón","guðni",
    "gylfi","hafþór","hannes","haraldur","haukur","heiðar","hilmar","hörður",
    "ingi","ingvar","ívar","jakob","jens","jóhannes","karl","kjartan","kristinn",
    "kristófer","lárus","logi","markús","marteinn","mikael","njáll","óðinn",
    "óskar","ottó","rafn","reynir","róbert","rúnar","sigmar","sigþór","skúli",
    "snorri","sturla","svavar","sveinn","tómas","tryggvi","valur","viðar","víðir",
    "vignir","vilhjálmur","ægir","örn","þorsteinn","þorvaldur","þröstur",
    "sebastian","patrekur","brynjar","dagur","hákon","ísak","kári","leó","sindri",
    "steinar","þórir","gauti","valdimar","gunnlaugur",
  ].map((n) => n.toLowerCase()),
);

// ~100 common Icelandic female first names (lowercased).
const FEMALE_NAMES = new Set(
  [
    "guðrún","anna","kristín","margrét","sigríður","helga","sigrún","ingibjörg",
    "jóhanna","maría","elín","katrín","hildur","ragnheiður","ásdís","erla","halla",
    "hanna","birna","berglind","bryndís","dagný","edda","eva","fanney","freyja",
    "gerður","guðbjörg","guðný","hafdís","harpa","heiða","hrafnhildur","hrund",
    "inga","íris","jóna","karen","kolbrún","lára","lilja","linda","lóa","magnea",
    "ólöf","rakel","rebekka","rós","rósa","sandra","sara","selma","sif","sólveig",
    "steinunn","svala","sæunn","telma","thelma","tinna","unnur","valgerður",
    "vigdís","þóra","þórdís","þórunn","ágústa","ásta","bára","bergþóra","brynhildur",
    "dóra","elísabet","emilía","erna","eydís","gígja","guðlaug","gunnhildur","hekla",
    "herdís","hólmfríður","hrefna","klara","kristjana","laufey","lovísa","nanna",
    "oddný","perla","ragna","salka","sigurlaug","sunna","vala","aldís","andrea",
    "diljá","embla","ásgerður","fríða","jódís",
  ].map((n) => n.toLowerCase()),
);

// Known disposable / throwaway email providers — flag for manual review.
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","10minutemail.com","tempmail.com",
  "temp-mail.org","trashmail.com","yopmail.com","getnada.com","dispostable.com",
  "throwawaymail.com","maildrop.cc","sharklasers.com","fakeinbox.com",
  "mailnesia.com","mvrht.com","spam4.me","tempinbox.com","mintemail.com",
]);

function tokens(name: string): string[] {
  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function scoreToAssessment(score: number): GenderAssessment {
  if (score >= 0.6) return "LIKELY_MALE";
  if (score <= 0.4) return "LIKELY_FEMALE";
  return "UNCERTAIN";
}

type HeuristicResult = {
  score: number;
  reasons: string[];
  disposableEmail: boolean;
};

/** Pure name + email heuristic. No network calls. */
export function heuristicAssess(name: string, email: string): HeuristicResult {
  const reasons: string[] = [];
  const parts = tokens(name);
  const first = parts[0] ?? "";

  // First-name match (strongest signal).
  let firstSignal: "male" | "female" | null = null;
  if (first && MALE_NAMES.has(first)) {
    firstSignal = "male";
    reasons.push(`Fornafn "${first}" er algengt karlmannsnafn.`);
  } else if (first && FEMALE_NAMES.has(first)) {
    firstSignal = "female";
    reasons.push(`Fornafn "${first}" er algengt kvenmannsnafn.`);
  }

  // Patronymic suffix on any token.
  const hasSon = parts.some((p) => p.endsWith("son"));
  const hasDottir = parts.some((p) => p.endsWith("dóttir") || p.endsWith("dottir"));
  if (hasSon) reasons.push("Föðurnafn endar á \"-son\" (karlkyns).");
  if (hasDottir) reasons.push("Föðurnafn endar á \"-dóttir\" (kvenkyns).");

  // Combine into a 0..1 score (1 = male).
  let score = 0.5;
  if (firstSignal === "male") score = hasSon ? 0.95 : 0.85;
  else if (firstSignal === "female") score = hasDottir ? 0.05 : 0.15;
  else if (hasSon && !hasDottir) score = 0.8;
  else if (hasDottir && !hasSon) score = 0.2;
  else reasons.push("Ekkert afgerandi kynjamerki í nafni.");

  // Conflicting signals → pull toward uncertain.
  if (hasSon && hasDottir) {
    score = 0.5;
    reasons.push("Misvísandi merki (bæði -son og -dóttir).");
  }

  // Email domain heuristic (secondary).
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const disposableEmail = DISPOSABLE_DOMAINS.has(domain);
  if (disposableEmail) {
    reasons.push(`Einnota netfangslén "${domain}" — krefst handvirkrar skoðunar.`);
  }

  return { score: Math.max(0, Math.min(1, score)), reasons, disposableEmail };
}

type AiResult = {
  likely_male: boolean;
  confidence: number;
  reasoning: string;
};

/** Optional LLM second opinion via OpenAI (skipped if no key configured). */
async function aiAssess(name: string, email: string): Promise<AiResult | null> {
  const key = await getOpenAIKey();
  if (!key) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: `Given the name '${name}' and email '${email}', assess the likelihood this person is male. This is for a men's support community registration. Return JSON: {"likely_male": boolean, "confidence": number, "reasoning": string}`,
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw);
    if (typeof parsed?.likely_male !== "boolean") return null;
    const confidence =
      typeof parsed.confidence === "number"
        ? Math.max(0, Math.min(1, parsed.confidence))
        : 0.5;
    return {
      likely_male: parsed.likely_male,
      confidence,
      reasoning: String(parsed.reasoning ?? ""),
    };
  } catch {
    return null;
  }
}

/**
 * Full assessment: heuristic first, merged with an optional AI second opinion
 * (60% heuristic / 40% AI when AI is available).
 */
export async function assessGender(
  name: string,
  email: string,
): Promise<AssessmentResult> {
  const h = heuristicAssess(name, email);
  const ai = await aiAssess(name, email);

  let finalScore = h.score;
  if (ai) {
    // Convert the AI verdict to the same 0..1 (male) scale.
    const aiScore = ai.likely_male
      ? 0.5 + ai.confidence / 2
      : 0.5 - ai.confidence / 2;
    finalScore = 0.6 * h.score + 0.4 * aiScore;
  }
  finalScore = Math.max(0, Math.min(1, finalScore));

  const details = JSON.stringify({
    finalScore: Number(finalScore.toFixed(3)),
    heuristic: {
      score: Number(h.score.toFixed(3)),
      reasons: h.reasons,
      disposableEmail: h.disposableEmail,
    },
    ai: ai
      ? {
          likely_male: ai.likely_male,
          confidence: ai.confidence,
          reasoning: ai.reasoning,
        }
      : null,
  });

  return {
    assessment: scoreToAssessment(finalScore),
    score: Number(finalScore.toFixed(3)),
    details,
  };
}
