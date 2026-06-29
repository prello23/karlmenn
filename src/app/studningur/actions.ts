"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";

const schema = z.object({
  type: z.enum(["LEGAL", "PSYCH"]),
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().email("Ógilt netfang").max(120).optional().or(z.literal("")),
  description: z
    .string()
    .trim()
    .min(10, "Lýstu stöðunni í a.m.k. 10 stöfum")
    .max(5000),
});

export type SupportState = { error?: string; success?: boolean } | undefined;

export async function submitSupportRequest(
  _prev: SupportState,
  formData: FormData,
): Promise<SupportState> {
  const parsed = schema.safeParse({
    type: formData.get("type"),
    name: formData.get("name") || undefined,
    email: formData.get("email") || "",
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Ógild gögn" };
  }

  try {
    await prisma.supportRequest.create({
      data: {
        type: parsed.data.type,
        name: parsed.data.name || null,
        email: parsed.data.email || null,
        description: parsed.data.description,
      },
    });
  } catch {
    return {
      error:
        "Ekki tókst að senda beiðnina. Reyndu aftur eða sendu okkur tölvupóst.",
    };
  }

  return { success: true };
}
