import "server-only";

import crypto from "crypto";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { sendVerificationEmail, sendAdminNotification } from "@/lib/email";
import { APP_URL } from "@/lib/content";

const TOKEN_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

function newToken() {
  return crypto.randomBytes(32).toString("hex");
}

function verifyUrl(token: string) {
  return `${APP_URL}/verify?token=${token}`;
}

export type SignUpResult =
  | { ok: true }
  | { ok: false; error: string };

export async function registerUser(input: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<SignUpResult> {
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "Netfang er þegar skráð." };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const token = newToken();

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName: input.displayName?.trim() || null,
      emailVerified: false,
      verifyToken: token,
      verifyTokenExp: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  await sendVerificationEmail(email, verifyUrl(token));
  return { ok: true };
}

export type VerifyResult = "verified" | "already" | "expired" | "invalid";

export async function consumeVerifyToken(token: string): Promise<VerifyResult> {
  if (!token) return "invalid";

  const user = await prisma.user.findUnique({ where: { verifyToken: token } });
  if (!user) {
    // Token may have already been consumed.
    return "invalid";
  }

  if (user.emailVerified) return "already";

  if (!user.verifyTokenExp || user.verifyTokenExp.getTime() < Date.now()) {
    return "expired";
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verifyToken: null,
      verifyTokenExp: null,
    },
  });

  // The user is now verified and awaiting admin approval — notify admins.
  if (user.approvalStatus === "PENDING_APPROVAL" && user.role !== "ADMIN") {
    try {
      await prisma.notification.create({
        data: {
          type: "PENDING_USER",
          message: `Nýr notandi bíður samþykkis: ${user.email}`,
          link: "/admin/notendur",
        },
      });
      await sendAdminNotification(
        "Nýr notandi bíður samþykkis — EkkiEinn.is",
        `Notandinn ${user.email} hefur staðfest netfang sitt og bíður nú samþykkis.\n\nFarðu á ${APP_URL}/admin/notendur til að samþykkja eða hafna.`,
      );
    } catch {
      // best-effort — never block verification on notification failure
    }
  }

  return "verified";
}

export async function resendVerification(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user || user.emailVerified) return false;

  const token = newToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      verifyToken: token,
      verifyTokenExp: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  await sendVerificationEmail(user.email, verifyUrl(token));
  return true;
}
