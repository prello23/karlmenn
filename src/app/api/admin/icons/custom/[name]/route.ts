import { NextResponse } from "next/server";
import { readdir, unlink } from "fs/promises";
import path from "path";

import { adminGuard } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CUSTOM_DIR = path.join(process.cwd(), "public", "icons", "custom");

// DELETE /api/admin/icons/custom/:name — remove a custom-uploaded icon
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const denied = await adminGuard();
  if (denied) return denied;

  const { name } = await params;
  const base = path.basename(name); // strip any path traversal
  if (!base || base.includes("..") || base.includes("/")) {
    return NextResponse.json({ error: "Ógilt nafn" }, { status: 400 });
  }

  let files: string[];
  try {
    files = await readdir(CUSTOM_DIR);
  } catch {
    return NextResponse.json({ error: "Fannst ekki" }, { status: 404 });
  }

  const match = files.find((f) => path.basename(f, path.extname(f)) === base);
  if (!match) {
    return NextResponse.json({ error: "Fannst ekki" }, { status: 404 });
  }

  try {
    await unlink(path.join(CUSTOM_DIR, match));
  } catch {
    return NextResponse.json({ error: "Eyðing mistókst" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
