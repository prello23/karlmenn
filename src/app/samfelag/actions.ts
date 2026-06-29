"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { anonymizeText, checkForNames } from "@/lib/ai-anonymize";
import { sendAdminNotification } from "@/lib/email";
import { APP_URL } from "@/lib/content";

// ---- Preview anonymization (used by the new-thread form) -------------------

export async function previewAnonymize(
  content: string,
): Promise<{ anonymized: string; namesFound: string[] }> {
  await requireUser();
  if (!content || content.trim().length < 1) {
    return { anonymized: content, namesFound: [] };
  }
  const { anonymized, namesFound } = await anonymizeText(content);
  return { anonymized, namesFound };
}

// ---- Create thread ---------------------------------------------------------

const threadSchema = z.object({
  categorySlug: z.string().min(1),
  title: z.string().trim().min(3, "Titill þarf að vera a.m.k. 3 stafir").max(160),
  content: z.string().trim().min(10, "Skrifaðu aðeins meira").max(8000),
  victimName: z.string().trim().max(120).optional(),
  perpetratorName: z.string().trim().max(120).optional(),
  isAnonymous: z.coerce.boolean(),
});

export type ThreadState = { error?: string } | undefined;

export async function createThread(
  _prev: ThreadState,
  formData: FormData,
): Promise<ThreadState> {
  const user = await requireUser();

  const parsed = threadSchema.safeParse({
    categorySlug: formData.get("categorySlug"),
    title: formData.get("title"),
    content: formData.get("content"),
    victimName: formData.get("victimName") || undefined,
    perpetratorName: formData.get("perpetratorName") || undefined,
    isAnonymous: formData.get("isAnonymous") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Ógild gögn" };
  }

  const { categorySlug, title, content, victimName, perpetratorName, isAnonymous } =
    parsed.data;

  let threadId: string;
  try {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });
    if (!category) {
      return { error: "Flokkurinn fannst ekki." };
    }

    // Anonymize BEFORE saving. The original (with names) is never stored.
    const { anonymized, namesFound } = await anonymizeText(content);

    const thread = await prisma.thread.create({
      data: {
        categoryId: category.id,
        authorId: user.id,
        title,
        content: anonymized,
        victimName: victimName || null,
        perpetratorName: perpetratorName || null,
        isAnonymous,
        hasAnonymizedNames: namesFound.length > 0,
      },
    });
    threadId = thread.id;
  } catch {
    return { error: "Ekki tókst að vista þráðinn." };
  }

  revalidatePath(`/samfelag/${categorySlug}`);
  redirect(`/samfelag/${categorySlug}/${threadId}`);
}

// ---- Create reply ----------------------------------------------------------

const replySchema = z.object({
  threadId: z.string().min(1),
  categorySlug: z.string().min(1),
  content: z.string().trim().min(1, "Skrifaðu svar").max(8000),
});

export async function createReply(
  _prev: ThreadState,
  formData: FormData,
): Promise<ThreadState> {
  const user = await requireUser();

  const parsed = replySchema.safeParse({
    threadId: formData.get("threadId"),
    categorySlug: formData.get("categorySlug"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Ógild gögn" };
  }

  const { threadId, categorySlug, content } = parsed.data;

  try {
    // Check the reply for names. We keep the text as written but flag it for
    // admin review so a perpetrator is never named on the open forum.
    const { hasNames } = await checkForNames(content);

    await prisma.reply.create({
      data: {
        threadId,
        authorId: user.id,
        content,
        flagged: hasNames,
        flagReason: hasNames ? "Mögulegt mannsnafn í svari" : null,
      },
    });

    if (hasNames) {
      const link = `${APP_URL}/admin/threads/${threadId}`;
      await prisma.notification.create({
        data: {
          type: "FLAGGED_REPLY",
          message: `Mögulegt nafn í svari á þráð #${threadId}`,
          link: `/admin/threads/${threadId}`,
        },
      });
      await sendAdminNotification(
        "Mögulegt nafn í svari — skoða",
        `Sjálfvirk skoðun fann mögulegt mannsnafn í nýju svari.\n\nSkoða þráð: ${link}`,
      );
    }
  } catch {
    return { error: "Ekki tókst að vista svarið." };
  }

  revalidatePath(`/samfelag/${categorySlug}/${threadId}`);
  return undefined;
}
