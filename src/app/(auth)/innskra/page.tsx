import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Innskrá",
  description: "Skráðu þig inn á EkkiEinn.is.",
};

// Maps NextAuth error codes (and our own) to Icelandic messages.
const ERROR_MESSAGES: Record<string, string> = {
  PendingApproval:
    "Aðgangurinn þinn bíður samþykkis stjórnanda eða var hafnað.",
  OAuthAccountNotLinked:
    "Þetta netfang er þegar skráð með annarri innskráningaraðferð.",
  AccessDenied: "Innskráning var ekki heimiluð.",
  Configuration: "Villa í innskráningu. Reyndu aftur síðar.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] ?? ERROR_MESSAGES.AccessDenied : null;

  return (
    <AuthCard
      title="Innskrá"
      subtitle="Velkominn aftur. Þú ert ekki einn."
      footer={
        <>
          Ekki með aðgang?{" "}
          <Link href="/skra" className="text-primary hover:underline">
            Skrá mig
          </Link>
        </>
      }
    >
      {errorMessage && (
        <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}
      <LoginForm callbackUrl={callbackUrl} />
    </AuthCard>
  );
}
