import "server-only";

import { prisma } from "@/lib/prisma";
import { FORUM_CATEGORIES, type ForumCategory } from "@/lib/content";

export type CategoryWithCount = ForumCategory & {
  id: string | null;
  threadCount: number;
};

/**
 * Returns forum categories with thread counts. Falls back to the static list
 * from content.ts when the database has not been seeded yet, so the forum
 * always renders.
 */
export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  try {
    const dbCategories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { threads: true } } },
    });

    if (dbCategories.length > 0) {
      return dbCategories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        icon: c.icon,
        restricted: c.restricted,
        threadCount: c._count.threads,
      }));
    }
  } catch {
    // fall through to static
  }

  return FORUM_CATEGORIES.map((c) => ({ ...c, id: null, threadCount: 0 }));
}

export async function getCategoryBySlug(slug: string) {
  try {
    return await prisma.category.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

const authorSelect = {
  select: { displayName: true, username: true, isAnonymous: true },
} as const;

export async function getThreads(categoryId: string) {
  try {
    return await prisma.thread.findMany({
      where: { categoryId },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: {
        author: authorSelect,
        _count: { select: { replies: true } },
      },
    });
  } catch {
    return [];
  }
}

export async function getThread(id: string) {
  try {
    return await prisma.thread.findUnique({
      where: { id },
      include: {
        category: true,
        author: authorSelect,
        replies: {
          orderBy: { createdAt: "asc" },
          include: { author: authorSelect },
        },
      },
    });
  } catch {
    return null;
  }
}

type AuthorInfo = {
  displayName: string | null;
  username: string | null;
  isAnonymous?: boolean;
} | null;

/**
 * Resolve a display name for a post author, honouring anonymity.
 * `threadAnonymous` is the thread-level flag; for replies we use the author's
 * own anonymity preference.
 */
export function authorLabel(author: AuthorInfo, anonymous?: boolean): string {
  const anon = anonymous ?? author?.isAnonymous ?? true;
  if (anon) return "Nafnlaus";
  return author?.displayName || author?.username || "Notandi";
}
