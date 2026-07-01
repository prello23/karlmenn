import "server-only";

import { detectNames, buildSuggestion } from "@/lib/name-detection";
import { getDbSetting } from "@/lib/admin-settings";

/**
 * Server-side content moderation for forum threads. Combines:
 *  - Icelandic name detection (declension-aware)
 *  - Personal info: kennitala (national id), phone numbers
 *  - Hate-speech keywords (admin-configurable list)
 *
 * If anything is flagged, the thread is held as `pending`. A redacted
 * "[Nafn]" suggestion is offered to the poster.
 */

export type ContentCheck = {
  clean: boolean;
  names: string[]; // detected name surface forms
  baseNames: string[]; // distinct base names (e.g. "Jóhanna")
  kennitala: string[];
  phones: string[];
  hateWords: string[];
  reasons: string[]; // human-readable Icelandic summary
  moderationReason: string; // short reason string stored on the thread
  suggestion: string; // text with names replaced by [AAA]/[BBB]
  nameMap: Record<string, string>; // { "AAA": "Jóhanna", ... }
};

const DEFAULT_HATE_WORDS = [
  // A conservative seed list; admins extend it in /admin/settings.
  "helvítis",
  "fáviti",
  "fávitar",
  "aumingi",
  "hóra",
  "tík",
  "drullusokkur",
];

// kennitala: 6 digits + optional dash/space + 4 digits (e.g. 120190-1234)
const KENNITALA_RE = /\b\d{6}[-\s]?\d{4}\b/g;
// Icelandic phone numbers: 7 digits, optionally grouped (e.g. 555 1234, 5551234, +354 555 1234)
const PHONE_RE = /(?:\+354[-\s]?)?\b\d{3}[-\s]?\d{4}\b/g;

async function getHateWords(): Promise<string[]> {
  const raw = await getDbSetting("hate_speech_keywords");
  if (raw && raw.trim()) {
    return raw
      .split(/[\n,]+/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length >= 2);
  }
  return DEFAULT_HATE_WORDS;
}

export async function checkContent(text: string): Promise<ContentCheck> {
  const reasons: string[] = [];

  // Names (+ [AAA] suggestion & placeholder map)
  const detected = detectNames(text);
  const names = Array.from(new Set(detected.map((d) => d.original)));
  const baseNames = Array.from(new Set(detected.map((d) => d.base)));
  const { suggestedText, nameMap } = buildSuggestion(text);
  if (baseNames.length)
    reasons.push(`Nafn fannst í texta: ${baseNames.join(", ")}`);

  // Kennitala
  const kennitala = Array.from(new Set(text.match(KENNITALA_RE) ?? []));
  if (kennitala.length) reasons.push("Möguleg kennitala fannst.");

  // Phone numbers (avoid double-counting kennitala matches)
  const phones = Array.from(new Set(text.match(PHONE_RE) ?? [])).filter(
    (p) => !kennitala.some((k) => k.includes(p.replace(/\D/g, ""))),
  );
  if (phones.length) reasons.push("Mögulegt símanúmer fannst.");

  // Hate speech
  const hateList = await getHateWords();
  const lower = text.toLowerCase();
  const hateWords = hateList.filter((w) =>
    new RegExp(`(?<![\\p{L}])${escapeRegExp(w)}(?![\\p{L}])`, "u").test(lower),
  );
  if (hateWords.length) reasons.push("Mögulegt niðrandi orðalag fannst.");

  const clean =
    names.length === 0 &&
    kennitala.length === 0 &&
    phones.length === 0 &&
    hateWords.length === 0;

  return {
    clean,
    names,
    baseNames,
    kennitala,
    phones,
    hateWords,
    reasons,
    moderationReason: reasons.join(" · "),
    suggestion: suggestedText,
    nameMap,
  };
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
