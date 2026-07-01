import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/nafnaleit?name=... — returns { found: boolean } only.
// Public endpoint; never exposes the registry list.
export async function GET(req: Request) {
  const name = (new URL(req.url).searchParams.get("name") ?? "").trim();
  if (name.length < 2) {
    return NextResponse.json({ found: false, query: name });
  }

  // Case-insensitive partial match against the registry.
  const rows = await prisma.perpetratorRegistry
    .findMany({ select: { name: true } })
    .catch(() => []);
  const target = name.toLowerCase();
  const found = rows.some((r) => {
    const regName = r.name.trim().toLowerCase();
    // Match if: search is substring of registered name, OR registered name is
    // substring of search (so a lone first name matches a full registered name,
    // and a full entered name matches too).
    return regName.includes(target) || target.includes(regName);
  });

  return NextResponse.json({ found, query: name });
}
