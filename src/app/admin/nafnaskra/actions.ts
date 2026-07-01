"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function addPerpetrator(formData: FormData) {
  const admin = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return;
  try {
    await prisma.perpetratorRegistry.create({
      data: { name, addedBy: admin.email ?? null },
    });
    console.log(`[admin] registry add "${name}" by ${admin.email}`);
  } catch {
    // unique constraint — already in the registry
  }
  revalidatePath("/admin/nafnaskra");
}

export async function removePerpetrator(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await prisma.perpetratorRegistry.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/nafnaskra");
}
