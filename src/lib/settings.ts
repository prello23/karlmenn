import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Editable site settings stored as key/value pairs. Defaults are used until an
 * admin overrides them in /admin/stillingar.
 */
export const SETTING_DEFAULTS = {
  verify_email_subject: "Staðfestu netfangið þitt hjá Ekki einn",
  verify_email_body: `Halló,

Þú ert að skrá þig á ekkieinn.is — samfélag og stuðningsvettvangur.

Smelltu á linkinn hér að neðan til að staðfesta netfangið þitt:

{{link}}

Ef þú skráðir þig ekki, hunsa þennan póst.

Kveðja,
Teymið hjá Ekki einn`,
  admin_notification_email: "info@ekkieinn.is",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;

export async function getSetting(key: SettingKey): Promise<string> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    if (row) return row.value;
  } catch {
    // fall through to default
  }
  return SETTING_DEFAULTS[key];
}

export async function getAllSettings(): Promise<Record<SettingKey, string>> {
  const result = { ...SETTING_DEFAULTS } as Record<SettingKey, string>;
  try {
    const rows = await prisma.setting.findMany();
    for (const row of rows) {
      if (row.key in result) result[row.key as SettingKey] = row.value;
    }
  } catch {
    // ignore — return defaults
  }
  return result;
}

export async function setSetting(key: SettingKey, value: string) {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}
