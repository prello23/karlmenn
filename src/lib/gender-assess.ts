import "server-only";

import { MALE_SET, FEMALE_SET } from "@/lib/icelandic-names";

/**
 * Gender assessment for registrants. EkkiEinn.is is a men's support community,
 * so this score assists admin approval (and the optional auto-approval path).
 *
 * Score model (0..100, where 100 = very likely male), per the moderation spec:
 *   - Name analysis     (weight 60%) — Icelandic name database
 *   - Email analysis     (weight 20%) — name extracted from the email local-part
 *   - Online lookup      (weight 20%) — genderize.io (free, no key, IS locale)
 * A disabled or inconclusive check contributes a neutral 50.
 */

export type GenderAssessment = "LIKELY_MALE" | "LIKELY_FEMALE" | "UNCERTAIN";

export type AssessChecks = { name: boolean; email: boolean; online: boolean };

export type AssessmentResult = {
  assessment: GenderAssessment;
  score: number; // 0..1, 1 = very likely male
  scorePercent: number; // 0..100
  details: string; // JSON string with breakdown + reasons
};

const DEFAULT_CHECKS: AssessChecks = { name: true, email: true, online: true };

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

/** Look at the email local-part for a recognisable first name. */
function emailScoreFor(email: string): { score: number; reason: string } {
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  const tokens = local.split(/[^a-záéíóúýþæöð]+/i).filter((t) => t.length >= 3);
  for (const t of tokens) {
    if (MALE_SET.has(t)) return { score: 100, reason: `Netfang inniheldur karlmannsnafn "${t}".` };
    if (FEMALE_SET.has(t)) return { score: 0, reason: `Netfang inniheldur kvenmannsnafn "${t}".` };
  }
  return { score: 50, reason: "Ekkert nafn greinanlegt í netfangi." };
}

type GenderizeResult = { score: number; reason: string } | null;

async function onlineScoreFor(token: string): Promise<GenderizeResult> {
  if (!token || token.length < 2) return null;
  try {
    const res = await fetch(
      `https://api.genderize.io/?name=${encodeURIComponent(token)}&country_id=IS`,
      { signal: AbortSignal.timeout(4000) },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const prob = typeof data?.probability === "number" ? data.probability : 0;
    if (data?.gender === "male")
      return { score: 50 + prob * 50, reason: `genderize.io: karl (${Math.round(prob * 100)}%).` };
    if (data?.gender === "female")
      return { score: 50 - prob * 50, reason: `genderize.io: kona (${Math.round(prob * 100)}%).` };
    return { score: 50, reason: "genderize.io: óvíst." };
  } catch {
    return null;
  }
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

  // Name (60%)
  const nameRes = checks.name ? nameScoreFor(token) : null;
  if (nameRes) reasons.push(nameRes.reason);
  const nameScore = nameRes?.score ?? null;

  // Email (20%)
  const emailRes = checks.email ? emailScoreFor(email) : null;
  if (emailRes) reasons.push(emailRes.reason);
  const emailScore = emailRes?.score ?? null;

  // Online (20%)
  const onlineRes = checks.online ? await onlineScoreFor(token) : null;
  if (onlineRes) reasons.push(onlineRes.reason);
  else if (checks.online) reasons.push("Netleit ekki tiltæk (hlutlaust).");
  const onlineScore = onlineRes?.score ?? null;

  // Weighted final — a skipped/inconclusive check counts as neutral 50.
  const finalScore =
    0.6 * (nameScore ?? 50) + 0.2 * (emailScore ?? 50) + 0.2 * (onlineScore ?? 50);
  const percent = Math.round(Math.max(0, Math.min(100, finalScore)));

  const details = JSON.stringify({
    breakdown: { nameScore, emailScore, onlineScore, finalScore: percent },
    reasons,
  });

  return {
    assessment: toAssessment(percent),
    score: percent / 100,
    scorePercent: percent,
    details,
  };
}
