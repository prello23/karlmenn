import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { upsertGoogleUser } from "@/lib/account";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** Codes surfaced to the client via NextAuth's error handling. */
export const AUTH_ERRORS = {
  INVALID: "CredentialsSignin",
  UNVERIFIED: "EmailNotVerified",
} as const;

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/innskra",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Netfang", type: "email" },
        password: { label: "Lykilorð", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Block sign-in until the email has been verified.
        if (!user.emailVerified) {
          throw new Error(AUTH_ERRORS.UNVERIFIED);
        }

        // Non-admins must be approved by an admin before they can sign in.
        if (user.role !== "ADMIN" && user.approvalStatus !== "APPROVED") {
          return null;
        }

        // Record the successful sign-in (best-effort — never block login).
        await prisma.user
          .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
          .catch(() => {});

        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? user.username ?? null,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // Google sign-in: create-or-link the account by email and gate on approval
    // exactly like the credentials flow. Credentials sign-ins are handled in
    // authorize() above, so we pass them through here.
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      const p = (profile ?? {}) as {
        email?: string;
        name?: string;
        given_name?: string;
        family_name?: string;
        picture?: string;
      };
      const email = (user?.email ?? p.email ?? "").toLowerCase();
      if (!email) return false;

      const record = await upsertGoogleUser({
        email,
        name: user?.name ?? p.name ?? null,
        givenName: p.given_name ?? null,
        familyName: p.family_name ?? null,
        image: user?.image ?? p.picture ?? null,
      }).catch(() => null);
      if (!record) return false;

      // Non-admins must be approved before they can sign in.
      if (record.role !== "ADMIN" && record.approvalStatus !== "APPROVED") {
        return "/innskra?error=PendingApproval";
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Google: resolve our own user record (id + role) by email, since the
      // provider profile doesn't carry them.
      if (account?.provider === "google" && user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
        });
        if (dbUser) {
          token.sub = dbUser.id;
          token.role = dbUser.role;
        }
        return token;
      }
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string) ?? "USER";
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
