import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /api/admin/pages/[id] — single page with full content
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await adminGuard();
  if (denied) return denied;

  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) return NextResponse.json({ error: "Ógilt auðkenni" }, { status: 400 });

  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) return NextResponse.json({ error: "Síða fannst ekki" }, { status: 404 });
  return NextResponse.json(page);
}

const updateSchema = z.object({
  title: z.string().trim().min(1, "Titil vantar").max(200),
  menuTitle: z.string().trim().min(1, "Heiti í valmynd vantar").max(120),
  metaDescription: z.string().trim().max(300).optional().default(""),
  content: z.string().optional().default(""),
});

// PUT /api/admin/pages/[id] — update a page
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await adminGuard();
  if (denied) return denied;

  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) return NextResponse.json({ error: "Ógilt auðkenni" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ógild gögn" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Ógild gögn" },
      { status: 400 },
    );
  }

  try {
    const page = await prisma.page.update({ where: { id }, data: parsed.data });
    return NextResponse.json(page);
  } catch {
    return NextResponse.json({ error: "Síða fannst ekki" }, { status: 404 });
  }
}

// DELETE /api/admin/pages/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await adminGuard();
  if (denied) return denied;

  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) return NextResponse.json({ error: "Ógilt auðkenni" }, { status: 400 });

  try {
    await prisma.page.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Síða fannst ekki" }, { status: 404 });
  }
}
