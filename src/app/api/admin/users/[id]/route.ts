import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/admin-api";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/users/:id — a single user with all their threads
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await adminGuard();
  if (denied) return denied;

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      threads: {
        orderBy: { createdAt: "desc" },
        include: { category: { select: { slug: true, name: true } } },
      },
      _count: { select: { threads: true, replies: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Notandi fannst ekki" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

const patchSchema = z.object({
  name: z.string().trim().max(120).optional(),
  displayName: z.string().trim().max(40).nullable().optional(),
  role: z.enum(["USER", "MODERATOR", "ADMIN"]).optional(),
  approvalStatus: z
    .enum(["PENDING_APPROVAL", "APPROVED", "REJECTED"])
    .optional(),
  emailVerified: z.boolean().optional(),
});

// PATCH /api/admin/users/:id — update user info
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await adminGuard();
  if (denied) return denied;

  const { id } = await params;
  const session = await auth();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ógild gögn" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Ógild gögn" },
      { status: 400 },
    );
  }

  // Safeguard: an admin cannot demote their own ADMIN role (lock-out guard).
  if (
    session?.user?.id === id &&
    parsed.data.role &&
    parsed.data.role !== "ADMIN"
  ) {
    return NextResponse.json(
      { error: "Þú getur ekki fjarlægt þitt eigið ADMIN hlutverk." },
      { status: 400 },
    );
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.displayName !== undefined)
    data.displayName = parsed.data.displayName || null;
  if (parsed.data.role !== undefined) data.role = parsed.data.role;
  if (parsed.data.approvalStatus !== undefined)
    data.approvalStatus = parsed.data.approvalStatus;
  if (parsed.data.emailVerified !== undefined)
    data.emailVerified = parsed.data.emailVerified;

  try {
    const user = await prisma.user.update({ where: { id }, data });
    console.log(
      `[admin] user ${id} updated by ${session?.user?.email}:`,
      JSON.stringify(data),
    );
    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ error: "Notandi fannst ekki" }, { status: 404 });
  }
}

// DELETE /api/admin/users/:id — delete user (cascades to their threads/replies)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await adminGuard();
  if (denied) return denied;

  const { id } = await params;
  const session = await auth();
  if (session?.user?.id === id) {
    return NextResponse.json(
      { error: "Þú getur ekki eytt þínum eigin aðgangi." },
      { status: 400 },
    );
  }

  try {
    await prisma.user.delete({ where: { id } });
    console.log(`[admin] user ${id} deleted by ${session?.user?.email}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Notandi fannst ekki" }, { status: 404 });
  }
}
