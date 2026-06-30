import { NextResponse } from "next/server";
import { z } from "zod";

import { adminGuard } from "@/lib/admin-api";
import {
  getAiPrompt,
  setDbSetting,
  deleteDbSetting,
  DEFAULT_AI_PROMPT,
} from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

// GET /api/admin/settings/ai-prompt — { prompt, isDefault, default }
export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;

  const { prompt, isDefault } = await getAiPrompt();
  return NextResponse.json({ prompt, isDefault, default: DEFAULT_AI_PROMPT });
}

const schema = z.object({ prompt: z.string().trim().min(1, "Prompt vantar").max(10000) });

// PUT /api/admin/settings/ai-prompt — save custom prompt
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

  await setDbSetting("ai_system_prompt", parsed.data.prompt);
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/settings/ai-prompt — reset to default
export async function DELETE() {
  const denied = await adminGuard();
  if (denied) return denied;

  await deleteDbSetting("ai_system_prompt");
  return NextResponse.json({ ok: true, prompt: DEFAULT_AI_PROMPT });
}
