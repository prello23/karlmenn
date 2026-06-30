import type { Metadata } from "next";

import { DbPageFull, getPageMetadata } from "@/components/db-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupportRequestForm } from "@/components/support-request-form";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("studningur", {
    title: "Stuðningur",
    description:
      "Lögfræðileg og sálfræðileg aðstoð fyrir karlmenn. Biddu um stuðning og kynntu þér réttindi þín.",
  });
}

export default function SupportPage() {
  return (
    <>
      <DbPageFull slug="studningur" fallbackTitle="Stuðningur" />
      <section className="pb-16">
        <div className="container max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Biðja um stuðning</CardTitle>
            </CardHeader>
            <CardContent>
              <SupportRequestForm />
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
