import { NextResponse } from "next/server";
import { z } from "zod";

import { adminGuard } from "@/lib/admin-api";
import { setDbSetting, deleteDbSetting } from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

const KEY_BY_PROVIDER: Record<string, string> = {
  openai: "openai_api_key",
};

const schema = z.object({ key: z.string().max(400) });

// PUT /api/admin/settings/api-keys/:provider — save (or clear) an API key
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const denied = await adminGuard();
  if (denied) return denied;

  const { provider } = await params;
  const settingKey = KEY_BY_PROVIDER[provider];
  if (!settingKey) {
    return NextResponse.json({ error: "Óþekkt þjónusta" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ógild gögn" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ógild gögn" }, { status: 400 });
  }

  const value = parsed.data.key.trim();
  // Ignore a masked value coming back unchanged from the UI.
  if (value.startsWith("••••")) {
    return NextResponse.json({ ok: true, unchanged: true });
  }

  if (value === "") {
    await deleteDbSetting(settingKey);
  } else {
    await setDbSetting(settingKey, value);
  }

  return NextResponse.json({ ok: true });
}
