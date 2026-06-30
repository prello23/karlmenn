import "server-only";

import { prisma } from "@/lib/prisma";

export type PageRecord = {
  id: number;
  slug: string;
  title: string;
  menuTitle: string;
  category: string;
  metaDescription: string;
  content: string;
};

/** Fetch a single editable page by slug. Always hits the DB (no caching). */
export async function getPage(slug: string): Promise<PageRecord | null> {
  try {
    return await prisma.page.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

/**
 * Returns a slug -> menuTitle map for navigation. Falls back to an empty map
 * so callers can use their hardcoded labels if the DB is unavailable.
 */
export async function getNavTitles(): Promise<Record<string, string>> {
  try {
    const pages = await prisma.page.findMany({
      select: { slug: true, menuTitle: true },
    });
    return Object.fromEntries(pages.map((p) => [p.slug, p.menuTitle]));
  } catch {
    return {};
  }
}

/** Maps an app route href to the page slug it represents (for nav titles). */
export const HREF_TO_SLUG: Record<string, string> = {
  "/": "forsida",
  "/samfelag": "samfelag",
  "/studningur": "studningur",
  "/um-okkur": "um-okkur",
  "/styrkja": "styrkja",
  "/neydarhjalp": "neydarhjalp",
  "/samband": "samband",
  "/personuvernd": "personuvernd",
  "/skilmalar": "skilmalar",
};
