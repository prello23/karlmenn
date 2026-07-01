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
    if (isCapitalized(word)) {
      base = FORM_MAP.get(lw);
    } else if (VERY_COMMON_FORM_SET.has(lw)) {
      base = FORM_MAP.get(lw);
    }

    if (base && !seen.has(lw)) {
      seen.add(lw);
      result.push({ original: word, base });
    }
  }

  return result;
}

/** Convenience: just the surface forms found (e.g. ["Jóhönnu", "Gunnari"]). */
export function detectNameStrings(text: string): string[] {
  return detectNames(text).map((d) => d.original);
}

export function hasNames(text: string): boolean {
  return detectNames(text).length > 0;
}

/**
 * Replace every detected name surface-form with the placeholder `[Nafn]`,
 * preserving the rest of the text. Used to build the poster's "Tillaga".
 */
export function redactNames(text: string, placeholder = "[Nafn]"): string {
  const detected = detectNames(text);
  if (detected.length === 0) return text;
  // Replace longer forms first to avoid partial overlaps.
  const forms = Array.from(new Set(detected.map((d) => d.original))).sort(
    (a, b) => b.length - a.length,
  );
  let out = text;
  for (const form of forms) {
    // Word-boundary-ish replace that respects Icelandic letters.
    const re = new RegExp(`(?<![\\p{L}])${escapeRegExp(form)}(?![\\p{L}])`, "gu");
    out = out.replace(re, placeholder);
  }
  return out;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
