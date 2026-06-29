import Link from "next/link";
import {
  Shield,
  Scale,
  RefreshCw,
  UserPlus,
  Users,
  HeartHandshake,
  ArrowRight,
  Heart,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import { CrisisResources } from "@/components/crisis-resources";

const AUDIENCE = [
  {
    icon: Shield,
    title: "Fórnarlamb ofbeldis",
    body: "Hefur þú orðið fyrir líkamlegu eða andlegu ofbeldi? Hér er rými þar sem þér er trúað og hlustað á þig — án dóma.",
  },
  {
    icon: Scale,
    title: "Logið uppá þig",
    body: "Rangar ásakanir og mannorðsskaði geta brotið mann niður. Fáðu stuðning, ráðgjöf og fólk sem skilur stöðuna.",
  },
  {
    icon: RefreshCw,
    title: "Gerandi sem vill breyta",
    body: "Að taka ábyrgð er hugrekki. Hér er stuðningur fyrir þá sem vilja breyta hegðun sinni og verða betri.",
  },
];

const STEPS = [
  {
    icon: UserPlus,
    title: "Skráðu þig",
    body: "Þú getur tekið þátt nafnlaust með gælunafni. Engin krafa um að gefa upp hver þú ert.",
  },
  {
    icon: Users,
    title: "Tengstu samfélaginu",
    body: "Deildu reynslu þinni, lestu sögur annarra og finndu fólk sem er í sömu stöðu.",
  },
  {
    icon: HeartHandshake,
    title: "Fáðu aðstoð",
    body: "Lögfræðileg og sálfræðileg ráðgjöf frá fagfólki og sjálfboðaliðum.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-glow" aria-hidden />
        <div className="absolute inset-0 dotted-grid opacity-40" aria-hidden />
        <div className="container relative py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-1.5 text-sm text-muted-foreground">
              <Lock className="h-3.5 w-3.5 text-primary" />
              Nafnlaust · Öruggt · Trúnaður
            </div>
            <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-7xl">
              Þú ert ekki einn.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-balance text-xl text-muted-foreground">
              Samfélag og stuðningur fyrir karlmenn.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/skra">
                  Skrá mig
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Link href="/um-okkur">Kynna mér meira</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Audience ---- */}
      <section className="border-t border-border/60 py-20 sm:py-28">
        <div className="container">
          <SectionHeading
            eyebrow="Hverjum er þetta ætlað"
            title="Hér er pláss fyrir þig"
            description="Sama hver staða þín er — þú átt skilið stuðning, hlustun og virðingu."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {AUDIENCE.map((item) => (
              <div
                key={item.title}
                className="group relative rounded-2xl border border-border bg-card p-7 transition-colors hover:border-primary/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section className="border-t border-border/60 bg-surface/30 py-20 sm:py-28">
        <div className="container">
          <SectionHeading
            eyebrow="Hvernig virkar þetta"
            title="Þrjú einföld skref"
          />
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-lg font-bold text-primary">
                    {i + 1}
                  </span>
                  <step.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Donate ---- */}
      <section className="border-t border-border/60 py-20 sm:py-28">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 sm:p-16">
            <div className="absolute inset-0 hero-glow opacity-70" aria-hidden />
            <div className="relative mx-auto max-w-2xl text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Heart className="h-7 w-7" />
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Byggt á frjálsum framlögum
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Allt hér er byggt á frjálsum framlögum frá samfélaginu. Framlög
                fara beint til lögfræðilegrar og sálfræðilegrar aðstoðar fyrir
                karlmenn sem þurfa á henni að halda.
              </p>
              <div className="mt-8">
                <Button asChild size="lg">
                  <Link href="/dona">
                    <Heart className="h-4 w-4" />
                    Styðja verkefnið
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Crisis ---- */}
      <section className="border-t border-border/60 bg-surface/30 py-20 sm:py-28">
        <div className="container">
          <SectionHeading
            eyebrow="Bráðabirgðahjálp"
            title="Þarftu hjálp núna?"
            description="Ef líf liggur við eða þú ert í bráðri hættu — hikaðu ekki við að hringja."
          />
          <div className="mt-12">
            <CrisisResources />
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Sjá öll úrræði á{" "}
            <Link href="/neydarhjalp" className="text-primary hover:underline">
              neyðarhjálparsíðunni
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
