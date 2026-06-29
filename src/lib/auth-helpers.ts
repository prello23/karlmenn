import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Returns the current session, or null. */
export async function getSession() {
  return auth();
}

/** Returns the full DB user for the current session, or null. */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  try {
    return await prisma.user.findUnique({ where: { id: session.user.id } });
  } catch {
    return null;
  }
}

/** Redirects to sign-in unless authenticated. Returns the session user. */
export async function requireUser(callbackUrl?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    const url = callbackUrl
      ? `/innskra?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/innskra";
    redirect(url);
  }
  return session.user;
}

/** Redirects unless the current user is an admin. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/innskra?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");
  return session.user;
}

export function isAdmin(role?: string | null) {
  return role === "ADMIN";
}
