"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { setSetting } from "@/lib/settings";

// ---- Threads ---------------------------------------------------------------

export async function deleteThread(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.thread.delete({ where: { id } });
  revalidatePath("/admin/threads");
  redirect("/admin/threads");
}

export async function toggleThreadFlag(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const field = String(formData.get("field")); // "isPinned" | "isLocked"
  const thread = await prisma.thread.findUnique({ where: { id } });
  if (!thread) return;
  if (field === "isPinned") {
    await prisma.thread.update({
      where: { id },
      data: { isPinned: !thread.isPinned },
    });
  } else if (field === "isLocked") {
    await prisma.thread.update({
      where: { id },
      data: { isLocked: !thread.isLocked },
    });
  }
  revalidatePath(`/admin/threads/${id}`);
}

export async function deleteReply(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const threadId = String(formData.get("threadId"));
  await prisma.reply.delete({ where: { id } });
  revalidatePath(`/admin/threads/${threadId}`);
}

export async function clearReplyFlag(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const threadId = String(formData.get("threadId"));
  await prisma.reply.update({
    where: { id },
    data: { flagged: false, flagReason: null },
  });
  revalidatePath(`/admin/threads/${threadId}`);
}

// ---- Users -----------------------------------------------------------------

const roleSchema = z.enum(["USER", "MODERATOR", "ADMIN"]);

export async function updateUserRole(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const role = roleSchema.parse(formData.get("role"));
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/notendur");
}

export async function deleteUser(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  if (id === admin.id) return; // never delete yourself
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/notendur");
}

// ---- Categories ------------------------------------------------------------

const categorySchema = z.object({
  name: z.string().trim().min(1, "Nafn vantar").max(80),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slóð má aðeins innihalda a-z, 0-9 og bandstrik"),
  description: z.string().trim().max(300).optional(),
  icon: z.string().trim().max(8).optional(),
  restricted: z.coerce.boolean(),
});

export type CategoryState = { error?: string } | undefined;

export async function createCategory(
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    icon: formData.get("icon") || undefined,
    restricted: formData.get("restricted") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Ógild gögn" };
  }
  try {
    const count = await prisma.category.count();
    await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description ?? "",
        icon: parsed.data.icon || "💬",
        restricted: parsed.data.restricted,
        order: count,
      },
    });
  } catch {
    return { error: "Slóð er líklega þegar í notkun." };
  }
  revalidatePath("/admin/flokkar");
  return undefined;
}

export async function updateCategory(
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  await requireAdmin();
  const id = String(formData.get("id"));
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    icon: formData.get("icon") || undefined,
    restricted: formData.get("restricted") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Ógild gögn" };
  }
  try {
    await prisma.category.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description ?? "",
        icon: parsed.data.icon || "💬",
        restricted: parsed.data.restricted,
      },
    });
  } catch {
    return { error: "Ekki tókst að uppfæra (slóð þarf að vera einstök)." };
  }
  revalidatePath("/admin/flokkar");
  return undefined;
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/flokkar");
}

// ---- Settings --------------------------------------------------------------

export type SettingsState = { success?: boolean; error?: string } | undefined;

export async function saveSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireAdmin();
  try {
    await setSetting(
      "verify_email_subject",
      String(formData.get("verify_email_subject") ?? ""),
    );
    await setSetting(
      "verify_email_body",
      String(formData.get("verify_email_body") ?? ""),
    );
    await setSetting(
      "admin_notification_email",
      String(formData.get("admin_notification_email") ?? ""),
    );
  } catch {
    return { error: "Ekki tókst að vista stillingar." };
  }
  revalidatePath("/admin/stillingar");
  return { success: true };
}

// ---- Notifications ---------------------------------------------------------

export async function markNotificationRead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.notification.update({ where: { id }, data: { isRead: true } });
  revalidatePath("/admin");
}
