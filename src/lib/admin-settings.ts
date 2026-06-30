import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * V2 admin settings (email, API keys, AI prompt) stored as raw key/value rows
 * in the existing `Setting` table. These are intentionally kept separate from
 * the typed site settings in `@/lib/settings` so the two surfaces don't
 * interfere. Values stored here:
 *   email_from, email_from_name, email_smtp_host, email_smtp_port,
 *   email_smtp_user, email_smtp_pass, openai_api_key, ai_system_prompt
 *
 * Reads always prefer the DB value, falling back to environment variables.
 */

export const DEFAULT_AI_PROMPT = `Þú ert efnisstjóri (content moderator) fyrir EkkiEinn.is — samfélagsvettvang fyrir karla sem hafa orðið fyrir ofbeldi, rangsæri eða vilja breyta hegðun sinni.

Þitt hlutverk:
1. Greina hvort texti innihaldi persónuauðkenni (nöfn, kennitölur, símanúmer, netföng)
2. Greina hvort texti sé óviðeigandi (hótanir, haturstal, ruslpóstur)
3. Svara á íslensku

Svaraðu með JSON:
{
  "containsPII": true/false,
  "isInappropriate": true/false,
  "reason": "Stuttur skýring ef eitthvað fannst",
  "detectedItems": ["listi af fundnum atriðum"]
}`;

export async function getDbSetting(key: string): Promise<string | null> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}

export async function setDbSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function deleteDbSetting(key: string): Promise<void> {
  try {
    await prisma.setting.delete({ where: { key } });
  } catch {
    // already absent — fine
  }
}

export type EmailConfig = {
  email_from: string;
  email_from_name: string;
  email_smtp_host: string;
  email_smtp_port: string;
  email_smtp_user: string;
  email_smtp_pass: string;
};

/** Resolved email config: DB overrides first, then `.env`, then defaults. */
export async function getEmailConfig(): Promise<EmailConfig> {
  let db: Record<string, string> = {};
  try {
    const rows = await prisma.setting.findMany({
      where: { key: { startsWith: "email_" } },
    });
    db = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    db = {};
  }

  return {
    email_from: db.email_from || process.env.MAIL_FROM || "info@ekkieinn.is",
    email_from_name: db.email_from_name || process.env.MAIL_FROM_NAME || "EkkiEinn.is",
    email_smtp_host: db.email_smtp_host || process.env.SMTP_HOST || "",
    email_smtp_port: db.email_smtp_port || process.env.SMTP_PORT || "25",
    email_smtp_user: db.email_smtp_user || process.env.SMTP_USER || "",
    email_smtp_pass: db.email_smtp_pass || process.env.SMTP_PASS || "",
  };
}

/** OpenAI API key: DB override first, then `.env`. */
export async function getOpenAIKey(): Promise<string | null> {
  return (await getDbSetting("openai_api_key")) || process.env.OPENAI_API_KEY || null;
}

export async function getAiPrompt(): Promise<{ prompt: string; isDefault: boolean }> {
  const stored = await getDbSetting("ai_system_prompt");
  return stored
    ? { prompt: stored, isDefault: false }
    : { prompt: DEFAULT_AI_PROMPT, isDefault: true };
}

/** Masks a secret for display: shows the last few chars only. */
export function maskSecret(value: string | null | undefined): string {
  if (!value) return "";
  if (value.length <= 4) return "••••";
  return "••••••••••••" + value.slice(-4);
}
