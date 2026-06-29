"use server";

import { z } from "zod";

import { sendAdminNotification } from "@/lib/email";

const schema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().email("Ógilt netfang").max(120),
  message: z.string().trim().min(5, "Skrifaðu skilaboð").max(5000),
});

export type ContactState = { error?: string; success?: boolean } | undefined;

export async function sendContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = schema.safeParse({
    name: formData.get("name") || undefined,
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Ógild gögn" };
  }

  const { name, email, message } = parsed.data;
  await sendAdminNotification(
    `Ný skilaboð frá ${name ?? email}`,
    `Frá: ${name ?? "—"} <${email}>\n\n${message}`,
  );

  return { success: true };
}
