import type { Metadata } from "next";

import { DbPageFull, getPageMetadata } from "@/components/db-page";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("neydarhjalp", {
    title: "Neyðarhjálp",
    description:
      "Neyðarnúmer og úrræði fyrir karlmenn í bráðri hættu eða krísu á Íslandi.",
  });
}

export default function CrisisPage() {
  return <DbPageFull slug="neydarhjalp" fallbackTitle="Þarftu hjálp núna?" />;
}
