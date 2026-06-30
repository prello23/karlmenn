import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

import { adminGuard } from "@/lib/admin-api";
import { LUCIDE_ICONS } from "@/lib/icons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IconEntry = { name: string; path: string; type: string };

const ICONS_DIR = path.join(process.cwd(), "public", "icons");

async function listDir(sub: "logos" | "custom"): Promise<IconEntry[]> {
  try {
    const dir = path.join(ICONS_DIR, sub);
    const files = await readdir(dir);
    return files
      .filter((f) => /\.(svg|png|jpe?g|webp|gif)$/i.test(f))
      .map((f) => {
        const ext = path.extname(f).slice(1).toLowerCase();
        return {
          name: path.basename(f, path.extname(f)),
          path: `/icons/${sub}/${f}`,
          type: ext === "jpeg" ? "jpg" : ext,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

// GET /api/admin/icons — all available icons (logos, custom uploads, lucide list)
export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;

  const [logos, custom] = await Promise.all([listDir("logos"), listDir("custom")]);
  return NextResponse.json({ logos, custom, lucide: LUCIDE_ICONS });
}
