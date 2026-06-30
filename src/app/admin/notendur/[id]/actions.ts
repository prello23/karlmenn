"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

/** Toggle a thread's hidden state from the user detail panel. */
export async function togglePostHidden(formData: FormData) {
  const admin = await requireAdmin();
  const threadId = String(formData.get("threadId"));
  const userId = String(formData.get("userId"));

  const thread = await prisma.thread.findUnique({ where: { id: threadId } });
  if (!thread) return;

  await prisma.thread.update({
    where: { id: threadId },
    data: { isHidden: !thread.isHidden },
  });
  console.log(
    `[admin] thread ${threadId} ${thread.isHidden ? "unhidden" : "hidden"} by ${admin.email}`,
  );

  revalidatePath(`/admin/notendur/${userId}`);
  revalidatePath("/admin/threads");
  revalidatePath("/samfelag");
}
