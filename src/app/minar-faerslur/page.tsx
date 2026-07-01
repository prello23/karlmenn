import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { acceptOwnSuggestion, reviseOwnThread } from "./actions";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  if (status === "approved")
    return <Badge variant="success">🟢 Samþykkt</Badge>;
  if (status === "rejected")
    return <Badge variant="destructive">🔴 Hafnað</Badge>;
  return (
    <Badge className="border-amber-500/40 bg-amber-500/15 text-amber-400">
      🟡 Bíður samþykktar
    </Badge>
  );
}

export default async function MyThreadsPage() {
  const user = await requireUser("/minar-faerslur");

  const threads = await prisma.thread
    .findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      include: { category: { select: { slug: true, name: true } } },
    })
    .catch(() => []);

  return (
    <section className="py-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">Mínar færslur</h1>
        <p className="mt-2 text-muted-foreground">
          Staða þráðanna þinna. Aðeins samþykktar færslur eru sýnilegar öðrum.
        </p>

        {threads.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border bg-surface/30 p-10 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Þú hefur ekki birt neinar færslur enn.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {threads.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {t.status === "approved" ? (
                        <Link
                          href={`/samfelag/${t.category.slug}/${t.id}`}
                          className="font-semibold hover:text-primary hover:underline"
                        >
                          {t.title}
                        </Link>
                      ) : (
                        <span className="font-semibold">{t.title}</span>
                      )}
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.category.name} · {formatDate(t.createdAt)}
                    </p>
                  </div>
                </div>

                {t.status !== "approved" && t.moderationReason && (
                  <p className="mt-3 text-sm text-amber-300">
                    Ástæða: {t.moderationReason}
                  </p>
                )}
                {t.status === "rejected" && t.moderationNote && (
                  <p className="mt-1 text-sm text-destructive">
                    Athugasemd stjórnanda: {t.moderationNote}
                  </p>
                )}

                {/* Pending → suggestion + edit */}
                {t.status === "pending" && (
                  <div className="mt-4 space-y-4">
                    {t.suggestedText && (
                      <div className="rounded-lg border border-amber-500/30 bg-background/40 p-3">
                        <p className="text-sm font-medium">
                          📝 Tillaga — nöfn skipt út fyrir [AAA], [BBB]…
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">
                          {t.suggestedText}
                        </p>
                        <form action={acceptOwnSuggestion} className="mt-3">
                          <input type="hidden" name="id" value={t.id} />
                          <button
                            type="submit"
                            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
                          >
                            Samþykkja tillögu
                          </button>
                        </form>
                      </div>
                    )}

                    <form action={reviseOwnThread} className="space-y-2">
                      <input type="hidden" name="id" value={t.id} />
                      <label className="text-sm font-medium">Breyta texta</label>
                      <textarea
                        name="content"
                        defaultValue={t.content}
                        rows={5}
                        className="block w-full resize-y rounded-lg border border-input bg-surface p-3 text-sm text-foreground/90 focus:border-primary focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium hover:bg-secondary"
                      >
                        Vista og senda til yfirferðar
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
