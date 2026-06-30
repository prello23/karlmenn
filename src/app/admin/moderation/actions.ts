"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { setSetting } from "@/lib/settings";

function redactedFrom(aiSuggestions: string | null, fallback: string): string {
  if (!aiSuggestions) return fallback;
  try {
    const parsed = JSON.parse(aiSuggestions);
    return typeof parsed.redacted === "string" ? parsed.redacted : fallback;
  } catch {
    return fallback;
  }
}

// ---- Threads ---------------------------------------------------------------

export async function applyThreadSuggestion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const thread = await prisma.thread.findUnique({ where: { id } });
  if (!thread) return;
  await prisma.thread.update({
    where: { id },
    data: {
      content: redactedFrom(thread.aiSuggestions, thread.content),
      needsReview: false,
      aiSuggestions: null,
      hasAnonymizedNames: true,
    },
  });
  revalidatePath("/admin/moderation");
}

export async function editThreadContent(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const content = String(formData.get("content") ?? "");
  await prisma.thread.update({
    where: { id },
    data: { content, needsReview: false, aiSuggestions: null },
  });
  revalidatePath("/admin/moderation");
}

export async function ignoreThread(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.thread.update({
    where: { id },
    data: { needsReview: false, aiSuggestions: null },
  });
  revalidatePath("/admin/moderation");
}

// ---- Replies ---------------------------------------------------------------

export async function applyReplySuggestion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const reply = await prisma.reply.findUnique({ where: { id } });
  if (!reply) return;
  await prisma.reply.update({
    where: { id },
    data: {
      content: redactedFrom(reply.aiSuggestions, reply.content),
      needsReview: false,
      flagged: false,
      flagReason: null,
      aiSuggestions: null,
    },
  });
  revalidatePath("/admin/moderation");
}

export async function editReplyContent(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const content = String(formData.get("content") ?? "");
  await prisma.reply.update({
    where: { id },
    data: {
      content,
      needsReview: false,
      flagged: false,
      flagReason: null,
      aiSuggestions: null,
    },
  });
  revalidatePath("/admin/moderation");
}

export async function ignoreReply(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.reply.update({
    where: { id },
    data: { needsReview: false, flagged: false, flagReason: null, aiSuggestions: null },
  });
  revalidatePath("/admin/moderation");
}

// ---- Mode toggle -----------------------------------------------------------

export async function setModerationMode(formData: FormData) {
  await requireAdmin();
  const mode = String(formData.get("mode")) === "auto" ? "auto" : "manual";
  await setSetting("ai_moderation_mode", mode);
  revalidatePath("/admin/moderation");
}
