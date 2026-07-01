import "server-only";

import { getOpenAIKey } from "@/lib/admin-settings";
import { getSetting } from "@/lib/settings";
import type { ContentCheck } from "@/lib/content-check";

/**
 * AI-powered content moderation for EkkiEinn.is.
 *
 * The AI *reads and understands* the Icelandic text (it does not merely
 * pattern-match) to detect threats, harassment, hate speech, defamation and
 * other rule violations. It runs IN ADDITION to the heuristic checks in
 * `content-check.ts` (names, kennitala, phones, hate-word list).
 *
 * Provider: OpenAI (gpt-4o-mini) using the key stored in the `Setting` table
 * (key `openai_api_key`, managed from the admin UI). An Anthropic key in the
 * environment is used as a fallback. No SDK is used — raw `fetch()` only.
 */

export interface AIAnalysisResult {
  safe: boolean; // true = content is OK
  confidence: number; // 0-100
  categories: string[]; // e.g. ["threats", "harassment"]
  reasoning: string; // AI explanation in Icelandic
  suggestedAction: "approve" | "review" | "reject";
  provider: string; // which model produced the verdict
}

/**
 * Result of an analysis attempt:
 *  - `ok`       → we have a verdict
 *  - `disabled` → no API key configured (fall back to heuristic-only)
 *  - `error`    → a key exists but the call failed (be safe: hold for review)
 */
export type AIModerationOutcome =
  | { status: "ok"; result: AIAnalysisResult }
  | { status: "disabled" }
  | { status: "error"; message: string };

// The AI is only asked to run on CREATION / RESUBMIT, so a slow call must never
// block the user for long. Fall back to heuristic-only after this many ms.
const AI_TIMEOUT_MS = 10_000;

const SYSTEM_PROMPT = `Þú ert efnisgreiningarvél fyrir EkkiEinn.is — samfélagssíðu fyrir karla sem hafa orðið fyrir ofbeldi eða rangsæri.
Þú átt að lesa texta og meta hvort hann standist reglur síðunnar. Textinn er á íslensku — lestu hann og skildu merkinguna og samhengið, ekki bara stök orð.

Reglur:
1. Engar hótanir eða ofbeldisfull ummæli (hótanir)
2. Ekkert níð, einelti eða áreitni gegn einstaklingum
3. Enginn hatursáróður (byggður á kyni, kynhneigð, kynþætti, trú eða fötlun)
4. Engar ærumeiðingar eða rangar ásakanir sem ekki er hægt að sanna
5. Engar persónuupplýsingar um þriðja aðila (heimilisföng, vinnustaðir, kennitölur, símanúmer)
6. Ekkert efni sem hvetur til sjálfskaða eða sjálfsvígs
7. Ekkert ólöglegt efni eða nákvæmar lýsingar á ólöglegri háttsemi

Svaraðu EINGÖNGU á JSON formi:
{
  "safe": true/false,
  "confidence": 0-100,
  "categories": ["threats", "harassment", "hate_speech", "defamation", "personal_info", "self_harm", "illegal", "rule_violation"],
  "reasoning": "Stutt skýring á íslensku",
  "suggestedAction": "approve" | "review" | "reject"
}

Ef textinn er sögulýsing á reynslu manns sem hefur orðið fyrir ofbeldi — það er LEYFILEGT.
Fólk á rétt á að segja sína sögu. En nöfn á gerendur eiga að vera fjarlægð (annað kerfi sér um það, ekki hafna texta bara vegna nafna).
Ef þú ert í vafa, veldu "review" svo stjórnandi geti yfirfarið.`;

/** Fetch with an AbortController-based timeout. */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  ms: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Coerce whatever the model returned into a well-formed AIAnalysisResult. */
function normalize(raw: unknown, provider: string): AIAnalysisResult {
  const o = (raw ?? {}) as Record<string, unknown>;

  let confidence = Number(o.confidence);
  if (!Number.isFinite(confidence)) confidence = 50;
  confidence = Math.min(100, Math.max(0, Math.round(confidence)));

  const categories = Array.isArray(o.categories)
    ? o.categories.map((c) => String(c)).filter(Boolean)
    : [];

  let action = String(o.suggestedAction ?? "").toLowerCase();
  if (action !== "approve" && action !== "reject") action = "review";

  // `safe` may be absent — infer it from the action if so.
  const safe =
    typeof o.safe === "boolean" ? o.safe : action === "approve";

  return {
    safe,
    confidence,
    categories,
    reasoning: String(o.reasoning ?? "").trim(),
    suggestedAction: action as AIAnalysisResult["suggestedAction"],
    provider,
  };
}

async function analyzeWithOpenAI(
  text: string,
  apiKey: string,
): Promise<AIAnalysisResult> {
  const res = await fetchWithTimeout(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    },
    AI_TIMEOUT_MS,
  );

  if (!res.ok) {
    throw new Error(`OpenAI ${res.status}: ${await res.text().catch(() => "")}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI: empty response");

  return normalize(JSON.parse(content), "gpt-4o-mini");
}

async function analyzeWithAnthropic(
  text: string,
  apiKey: string,
): Promise<AIAnalysisResult> {
  const res = await fetchWithTimeout(
    "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-latest",
        max_tokens: 512,
        temperature: 0.1,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: text }],
      }),
    },
    AI_TIMEOUT_MS,
  );

  if (!res.ok) {
    throw new Error(
      `Anthropic ${res.status}: ${await res.text().catch(() => "")}`,
    );
  }

  const data = (await res.json()) as { content?: { text?: string }[] };
  const out = data.content?.[0]?.text ?? "";
  // Models sometimes wrap JSON in prose/code fences — extract the object.
  const match = out.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Anthropic: no JSON in response");

  return normalize(JSON.parse(match[0]), "claude-3-5-haiku");
}

/**
 * Run AI analysis on a piece of Icelandic text. Never throws — failures are
 * reported via the returned outcome so callers can fall back gracefully.
 */
export async function analyzeContentWithAI(
  text: string,
): Promise<AIModerationOutcome> {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return { status: "disabled" };

  const openAiKey = await getOpenAIKey();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim() || null;

  if (!openAiKey && !anthropicKey) return { status: "disabled" };

  try {
    const result = openAiKey
      ? await analyzeWithOpenAI(trimmed, openAiKey)
      : await analyzeWithAnthropic(trimmed, anthropicKey as string);
    return { status: "ok", result };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Óþekkt villa í AI greiningu";
    // eslint-disable-next-line no-console
    console.error("[aiModeration] analysis failed:", message);
    return { status: "error", message };
  }
}

// ---- Combined decision (heuristic + AI) ------------------------------------

export type ContentDecision = {
  status: "approved" | "pending" | "rejected";
  moderationReason: string | null;
  aiAnalysis: string; // JSON to store on the record
  ai: AIAnalysisResult | null;
  aiFailed: boolean;
};

/**
 * Combine the heuristic `ContentCheck` with an AI verdict into a final status.
 *
 * Modes (from the `ai_moderation_mode` setting):
 *  - `off`    → no AI; heuristic decides (clean → approved, else pending)
 *  - `manual` → AI analyses and can hold content for review, but NEVER
 *               auto-rejects; a human approves/rejects everything held
 *  - `auto`   → AI may auto-approve safe content and auto-reject clearly bad
 *               content (confidence > 80)
 *
 * Names in the text always force human review — clean means no names/PII/hate.
 */
export async function decideContentStatus(
  text: string,
  check: ContentCheck,
): Promise<ContentDecision> {
  const mode = await getSetting("ai_moderation_mode"); // manual | auto | off

  let status: ContentDecision["status"] = check.clean ? "approved" : "pending";
  let moderationReason: string | null = check.moderationReason || null;

  let ai: AIAnalysisResult | null = null;
  let aiFailed = false;

  if (mode !== "off") {
    const outcome = await analyzeContentWithAI(text);
    if (outcome.status === "ok") ai = outcome.result;
    else if (outcome.status === "error") aiFailed = true;
    // "disabled" → no key configured → keep heuristic-only decision

    if (ai) {
      if (mode === "auto") {
        if (ai.suggestedAction === "reject" && ai.confidence > 80) {
          status = "rejected";
          moderationReason = ai.reasoning || moderationReason;
        } else if (
          status === "approved" &&
          (!ai.safe || ai.suggestedAction !== "approve" || ai.confidence < 80)
        ) {
          status = "pending";
        }
      } else {
        // manual (and any legacy value): AI can hold, never auto-reject
        if (status === "approved" && (!ai.safe || ai.suggestedAction !== "approve")) {
          status = "pending";
          if (ai.reasoning) moderationReason = ai.reasoning;
        }
      }
    } else if (aiFailed && status === "approved") {
      // #9: AI was expected to run but failed → hold for manual review.
      status = "pending";
    }
  }

  const aiAnalysis = JSON.stringify({
    // Heuristic summary (kept for the existing admin moderation UI).
    names: check.names,
    kennitala: check.kennitala,
    phones: check.phones,
    hateWords: check.hateWords,
    reasons: check.reasons,
    // AI section (new).
    ai: ai
      ? {
          safe: ai.safe,
          confidence: ai.confidence,
          categories: ai.categories,
          reasoning: ai.reasoning,
          suggestedAction: ai.suggestedAction,
          provider: ai.provider,
        }
      : aiFailed
        ? {
            error: true,
            reasoning: "AI greining mistókst — handvirk yfirferð nauðsynleg",
          }
        : null,
  });

  return { status, moderationReason, aiAnalysis, ai, aiFailed };
}
