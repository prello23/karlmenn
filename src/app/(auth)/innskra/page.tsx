import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Innskrá",
  description: "Skráðu þig inn á ekkieinn.is.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

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
      <LoginForm callbackUrl={callbackUrl} />
    </AuthCard>
  );
}
