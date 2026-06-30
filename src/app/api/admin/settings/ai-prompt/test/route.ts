import { NextResponse } from "next/server";
import { z } from "zod";

import { adminGuard } from "@/lib/admin-api";
import { getAiPrompt, getOpenAIKey } from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

const schema = z.object({ testInput: z.string().trim().min(1, "Sláðu inn texta").max(5000) });

// POST /api/admin/settings/ai-prompt/test — run the current prompt on test input
export async function POST(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Ógild gögn" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? "Ógild gögn" },
      { status: 400 },
    );
  }

  const key = await getOpenAIKey();
  if (!key) {
    return NextResponse.json({
      success: false,
      error: "Enginn OpenAI lykill stilltur. Bættu honum við undir 'API Lyklar'.",
    });
  }

  const { prompt } = await getAiPrompt();

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: parsed.data.testInput },
        ],
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({
        success: false,
        error: data?.error?.message ?? `Villa (${res.status})`,
      });
    }
    const response = data?.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ success: true, response });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Tenging mistókst",
    });
  }
}
