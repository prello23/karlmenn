import "server-only";

import crypto from "crypto";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { sendVerificationEmail, sendAdminNotification, sendEmail } from "@/lib/email";
import { APP_URL } from "@/lib/content";
import { assessGender } from "@/lib/gender-assess";
import { getRegistrationSettings } from "@/lib/admin-settings";

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
  name: string;
  email: string;
  password: string;
  displayName?: string;
}): Promise<SignUpResult> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "Netfang er þegar skráð." };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const token = newToken();

  // Gender assessment (name + email lookup against the Icelandic name
  // database). Best-effort: never block registration on an assessment failure.
  const regSettings = await getRegistrationSettings().catch(() => null);
  const assessment = await assessGender(
    name,
    email,
    regSettings?.checks ?? { name: true, email: true },
  ).catch(() => null);

  // Auto-approval: enabled + final score meets the admin-configured threshold.
  const autoApprove = Boolean(
    regSettings?.autoApproveEnabled &&
      assessment &&
      assessment.scorePercent >= regSettings.threshold,
  );

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      displayName: input.displayName?.trim() || null,
      emailVerified: false,
      verifyToken: token,
      verifyTokenExp: new Date(Date.now() + TOKEN_TTL_MS),
      approvalStatus: autoApprove ? "APPROVED" : "PENDING_APPROVAL",
      genderAssessment: assessment?.assessment ?? "UNCERTAIN",
      genderAssessmentScore: assessment?.score ?? null,
      genderAssessmentDetails: assessment?.details ?? null,
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

/**
 * Admin-initiated password reset: generates a new random password, stores its
 * hash, and emails the plaintext to the user via the existing transport.
 */
export async function adminResetPassword(
  userId: string,
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "Notandi fannst ekki." };

  // ~11 url-safe chars — easy to type, hard to guess.
  const newPassword = crypto.randomBytes(8).toString("base64url").slice(0, 11);
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  await sendEmail({
    to: user.email,
    subject: "Nýtt lykilorð — EkkiEinn.is",
    text: `Halló,\n\nNýtt lykilorð hefur verið búið til fyrir aðganginn þinn á EkkiEinn.is:\n\n    ${newPassword}\n\nVinsamlegast skráðu þig inn og breyttu lykilorðinu sem fyrst.\n\n${APP_URL}/innskra\n\nKveðja,\nTeymið hjá Ekki einn`,
  });

  return { ok: true, email: user.email };
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
