import Link from "next/link";
import { Search, Flag, Pin, Lock, EyeOff } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: [string, string][] = [
  ["all", "Allir"],
  ["pending", "Bíður"],
  ["approved", "Samþykkt"],
  ["rejected", "Hafnað"],
];

function StatusBadge({ status }: { status: string }) {
  if (status === "approved")
    return <Badge variant="success">Samþykkt</Badge>;
  if (status === "rejected")
    return <Badge variant="destructive">Hafnað</Badge>;
  return (
    <Badge className="border-amber-500/40 bg-amber-500/15 text-amber-400">
      Bíður samþykktar
    </Badge>
  );
}

async function getThreads(q?: string, status?: string) {
  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { perpetratorName: { contains: q } },
      { victimName: { contains: q } },
      { title: { contains: q } },
    ];
  }
  if (status && status !== "all") where.status = status;
  try {
    return await prisma.thread.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 200,
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

function aiReasons(aiAnalysis: string | null): string[] {
  if (!aiAnalysis) return [];
  try {
    const d = JSON.parse(aiAnalysis);
    return Array.isArray(d?.reasons) ? d.reasons : [];
  } catch {
    return [];
  }
}

export default async function AdminThreadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const active = status ?? "all";
  const threads = await getThreads(q, active);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Þræðir</h1>
      <p className="mt-2 text-muted-foreground">
        Yfirferð efnis — aðeins samþykktir þræðir eru sýnilegir á vefnum.
      </p>

      {/* Status filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/threads?status=${key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active === key
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <form className="mt-4 flex gap-2" action="/admin/threads">
        <input type="hidden" name="status" value={active} />
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

      <div className="mt-6 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Titill</th>
              <th className="px-4 py-3 font-medium">Staða</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Flokkur</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Dags.</th>
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
              threads.map((t) => {
                const reasons = aiReasons(t.aiAnalysis);
                return (
                  <tr key={t.id} className="border-t border-border align-top">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {t.isPinned && <Pin className="h-3.5 w-3.5 text-primary" />}
                        {t.isLocked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                        {t.isHidden && <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                        <span className="font-medium">{t.title}</span>
                        {t.replies.length > 0 && (
                          <Badge variant="destructive">
                            <Flag className="mr-1 h-3 w-3" />
                            {t.replies.length}
                          </Badge>
                        )}
                      </div>
                      {reasons.length > 0 && (
                        <div className="mt-1 text-xs text-amber-400">
                          AI: {reasons.join(" · ")}
                        </div>
                      )}
                      {t.perpetratorName && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Gerandi: {t.perpetratorName}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {t.category.name}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {formatDate(t.createdAt)}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
