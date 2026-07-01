/**
 * Icelandic name detection for forum content moderation.
 *
 * Goal: catch real person names — including common declined (case-inflected)
 * forms — so threads containing identifiable names can be held for review
 * before publication. Tuned to be SENSITIVE (prefer false positives over
 * misses), per the moderation spec.
 */

import {
  MALE_NAMES,
  FEMALE_NAMES,
  COMMON_WORD_EXCEPTIONS,
  VERY_COMMON_NAMES,
} from "@/lib/icelandic-names";

export type DetectedName = { original: string; base: string };

/** Replace the LAST `a`/`A` in a stem with `ö`/`Ö` (u-umlaut, e.g. Ann→Önn). */
function applyUUmlaut(stem: string): string {
  const idx = stem.toLowerCase().lastIndexOf("a");
  if (idx < 0) return stem;
  const ch = stem[idx];
  const isUpper = ch === ch.toUpperCase() && ch !== ch.toLowerCase();
  return stem.slice(0, idx) + (isUpper ? "Ö" : "ö") + stem.slice(idx + 1);
}

/**
 * Generate likely declined forms (nominative/accusative/dative/genitive) of a
 * name. Approximate Icelandic rules — broad on purpose.
 */
export function getNameForms(name: string, gender: "male" | "female"): string[] {
  const forms = new Set<string>([name]);
  const add = (f: string) => f && f.length > 1 && forms.add(f);

  if (gender === "female") {
    if (name.endsWith("a")) {
      const stem = name.slice(0, -1);
      add(stem + "u"); // Lára → Láru, Sara → Saru
      add(applyUUmlaut(stem) + "u"); // Anna → Önnu, Jóhanna → Jóhönnu, Klara → Klöru
    }
    if (name.endsWith("ún")) {
      add(name + "u"); // Guðrún → Guðrúnu
      add(name + "ar"); // Guðrún → Guðrúnar
    }
    if (name.endsWith("ur")) {
      // -heiður / -gerður / -fríður → gen -ar
      add(name.slice(0, -2) + "ar");
    }
    if (
      name.endsWith("dís") ||
      name.endsWith("björg") ||
      name.endsWith("laug") ||
      name.endsWith("hildur") ||
      name.endsWith("ey")
    ) {
      add(name + "ar");
      add(name + "u");
    }
  } else {
    if (name.endsWith("ur")) {
      const stem = name.slice(0, -2);
      add(stem); // Sigurður → Sigurð (acc)
      add(stem + "i"); // → Sigurði (dat)
      add(stem + "ar"); // → Sigurðar (gen)
      add(stem + "s"); // → Sigurðs
    } else if (name.endsWith("ll")) {
      const stem = name.slice(0, -1);
      add(stem + "i"); // Páll → Páli
      add(stem + "s"); // Páll → Páls
    } else if (name.endsWith("i")) {
      const stem = name.slice(0, -1);
      add(stem + "a"); // Helgi → Helga, Bragi → Braga
    } else {
      // Consonant-final (Jón, Gunnar, Einar, Þór, ...): -i dat, -s gen, -ar gen.
      add(name + "i");
      add(name + "s");
      add(name + "ar");
    }
  }

  return Array.from(forms);
}

// ---- Precomputed lookup tables (built once) --------------------------------

const FORM_MAP = new Map<string, string>(); // form (lowercased) -> base name
const VERY_COMMON_FORM_SET = new Set<string>(); // lowercased forms of top names

function registerName(name: string, gender: "male" | "female") {
  const base = name.trim();
  if (base.length < 2) return;
  for (const form of getNameForms(base, gender)) {
    const key = form.toLowerCase();
    if (!FORM_MAP.has(key)) FORM_MAP.set(key, base);
    if (VERY_COMMON_NAMES.has(base.toLowerCase())) VERY_COMMON_FORM_SET.add(key);
  }
}

for (const n of MALE_NAMES) registerName(n, "male");
for (const n of FEMALE_NAMES) registerName(n, "female");

// ---- Public API ------------------------------------------------------------

function isCapitalized(word: string): boolean {
  const c = word[0];
  return c !== c.toLowerCase() && c === c.toUpperCase();
}

/**
 * Scan text and return detected person-name occurrences (deduped by the
 * surface form). Capitalised words are matched against all known name forms;
 * lowercase words are only matched against the very-common-name forms (to
 * catch users lowercasing a name to evade moderation).
 */
export function detectNames(text: string): DetectedName[] {
  if (!text) return [];
  const words = text.match(/[\p{L}]+/gu) ?? [];
  const seen = new Set<string>();
  const result: DetectedName[] = [];

  for (const word of words) {
    const lw = word.toLowerCase();
    if (lw.length < 2) continue;
    if (COMMON_WORD_EXCEPTIONS.has(lw)) continue;

    let base: string | undefined;
    let surface = word; // the actual name-form found (may be a prefix)

    if (FORM_MAP.has(lw) && (isCapitalized(word) || VERY_COMMON_FORM_SET.has(lw))) {
      base = FORM_MAP.get(lw);
    } else if (isCapitalized(word) && lw.length > 4) {
      // Compound / glued token (e.g. "Jóhönnubyrjaði" → "Jóhönnu"). Try the
      // longest known name-form that the token STARTS with (min 4 chars).
      for (let k = lw.length - 1; k >= 4; k--) {
        const b = FORM_MAP.get(lw.slice(0, k));
        if (b) {
          base = b;
          surface = word.slice(0, k);
          break;
        }
      }
    }

    if (base && !seen.has(surface.toLowerCase())) {
      seen.add(surface.toLowerCase());
      result.push({ original: surface, base });
    }
  }

  return result;
}

// ---- Placeholder redaction ([AAA], [BBB], ...) -----------------------------

function placeholderFor(index: number): string {
  // 0 -> AAA, 1 -> BBB, ...
  return String.fromCharCode(65 + (index % 26)).repeat(3);
}

export type Suggestion = {
  suggestedText: string;
  nameMap: Record<string, string>; // { "AAA": "Jóhanna", ... }
  hasNames: boolean;
};

/**
 * Replace every detected name (all declension/compound forms of the same base
 * name) with a stable placeholder: first base → [AAA], second → [BBB], etc.
 * Returns the cleaned text plus the placeholder→base map.
 */
export function buildSuggestion(text: string): Suggestion {
  const detected = detectNames(text);
  if (detected.length === 0) {
    return { suggestedText: text, nameMap: {}, hasNames: false };
  }

  // Assign one placeholder letter per distinct base name.
  const baseToPlaceholder = new Map<string, string>();
  for (const d of detected) {
    if (!baseToPlaceholder.has(d.base)) {
      baseToPlaceholder.set(d.base, placeholderFor(baseToPlaceholder.size));
    }
  }

  // Replace longer surface-forms first to avoid partial overlaps. No trailing
  // boundary so glued compounds ("Jóhönnubyrjaði") lose only the name part.
  const forms = Array.from(new Set(detected.map((d) => d.original))).sort(
    (a, b) => b.length - a.length,
  );
  const formToBase = new Map<string, string>();
  for (const d of detected) formToBase.set(d.original, d.base);

  let out = text;
  for (const form of forms) {
    const letters = baseToPlaceholder.get(formToBase.get(form)!)!;
    const re = new RegExp(`(?<![\\p{L}])${escapeRegExp(form)}`, "giu");
    out = out.replace(re, `[${letters}]`);
  }

  const nameMap: Record<string, string> = {};
  for (const [b, letters] of baseToPlaceholder) nameMap[letters] = b;

  return { suggestedText: out, nameMap, hasNames: true };
}

/** Convenience: just the surface forms found (e.g. ["Jóhönnu", "Gunnari"]). */
export function detectNameStrings(text: string): string[] {
  return detectNames(text).map((d) => d.original);
}

export function hasNames(text: string): boolean {
  return detectNames(text).length > 0;
}

/** Cleaned text with names replaced by [AAA]/[BBB] (see buildSuggestion). */
export function redactNames(text: string): string {
  return buildSuggestion(text).suggestedText;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
