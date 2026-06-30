import Link from "next/link";
import { Search, Flag, Pin, Lock, EyeOff } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getThreads(q?: string) {
  try {
    return await prisma.thread.findMany({
      where: q
        ? {
            OR: [
              { perpetratorName: { contains: q } },
              { victimName: { contains: q } },
              { title: { contains: q } },
            ],
          }
        : undefined,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
      include: {
        category: { select: { name: true } },
        _count: { select: { replies: true } },
        replies: { where: { flagged: true }, select: { id: true } },
      },
    });
  } catch {
    return [];
  }
}

export default async function AdminThreadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const threads = await getThreads(q);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Þræðir</h1>
      <p className="mt-2 text-muted-foreground">
        Leitaðu eftir nafni geranda til að finna tengd mál.
      </p>

      <form className="mt-6 flex gap-2" action="/admin/threads">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Leita eftir geranda, þolanda eða titli..."
          className="max-w-md"
        />
        <Button type="submit" variant="outline">
          <Search className="h-4 w-4" />
          Leita
        </Button>
      </form>

      <div className="mt-8 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Titill</th>
              <th className="px-4 py-3 font-medium">Flokkur</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Dags.</th>
              <th className="px-4 py-3 font-medium">Svör</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {threads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  Engir þræðir fundust.
                </td>
              </tr>
            ) : (
              threads.map((t) => (
                <tr key={t.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {t.isPinned && <Pin className="h-3.5 w-3.5 text-primary" />}
                      {t.isLocked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                      {t.isHidden && <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                      <span className="font-medium">{t.title}</span>
                      {t.status === "PENDING_REVIEW" && (
                        <Badge className="border-amber-500/40 bg-amber-500/15 text-amber-400">
                          Bíður yfirferðar
                        </Badge>
                      )}
                      {t.replies.length > 0 && (
                        <Badge variant="destructive">
                          <Flag className="mr-1 h-3 w-3" />
                          {t.replies.length}
                        </Badge>
                      )}
                    </div>
                    {t.flaggedNames && (
                      <div className="mt-1 text-xs text-amber-400">
                        Nöfn fundin:{" "}
                        {(JSON.parse(t.flaggedNames) as string[]).join(", ")}
                      </div>
                    )}
                    {t.perpetratorName && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Gerandi: {t.perpetratorName}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t.category.name}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {formatDate(t.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t._count.replies}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/threads/${t.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      Skoða
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
