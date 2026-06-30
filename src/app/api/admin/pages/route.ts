import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

// GET /api/admin/pages — list all pages
export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;

  const pages = await prisma.page.findMany({
    orderBy: { id: "asc" },
    select: { id: true, slug: true, menuTitle: true, title: true, updatedAt: true },
  });
  return NextResponse.json(pages);
}

const createSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slóð vantar")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slóð má aðeins innihalda a-z, 0-9 og bandstrik"),
  title: z.string().trim().min(1, "Titil vantar").max(200),
  menuTitle: z.string().trim().min(1, "Heiti í valmynd vantar").max(120),
  metaDescription: z.string().trim().max(300).optional().default(""),
  content: z.string().optional().default(""),
});

// POST /api/admin/pages — create a page
export async function POST(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ógild gögn" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Ógild gögn" },
      { status: 400 },
    );
  }

  try {
    const page = await prisma.page.create({ data: parsed.data });
    return NextResponse.json(page, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Slóð er líklega þegar í notkun." },
      { status: 409 },
    );
  }
}
