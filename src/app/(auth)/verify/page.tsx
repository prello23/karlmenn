import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { consumeVerifyToken } from "@/lib/account";

export const metadata: Metadata = {
  title: "Staðfesting netfangs",
};

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await consumeVerifyToken(token ?? "");

  const content = {
    verified: {
      icon: <CheckCircle2 className="h-12 w-12 text-success" />,
      title: "Netfang staðfest!",
      body: "Aðgangurinn þinn er virkur. Þú getur nú skráð þig inn.",
    },
    already: {
      icon: <CheckCircle2 className="h-12 w-12 text-success" />,
      title: "Þegar staðfest",
      body: "Netfangið þitt hefur þegar verið staðfest. Skráðu þig inn.",
    },
    expired: {
      icon: <Clock className="h-12 w-12 text-primary" />,
      title: "Linkurinn er útrunninn",
      body: "Staðfestingarlinkurinn gildir í 48 klukkustundir. Skráðu þig inn til að fá nýjan sendan.",
    },
    invalid: {
      icon: <XCircle className="h-12 w-12 text-destructive" />,
      title: "Ógildur linkur",
      body: "Þessi staðfestingarlinkur er ógildur eða hefur þegar verið notaður.",
    },
  }[result];

  return (
    <AuthCard title="Staðfesting netfangs">
      <div className="flex flex-col items-center text-center">
        {content.icon}
        <h2 className="mt-4 text-xl font-semibold">{content.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{content.body}</p>
        <Button asChild className="mt-6 w-full">
          <Link href="/innskra">Fara í innskráningu</Link>
        </Button>
      </div>
    </AuthCard>
  );
}
