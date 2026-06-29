import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Skrá mig",
  description: "Stofnaðu aðgang að samfélaginu á ekkieinn.is.",
};

export default function SignUpPage() {
  return (
    <AuthCard
      title="Stofna aðgang"
      subtitle="Þú getur tekið þátt nafnlaust. Aðeins netfangið þitt þarf að staðfesta."
      footer={
        <>
          Ertu nú þegar með aðgang?{" "}
          <Link href="/innskra" className="text-primary hover:underline">
            Innskrá
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
