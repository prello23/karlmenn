import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function publicHref(slug: string): string {
  return slug === "forsida" ? "/" : `/${slug}`;
}

export default async function AdminPagesPage() {
  const pages = await prisma.page
    .findMany({ orderBy: { id: "asc" } })
    .catch(() => []);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Síður — texti og myndir</h1>
          <p className="mt-2 text-muted-foreground">
            Smelltu á síðu til að breyta öllum texta og myndum á henni.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/pages/new">
            <Plus className="h-4 w-4" />
            Bæta við síðu
          </Link>
        </Button>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Síða</th>
              <th className="px-4 py-3 font-medium">Slóð</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Uppfært</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  Engar síður. Keyrðu <code>npm run db:seed</code>.
                </td>
              </tr>
            ) : (
              pages.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{p.menuTitle}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {publicHref(p.slug)}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {formatDate(p.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/pages/${p.id}`}
                      className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Breyta
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
