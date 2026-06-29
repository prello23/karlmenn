import type { Metadata } from "next";
import { Scale, Brain, Users, Check } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SupportRequestForm } from "@/components/support-request-form";
import { SUPPORTERS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Stuðningur",
  description:
    "Lögfræðileg og sálfræðileg aðstoð fyrir karlmenn. Biddu um stuðning og kynntu þér réttindi þín.",
};

const RIGHTS = [
  "Þú átt rétt á að vera trúað og tekið alvarlega.",
  "Þú átt rétt á lögfræðiaðstoð og að verja mannorð þitt.",
  "Karlmenn geta líka verið þolendur heimilisofbeldis.",
  "Þú átt rétt á jafnri meðferð í forsjár- og umgengnismálum.",
  "Að leita sér hjálpar er styrkleiki, ekki veikleiki.",
];

const fieldIcon = { legal: Scale, psych: Brain } as const;

export default function SupportPage() {
  return (
    <>
      <PageHero
        eyebrow="Stuðningur"
        title="Þú þarft ekki að gera þetta einn"
        description="Hér finnur þú fagfólk sem býður lögfræðilega og sálfræðilega aðstoð — og þú getur beðið um stuðning beint."
      />

      {/* Supporters */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-bold tracking-tight">Fagaðstoð</h2>
          <p className="mt-2 text-muted-foreground">
            Aðstoð í boði í gegnum verkefnið — fjármagnað með framlögum og styrktarfé.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {SUPPORTERS.map((s) => {
              const Icon = fieldIcon[s.field] ?? Users;
              return (
                <Card key={s.name}>
                  <CardHeader>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="mt-3 text-lg">{s.name}</CardTitle>
                    <Badge variant="secondary" className="w-fit">
                      {s.role}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {s.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Aðgengi:
                      </span>{" "}
                      {s.availability}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rights + request */}
      <section className="border-t border-border/60 bg-surface/30 py-16">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Réttindi karla
            </h2>
            <p className="mt-2 text-muted-foreground">
              Mikilvægt er að þekkja réttindi sín. Hér eru nokkur grunnatriði.
            </p>
            <ul className="mt-6 space-y-3">
              {RIGHTS.map((right) => (
                <li key={right} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-foreground/90">{right}</span>
                </li>
              ))}
            </ul>
          </div>

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
