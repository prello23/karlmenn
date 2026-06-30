import type { Metadata } from "next";

import { DbPageFull, getPageMetadata } from "@/components/db-page";
import { Card, CardContent } from "@/components/ui/card";
import { DonationForm } from "@/components/donation-form";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("styrkja", {
    title: "Styrkja",
    description:
      "Framlög til EkkiEinn.is fara beint í lögfræðilega og sálfræðilega aðstoð fyrir karlmenn. Eitt skipti eða mánaðarlega, nafnlaust ef þú vilt.",
  });
}

export default function DonatePage() {
  return (
    <>
      <DbPageFull slug="styrkja" fallbackTitle="Styrktu okkur" />
      <section className="pb-16">
        <div className="container max-w-md">
          <Card>
            <CardContent className="pt-6">
              <DonationForm />
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
