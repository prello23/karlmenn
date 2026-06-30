import { NextResponse } from "next/server";
import { z } from "zod";

import { adminGuard } from "@/lib/admin-api";
import { assessGender } from "@/lib/gender-assess";
import { getRegistrationSettings } from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(1, "Sláðu inn nafn").max(120),
  email: z.string().trim().email("Ógilt netfang"),
});

// POST /api/admin/settings/registration/test — score a name+email combination
export async function POST(req: Request) {
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

  const settings = await getRegistrationSettings();
  const result = await assessGender(parsed.data.name, parsed.data.email, settings.checks);
  const wouldAutoApprove =
    settings.autoApproveEnabled && result.scorePercent >= settings.threshold;

  return NextResponse.json({
    assessment: result.assessment,
    scorePercent: result.scorePercent,
    details: JSON.parse(result.details),
    threshold: settings.threshold,
    wouldAutoApprove,
  });
}
