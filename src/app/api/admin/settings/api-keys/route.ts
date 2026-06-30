import { NextResponse } from "next/server";

import { adminGuard } from "@/lib/admin-api";
import { getOpenAIKey, maskSecret } from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

// GET /api/admin/settings/api-keys — list configured keys (masked)
export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;

  const openai = await getOpenAIKey();

  return NextResponse.json({
    keys: [
      {
        provider: "openai",
        label: "OpenAI API Lykill",
        configured: Boolean(openai),
        masked: maskSecret(openai),
      },
    ],
  });
}
