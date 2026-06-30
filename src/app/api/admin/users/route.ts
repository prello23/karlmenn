import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

// GET /api/admin/users — list all users with post/reply counts
export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      role: true,
      approvalStatus: true,
      emailVerified: true,
      createdAt: true,
      lastLoginAt: true,
      genderAssessment: true,
      genderAssessmentScore: true,
      _count: { select: { threads: true, replies: true } },
    },
  });

  return NextResponse.json({ users });
}
