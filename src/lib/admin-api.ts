import "server-only";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

/**
 * Guard for admin API route handlers. Returns a NextResponse (401/403) to
 * return early when the caller is not an admin, otherwise null.
 */
export async function adminGuard(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Óaðgengilegt" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Aðgangur bannaður" }, { status: 403 });
  }
  return null;
}
