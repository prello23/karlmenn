import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/nafnaleit?name=... — returns { found: boolean } only.
// Requires a signed-in user; never exposes the registry list.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Óaðgengilegt" }, { status: 401 });
  }

  const name = (new URL(req.url).searchParams.get("name") ?? "").trim();
  if (name.length < 2) {
    return NextResponse.json({ found: false, query: name });
  }

  // Case-insensitive exact match against the registry.
  const rows = await prisma.perpetratorRegistry
    .findMany({ select: { name: true } })
    .catch(() => []);
  const target = name.toLowerCase();
  const found = rows.some((r) => r.name.trim().toLowerCase() === target);

  return NextResponse.json({ found, query: name });
}
