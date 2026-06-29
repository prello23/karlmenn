"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

const schema = z.object({
  displayName: z.string().trim().max(40).optional(),
  isAnonymous: z.coerce.boolean(),
});

export type ProfileState = { error?: string; success?: boolean } | undefined;

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();

  const parsed = schema.safeParse({
    displayName: formData.get("displayName") || undefined,
    isAnonymous: formData.get("isAnonymous") === "on",
  });
  if (!parsed.success) return { error: "Ógild gögn" };

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: parsed.data.displayName || null,
        isAnonymous: parsed.data.isAnonymous,
      },
    });
  } catch {
    return { error: "Ekki tókst að vista." };
  }

  revalidatePath("/stillingar");
  return { success: true };
}
