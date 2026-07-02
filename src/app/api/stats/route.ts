import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";

// Real DB counts, cached for 5 minutes to avoid hitting the DB per request.
const getStats = unstable_cache(
  async () => {
    const [stories, members] = await Promise.all([
      prisma.thread
        .count({ where: { status: "approved", isHidden: false } })
        .catch(() => 0),
      prisma.user.count().catch(() => 0),
    ]);
    return { stories, members };
  },
  ["homepage-stats"],
  { revalidate: 300 },
);

// GET /api/stats — { stories, members }
export async function GET() {
  const stats = await getStats();
  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
