import { NextResponse } from "next/server";
import { z } from "zod";

import { adminGuard } from "@/lib/admin-api";
import {
  getEmailConfig,
  getDbSetting,
  setDbSetting,
  maskSecret,
} from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

// GET /api/admin/settings/email — current email config (password masked)
export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;

  const cfg = await getEmailConfig();
  const dbHost = await getDbSetting("email_smtp_host");
  const usingSendmail = !dbHost && process.env.SMTP_USE_SENDMAIL === "true";

  return NextResponse.json({
    email_from: cfg.email_from,
    email_from_name: cfg.email_from_name,
    email_smtp_host: cfg.email_smtp_host,
    email_smtp_port: cfg.email_smtp_port,
    email_smtp_user: cfg.email_smtp_user,
    email_smtp_pass: maskSecret(cfg.email_smtp_pass),
    usingSendmail,
  });
}

const schema = z.object({
  email_from: z.string().trim().max(200).optional(),
  email_from_name: z.string().trim().max(200).optional(),
  email_smtp_host: z.string().trim().max(200).optional(),
  email_smtp_port: z.string().trim().max(10).optional(),
  email_smtp_user: z.string().trim().max(200).optional(),
  email_smtp_pass: z.string().max(400).optional(),
});

// PUT /api/admin/settings/email — save email settings to DB
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

  const data = parsed.data;
  // Persist every provided text field. The password is only overwritten when a
  // real value is supplied (a masked / empty value must not wipe the secret).
  const writes: Promise<void>[] = [];
  for (const key of [
    "email_from",
    "email_from_name",
    "email_smtp_host",
    "email_smtp_port",
    "email_smtp_user",
  ] as const) {
    if (data[key] !== undefined) writes.push(setDbSetting(key, data[key] ?? ""));
  }
  if (data.email_smtp_pass && !data.email_smtp_pass.startsWith("••••")) {
    writes.push(setDbSetting("email_smtp_pass", data.email_smtp_pass));
  }
  await Promise.all(writes);

  return NextResponse.json({ ok: true });
}
