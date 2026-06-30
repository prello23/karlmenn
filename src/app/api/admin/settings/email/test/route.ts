import { NextResponse } from "next/server";
import { z } from "zod";

import { adminGuard } from "@/lib/admin-api";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const schema = z.object({ to: z.string().email("Ógilt netfang") });

// POST /api/admin/settings/email/test — send a test email
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
      { success: false, error: parsed.error.errors[0]?.message ?? "Ógilt netfang" },
      { status: 400 },
    );
  }

  try {
    await sendEmail({
      to: parsed.data.to,
      subject: "Prófunarpóstur frá EkkiEinn.is",
      text: "Prófunarpóstur frá EkkiEinn.is — Ef þú færð þennan póst virkar tölvupósturinn rétt!",
      html: "<p>Prófunarpóstur frá EkkiEinn.is — Ef þú færð þennan póst virkar tölvupósturinn rétt!</p>",
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Sending mistókst",
    });
  }
}
