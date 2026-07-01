"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { anonymizeText, detectNames } from "@/lib/ai-anonymize";
import { redactNames } from "@/lib/name-detection";
import { checkContent } from "@/lib/content-check";
import { sendAdminNotification } from "@/lib/email";
import { getSetting } from "@/lib/settings";
import { getDbSetting } from "@/lib/admin-settings";
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
  pendingThreadId: z.string().optional(),
});

export type ThreadState =
  | {
      error?: string;
      pendingReview?: boolean;
      flaggedNames?: string[];
      reasons?: string[];
      suggestion?: string;
      pendingThreadId?: string;
    }
  | undefined;

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
    pendingThreadId: formData.get("pendingThreadId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Ógild gögn" };
  }

  const {
    categorySlug,
    title,
    content,
    victimName,
    perpetratorName,
    isAnonymous,
    pendingThreadId,
  } = parsed.data;

  let threadId: string;
  try {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });
    if (!category) {
      return { error: "Flokkurinn fannst ekki." };
    }

    // ---- AI/heuristic content check (names, kennitala, phone, hate speech) ----
    const moderationOn =
      (await getDbSetting("thread_name_moderation")) !== "false";
    const check = moderationOn
      ? await checkContent(`${title}\n${content}`)
      : {
          clean: true,
          names: [],
          kennitala: [],
          phones: [],
          hateWords: [],
          reasons: [],
          suggestion: content,
        };

    const baseData = {
      title,
      content,
      victimName: victimName || null,
      perpetratorName: perpetratorName || null,
      isAnonymous,
    };

    // Resolve a resubmit target (must belong to this user).
    const ownedId = pendingThreadId
      ? (
          await prisma.thread.findFirst({
            where: { id: pendingThreadId, authorId: user.id },
            select: { id: true },
          })
        )?.id
      : undefined;

    if (!check.clean) {
      // Hold as `pending` (never public) and offer a [Nafn] suggestion.
      const flaggedNames = check.names;
      const aiAnalysis = JSON.stringify({
        names: check.names,
        kennitala: check.kennitala,
        phones: check.phones,
        hateWords: check.hateWords,
        reasons: check.reasons,
      });
      const pendingData = {
        ...baseData,
        status: "pending",
        needsReview: true,
        flaggedNames: flaggedNames.length ? JSON.stringify(flaggedNames) : null,
        aiAnalysis,
      };

      let id = ownedId;
      if (id) {
        await prisma.thread.update({ where: { id }, data: pendingData });
      } else {
        const created = await prisma.thread.create({
          data: { categoryId: category.id, authorId: user.id, ...pendingData },
        });
        id = created.id;
        await notifyModeration("þræði", id);
      }
      return {
        pendingReview: true,
        flaggedNames,
        reasons: check.reasons,
        suggestion: redactNames(content),
        pendingThreadId: id,
      };
    }

    // ---- Clean → auto-approve (visible immediately) ----
    if (ownedId) {
      await prisma.thread.update({
        where: { id: ownedId },
        data: {
          ...baseData,
          status: "approved",
          needsReview: false,
          flaggedNames: null,
          aiAnalysis: null,
        },
      });
      revalidatePath(`/samfelag/${categorySlug}`);
      redirect(`/samfelag/${categorySlug}/${ownedId}`);
    }

    const thread = await prisma.thread.create({
      data: {
        categoryId: category.id,
        authorId: user.id,
        ...baseData,
        status: "approved",
      },
    });
    threadId = thread.id;
  } catch (err) {
    // redirect() throws a special error we must not swallow.
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    return { error: "Ekki tókst að vista þráðinn." };
  }

  revalidatePath(`/samfelag/${categorySlug}`);
  redirect(`/samfelag/${categorySlug}/${threadId}`);
}

async function notifyModeration(kind: string, threadId: string) {
  try {
    await prisma.notification.create({
      data: {
        type: "NEEDS_REVIEW",
        message: `Nýtt efni með hugsanlegum nöfnum (${kind}) — þarfnast yfirferðar`,
        link: "/admin/moderation",
      },
    });
    await sendAdminNotification(
      "Efni þarfnast yfirferðar — EkkiEinn.is",
      `Sjálfvirk nafnagreining fann hugsanlegt mannsnafn í nýju efni (${kind}).\n\nSkoða: ${APP_URL}/admin/moderation`,
    );
  } catch {
    // best-effort
  }
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
    const mode = await getSetting("ai_moderation_mode");
    const detection = await detectNames(content);
    const hasNames = detection.has_names;

    // Manual mode (default): keep the text but flag for admin review.
    // Auto mode: redact names before saving.
    const storedContent = mode === "auto" ? detection.redacted : content;
    const needsReview = mode !== "auto" && hasNames;

    await prisma.reply.create({
      data: {
        threadId,
        authorId: user.id,
        content: storedContent,
        flagged: needsReview,
        flagReason: needsReview ? "Mögulegt mannsnafn í svari" : null,
        needsReview,
        aiSuggestions: needsReview ? JSON.stringify(detection) : null,
      },
    });

    if (needsReview) {
      await notifyModeration("svari", threadId);
    }
  } catch {
    return { error: "Ekki tókst að vista svarið." };
  }

  revalidatePath(`/samfelag/${categorySlug}/${threadId}`);
  return undefined;
}
