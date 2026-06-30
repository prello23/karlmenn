import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

import { adminGuard } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 500 * 1024; // 500 KB
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40) || "ikon"
  );
}

// POST /api/admin/icons/upload — multipart "file" + optional "dest" (logos|custom)
export async function POST(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Ógild gögn" }, { status: 400 });
  }

  const file = form.get("file");
  const destRaw = String(form.get("dest") ?? "custom");
  const dest = destRaw === "logos" ? "logos" : "custom";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Engin skrá" }, { status: 400 });
  }
  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Óstudd skráartegund (aðeins SVG eða mynd)" },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Skrá er of stór (hámark 500KB)" },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base = slugify(file.name.replace(/\.[^.]+$/, ""));
  const suffix = crypto.randomBytes(3).toString("hex");
  const fileName = `${base}-${suffix}.${ext}`;
  const dir = path.join(process.cwd(), "public", "icons", dest);

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, fileName), buffer);
  } catch {
    return NextResponse.json({ error: "Vistun mistókst" }, { status: 500 });
  }

  return NextResponse.json(
    {
      name: `${base}-${suffix}`,
      path: `/icons/${dest}/${fileName}`,
      type: ext,
    },
    { status: 201 },
  );
}
