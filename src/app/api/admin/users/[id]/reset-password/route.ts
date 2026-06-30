import { NextResponse } from "next/server";

import { adminGuard } from "@/lib/admin-api";
import { auth } from "@/lib/auth";
import { adminResetPassword } from "@/lib/account";

export const dynamic = "force-dynamic";

// POST /api/admin/users/:id/reset-password — generate + email a new password
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await adminGuard();
  if (denied) return denied;

  const { id } = await params;
  const session = await auth();

  const result = await adminResetPassword(id);
  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error }, { status: 404 });
  }

  console.log(
    `[admin] password reset for user ${id} (${result.email}) by ${session?.user?.email}`,
  );
  return NextResponse.json({ success: true, email: result.email });
}
