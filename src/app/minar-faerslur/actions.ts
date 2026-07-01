"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { checkContent } from "@/lib/content-check";
import { buildSuggestion } from "@/lib/name-detection";

/**
 * Re-run the content check on the author's (possibly edited) text. If clean →
 * approve and publish; otherwise keep it pending with a fresh suggestion.
 */
async function rescanAndSave(threadId: string, ownerId: string, content: string) {
  const thread = await prisma.thread.findFirst({
    where: { id: threadId, authorId: ownerId },
  });
  if (!thread) return;

  const check = await checkContent(`${thread.title}\n${content}`);

  if (check.clean) {
    await prisma.thread.update({
      where: { id: threadId },
      data: {
        content,
        status: "approved",
        needsReview: false,
        flaggedNames: null,
        moderationReason: null,
        suggestedText: null,
        nameMap: null,
        aiAnalysis: null,
      },
    });
  } else {
    const sugg = buildSuggestion(content);
    await prisma.thread.update({
      where: { id: threadId },
      data: {
        content,
        status: "pending",
        needsReview: true,
        flaggedNames: check.names.length ? JSON.stringify(check.names) : null,
        moderationReason: check.moderationReason || null,
        suggestedText: sugg.hasNames ? sugg.suggestedText : null,
        nameMap: sugg.hasNames ? JSON.stringify(sugg.nameMap) : null,
      },
    });
  }

  revalidatePath("/minar-faerslur");
  revalidatePath("/samfelag");
}

// Accept the [AAA] suggestion as the new text.
export async function acceptOwnSuggestion(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const thread = await prisma.thread.findFirst({
    where: { id, authorId: user.id },
    select: { suggestedText: true },
  });
  if (!thread?.suggestedText) return;
  await rescanAndSave(id, user.id, thread.suggestedText);
}

// Manually revise the text and re-scan.
export async function reviseOwnThread(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const content = String(formData.get("content") ?? "").trim();
  if (content.length < 10) return;
  await rescanAndSave(id, user.id, content);
}
