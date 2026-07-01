import "server-only";

import {
  MALE_SET,
  FEMALE_SET,
  MALE_SET_ASCII,
  FEMALE_SET_ASCII,
  MALE_NAME_BY_KEY,
  FEMALE_NAME_BY_KEY,
  foldToAscii,
} from "@/lib/icelandic-names";

/**
 * Gender assessment for registrants. EkkiEinn.is is a men's support community,
 * so this score assists admin approval (and the optional auto-approval path).
 *
 * Score model (0..100, where 100 = very likely male):
 *   - Name analysis  (weight 50%) — entered name vs Icelandic name database
 *   - Email analysis (weight 50%) — name extracted from the email local-part,
 *                                   looked up in the Icelandic name database
 *                                   (ASCII-folded, e.g. johanna → Jóhanna)
 * A disabled or inconclusive check contributes a neutral 50.
 */

export type GenderAssessment = "LIKELY_MALE" | "LIKELY_FEMALE" | "UNCERTAIN";

export type AssessChecks = { name: boolean; email: boolean };

export type AssessmentResult = {
  assessment: GenderAssessment;
  score: number; // 0..1, 1 = very likely male
  scorePercent: number; // 0..100
  details: string; // JSON string with breakdown + reasons
};

const DEFAULT_CHECKS: AssessChecks = { name: true, email: true };

function firstToken(name: string): string {
  return name.trim().toLowerCase().split(/\s+/)[0] ?? "";
}

/** 100 = male name, 0 = female name, 50 = unknown/neutral. */
function nameScoreFor(token: string): { score: number; reason: string } {
  if (!token) return { score: 50, reason: "Ekkert nafn til greiningar." };
  if (MALE_SET.has(token))
    return { score: 100, reason: `"${token}" er þekkt karlmannsnafn.` };
  if (FEMALE_SET.has(token))
    return { score: 0, reason: `"${token}" er þekkt kvenmannsnafn.` };
  return { score: 50, reason: `"${token}" fannst ekki í nafnaskrá (óvíst).` };
}

/**
 * Look at the email local-part for a recognisable first name against the
 * Icelandic name database. Handles numbers (johanna123 → johanna), dot/
 * underscore separators (jon.gunnar → jon, gunnar) and accent-free spellings
 * (johanna → Jóhanna, gudrun → Guðrún) via the ASCII-folded name sets.
 * A FEMALE name scores 0, a MALE name scores 100, otherwise a neutral 50.
 */
function emailScoreFor(email: string): { score: number; reason: string } {
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  // Split on anything that is not an Icelandic/Latin letter (drops digits,
  // dots, underscores, plus-tags, etc.), keeping segments of length >= 3.
  const tokens = local.split(/[^a-záéíóúýþæöð]+/i).filter((t) => t.length >= 3);
  for (const t of tokens) {
    const ascii = foldToAscii(t);
    if (MALE_SET.has(t) || MALE_SET_ASCII.has(ascii)) {
      const proper = MALE_NAME_BY_KEY.get(t) ?? MALE_NAME_BY_KEY.get(ascii) ?? t;
      return { score: 100, reason: `Netfang: "${t}" → ${proper} (karlmannsnafn).` };
    }
    if (FEMALE_SET.has(t) || FEMALE_SET_ASCII.has(ascii)) {
      const proper =
        FEMALE_NAME_BY_KEY.get(t) ?? FEMALE_NAME_BY_KEY.get(ascii) ?? t;
      return { score: 0, reason: `Netfang: "${t}" → ${proper} (kvenmannsnafn).` };
    }
  }
  return { score: 50, reason: "Ekkert nafn greinanlegt í netfangi." };
}

function toAssessment(percent: number): GenderAssessment {
  if (percent >= 60) return "LIKELY_MALE";
  if (percent <= 40) return "LIKELY_FEMALE";
  return "UNCERTAIN";
}

export async function assessGender(
  name: string,
  email: string,
  checks: AssessChecks = DEFAULT_CHECKS,
): Promise<AssessmentResult> {
  const token = firstToken(name);
  const reasons: string[] = [];

  // Name (50%)
  const nameRes = checks.name ? nameScoreFor(token) : null;
  if (nameRes) reasons.push(nameRes.reason);
  const nameScore = nameRes?.score ?? null;

  // Email (50%)
  const emailRes = checks.email ? emailScoreFor(email) : null;
  if (emailRes) reasons.push(emailRes.reason);
  const emailScore = emailRes?.score ?? null;

  // Weighted final — a skipped/inconclusive check counts as neutral 50.
  const finalScore = 0.5 * (nameScore ?? 50) + 0.5 * (emailScore ?? 50);
  const percent = Math.round(Math.max(0, Math.min(100, finalScore)));

  const details = JSON.stringify({
    breakdown: { nameScore, emailScore, finalScore: percent },
    reasons,
  });

  return {
    assessment: toAssessment(percent),
    score: percent / 100,
    scorePercent: percent,
    details,
  };
}
