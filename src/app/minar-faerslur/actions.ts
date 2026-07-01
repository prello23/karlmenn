"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { checkContent } from "@/lib/content-check";
import { decideContentStatus } from "@/lib/aiModeration";
import { buildSuggestion } from "@/lib/name-detection";

/**
 * Re-run the content check on the author's (possibly edited) text — heuristic
 * (names, PII, hate words) plus AI analysis. If the combined verdict is clean →
 * approve and publish; otherwise keep it pending/rejected with a fresh
 * suggestion.
 */
async function rescanAndSave(threadId: string, ownerId: string, content: string) {
  const thread = await prisma.thread.findFirst({
    where: { id: threadId, authorId: ownerId },
  });
  if (!thread) return;

  const check = await checkContent(`${thread.title}\n${content}`);
  const decision = await decideContentStatus(`${thread.title}\n${content}`, check);

  if (decision.status === "approved") {
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
        aiAnalysis: decision.aiAnalysis,
      },
    });
  } else {
    const sugg = buildSuggestion(content);
    await prisma.thread.update({
      where: { id: threadId },
      data: {
        content,
        status: decision.status,
        needsReview: decision.status === "pending",
        flaggedNames: check.names.length ? JSON.stringify(check.names) : null,
        moderationReason: decision.moderationReason,
        suggestedText: sugg.hasNames ? sugg.suggestedText : null,
        nameMap: sugg.hasNames ? JSON.stringify(sugg.nameMap) : null,
        aiAnalysis: decision.aiAnalysis,
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
