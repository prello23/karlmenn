import { NextResponse } from "next/server";

import { adminGuard } from "@/lib/admin-api";
import { getOpenAIKey } from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

// POST /api/admin/settings/api-keys/:provider/test — verify the key works
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const denied = await adminGuard();
  if (denied) return denied;

  const { provider } = await params;
  if (provider !== "openai") {
    return NextResponse.json(
      { success: false, error: "Óþekkt þjónusta" },
      { status: 404 },
    );
  }

  const key = await getOpenAIKey();
  if (!key) {
    return NextResponse.json({ success: false, error: "Enginn lykill stilltur" });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 5,
        messages: [{ role: "user", content: "Segðu 'hæ' og ekkert annað." }],
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        error: data?.error?.message ?? `Villa (${res.status})`,
      });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Tenging mistókst",
    });
  }
}
