import "server-only";

/**
 * Name anonymization for forum content.
 *
 * Strategy:
 *  - If ANTHROPIC_API_KEY or OPENAI_API_KEY is set, an LLM finds person names
 *    and we replace them with ordered placeholders ([AAA], [BBB], ...).
 *  - Otherwise a built-in Icelandic-aware heuristic is used so the feature
 *    still works (degraded) without an API key.
 *
 * The ORIGINAL text with names is never persisted by callers — only the
 * anonymized output is stored.
 */

export type AnonymizeResult = {
  anonymized: string;
  namesFound: string[];
  replacements: Record<string, string>;
};

export type NameCheckResult = {
  hasNames: boolean;
  confidence: number;
};

const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
const OPENAI_MODEL = "gpt-4o-mini";

function placeholder(index: number): string {
  // 0 -> AAA, 1 -> BBB, ...
  const letter = String.fromCharCode(65 + (index % 26));
  return `[${letter.repeat(3)}]`;
}

/** Build the anonymized string + maps from a list of detected names. */
function applyReplacements(text: string, names: string[]): AnonymizeResult {
  const unique = Array.from(
    new Set(names.map((n) => n.trim()).filter((n) => n.length > 1)),
  );
  // Replace longer names first to avoid partial overlaps.
  unique.sort((a, b) => b.length - a.length);

  const replacements: Record<string, string> = {};
  let anonymized = text;
  unique.forEach((name, i) => {
    const token = placeholder(i);
    replacements[name] = token;
    const pattern = new RegExp(escapeRegExp(name), "g");
    anonymized = anonymized.replace(pattern, token);
  });

  return { anonymized, namesFound: unique, replacements };
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---- LLM providers ---------------------------------------------------------

const PROMPT = `Þú ert nafnleyndarþjónusta. Finndu ÖLL mannanöfn (fornöfn, eftirnöfn, gælunöfn — íslensk og erlend) í eftirfarandi texta. Ekki telja staðarnöfn, fyrirtæki eða stofnanir með. Skilaðu EINGÖNGU JSON á forminu {"names": ["Nafn1", "Nafn2"]}. Ef engin nöfn finnast skilaðu {"names": []}.`;

async function anthropicFindNames(text: string): Promise<string[] | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        system: PROMPT,
        messages: [{ role: "user", content: text }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.content?.[0]?.text ?? "";
    return parseNames(content);
  } catch {
    return null;
  }
}

async function openaiFindNames(text: string): Promise<string[] | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: PROMPT },
          { role: "user", content: text },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    return parseNames(content);
  } catch {
    return null;
  }
}

function parseNames(raw: string): string[] {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    const json = JSON.parse(match ? match[0] : raw);
    if (Array.isArray(json?.names)) {
      return json.names.filter((n: unknown): n is string => typeof n === "string");
    }
  } catch {
    // ignore
  }
  return [];
}

// ---- Heuristic fallback ----------------------------------------------------

// Common Icelandic capitalized words that are NOT person names.
const STOPWORDS = new Set(
  [
    "Ég","Þú","Hann","Hún","Það","Við","Þið","Þeir","Þær","Þetta","Þessi","Þar",
    "Þá","Þegar","Svo","En","Og","Eða","Ef","Að","Á","Í","Úr","Til","Frá","Með",
    "Eftir","Áður","Núna","Nú","Já","Nei","Ekki","Mér","Mig","Minn","Sem","Var",
    "Eru","Er","Hef","Hafði","Þetta","Reykjavík","Ísland","Íslandi","Íslands",
    "Janúar","Febrúar","Mars","Apríl","Maí","Júní","Júlí","Ágúst","September",
    "Október","Nóvember","Desember","Mánudag","Þriðjudag","Miðvikudag",
    "Fimmtudag","Föstudag","Laugardag","Sunnudag","Guð","Internet",
  ],
);

/**
 * Detects capitalized word sequences that look like names. Conservative: only
 * treats a capitalized word as a name candidate when it is not a known
 * stopword. Sequences of consecutive capitalized words are grouped (full
 * names). This favours protecting privacy over perfect readability.
 */
function heuristicFindNames(text: string): string[] {
  const names: string[] = [];
  // Match runs of capitalized (incl. Icelandic) words.
  const re =
    /\b([A-ZÁÉÍÓÚÝÞÆÖÐ][a-záéíóúýþæöð]+(?:\s+[A-ZÁÉÍÓÚÝÞÆÖÐ][a-záéíóúýþæöð]+){0,2})\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const phrase = m[1];
    const words = phrase.split(/\s+/);
    // Drop leading stopwords (e.g. sentence-initial "Þegar Jón ...").
    while (words.length && STOPWORDS.has(words[0])) words.shift();
    if (!words.length) continue;
    // A single remaining word that is a stopword is ignored.
    if (words.length === 1 && STOPWORDS.has(words[0])) continue;
    const candidate = words.join(" ");
    if (candidate.length > 1) names.push(candidate);
  }
  return names;
}

// ---- Public API ------------------------------------------------------------

export async function anonymizeText(text: string): Promise<AnonymizeResult> {
  const llmNames =
    (await anthropicFindNames(text)) ?? (await openaiFindNames(text));
  const names = llmNames ?? heuristicFindNames(text);
  return applyReplacements(text, names);
}

export async function checkForNames(text: string): Promise<NameCheckResult> {
  const llmNames =
    (await anthropicFindNames(text)) ?? (await openaiFindNames(text));
  if (llmNames) {
    return { hasNames: llmNames.length > 0, confidence: 0.9 };
  }
  const names = heuristicFindNames(text);
  return { hasNames: names.length > 0, confidence: names.length > 0 ? 0.5 : 0.6 };
}

export type NameSuggestion = {
  original: string;
  replacement: string;
  context: string;
};

export type NameDetection = {
  has_names: boolean;
  names_found: NameSuggestion[];
  redacted: string;
};

function contextSnippet(text: string, name: string): string {
  const i = text.indexOf(name);
  if (i < 0) return "";
  const start = Math.max(0, i - 30);
  const end = Math.min(text.length, i + name.length + 30);
  return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
}

/**
 * Detects person names and returns structured suggestions for manual admin
 * moderation (does not modify anything). Uses the same provider/heuristic
 * pipeline as anonymizeText.
 */
export async function detectNames(text: string): Promise<NameDetection> {
  const { anonymized, namesFound, replacements } = await anonymizeText(text);
  const names_found = namesFound.map((n) => ({
    original: n,
    replacement: replacements[n] ?? "[XXX]",
    context: contextSnippet(text, n),
  }));
  return { has_names: names_found.length > 0, names_found, redacted: anonymized };
}
