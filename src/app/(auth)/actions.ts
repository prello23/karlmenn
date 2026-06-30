"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registerUser, resendVerification } from "@/lib/account";

// ---- Sign up ---------------------------------------------------------------

const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Sláðu inn nafn (a.m.k. 2 stafir)").max(120),
    email: z.string().trim().email("Ógilt netfang"),
    displayName: z.string().trim().max(40).optional(),
    password: z.string().min(8, "Lykilorð þarf að vera a.m.k. 8 stafir"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Lykilorðin stemma ekki",
    path: ["confirm"],
  });

export type SignUpState =
  | { error?: string; success?: boolean }
  | undefined;

export async function signUpAction(
  _prev: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    displayName: formData.get("displayName") || undefined,
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Ógild gögn" };
  }

  const result = await registerUser({
    name: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password,
    displayName: parsed.data.displayName,
  });

  if (!result.ok) return { error: result.error };
  return { success: true };
}

// ---- Log in ----------------------------------------------------------------

const loginSchema = z.object({
  email: z.string().trim().email("Ógilt netfang"),
  password: z.string().min(1, "Sláðu inn lykilorð"),
  callbackUrl: z.string().optional(),
});

export type LoginState =
  | { error?: string; unverified?: boolean; email?: string }
  | undefined;

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    callbackUrl: formData.get("callbackUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Ógild gögn" };
  }

  const { email, password, callbackUrl } = parsed.data;
  const normalized = email.toLowerCase();

  // Pre-check for precise messaging (invalid vs. unverified).
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user || !user.passwordHash) {
    return { error: "Rangt netfang eða lykilorð." };
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Rangt netfang eða lykilorð." };
  }
  if (!user.emailVerified) {
    return {
      unverified: true,
      email: normalized,
      error:
        "Vinsamlegast staðfestu netfangið þitt. Athugaðu pósthólfið þitt.",
    };
  }
  // Admins bypass approval; everyone else must be approved.
  if (user.role !== "ADMIN" && user.approvalStatus !== "APPROVED") {
    return {
      error:
        user.approvalStatus === "REJECTED"
          ? "Því miður var aðgangsbeiðni þinni hafnað."
          : "Aðgangurinn þinn bíður samþykkis stjórnanda.",
    };
  }

  try {
    await signIn("credentials", {
      email: normalized,
      password,
      redirectTo: callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/samfelag",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Rangt netfang eða lykilorð." };
    }
    throw error; // re-throw redirect
  }
  return undefined;
}

// ---- Resend verification ---------------------------------------------------

export async function resendAction(
  _prev: { sent?: boolean } | undefined,
  formData: FormData,
): Promise<{ sent?: boolean } | undefined> {
  const email = String(formData.get("email") ?? "");
  if (email) await resendVerification(email);
  // Always report success to avoid leaking which emails exist.
  return { sent: true };
}

// ---- Log out ---------------------------------------------------------------

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
