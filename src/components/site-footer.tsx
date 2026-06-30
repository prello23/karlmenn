import Link from "next/link";
import Image from "next/image";
import { Phone } from "lucide-react";

import { FOOTER_NAV } from "@/lib/nav";
import { SITE } from "@/lib/content";
import { getNavTitles, HREF_TO_SLUG } from "@/lib/pages";

export async function SiteFooter() {
  const titles = await getNavTitles();
  return (
    <footer className="border-t border-border/60 bg-surface/40">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" aria-label="EkkiEinn.is — forsíða" className="flex items-center">
              <Image
                src="/logo.png"
                alt="EkkiEinn.is"
                width={358}
                height={273}
                className="h-9 w-auto"
              />
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              {SITE.tagline} Byggt á frjálsum framlögum og styrktarfé.
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="inline-block text-sm text-primary hover:underline"
            >
              {SITE.email}
            </a>
          </div>

          {Object.entries(FOOTER_NAV).map(([group, links]) => (
            <div key={group}>
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                {group}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => {
                  const slug = HREF_TO_SLUG[link.href];
                  const label = (slug && titles[slug]) || link.label;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {SITE.name} — Allur réttur áskilinn.
          </p>
          <a
            href="tel:112"
            className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1.5 font-medium text-destructive"
          >
            <Phone className="h-4 w-4" />
            Neyðarlína: 112
          </a>
        </div>
      </div>
    </footer>
  );
}
