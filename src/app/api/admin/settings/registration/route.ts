import { NextResponse } from "next/server";
import { z } from "zod";

import { adminGuard } from "@/lib/admin-api";
import { getRegistrationSettings, setDbSetting } from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

// GET /api/admin/settings/registration — current registration settings
export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;
  return NextResponse.json(await getRegistrationSettings());
}

const schema = z.object({
  autoApproveEnabled: z.boolean(),
  threshold: z.number().min(50).max(100),
  checks: z.object({
    name: z.boolean(),
    email: z.boolean(),
    online: z.boolean(),
  }),
  threadNameModeration: z.boolean(),
  hateSpeechKeywords: z.string().max(5000).optional(),
});

// PUT /api/admin/settings/registration — save settings
export async function PUT(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ógild gögn" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Ógild gögn" },
      { status: 400 },
    );
  }

  const d = parsed.data;
  await Promise.all([
    setDbSetting("auto_approve_enabled", String(d.autoApproveEnabled)),
    setDbSetting("auto_approve_threshold", String(Math.round(d.threshold))),
    setDbSetting("auto_approve_check_name", String(d.checks.name)),
    setDbSetting("auto_approve_check_email", String(d.checks.email)),
    setDbSetting("auto_approve_check_online", String(d.checks.online)),
    setDbSetting("thread_name_moderation", String(d.threadNameModeration)),
    setDbSetting("hate_speech_keywords", d.hateSpeechKeywords ?? ""),
  ]);

  return NextResponse.json({ ok: true });
}
