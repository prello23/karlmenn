import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Flag, Search, Pin, Lock, Trash2 } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteThread,
  deleteReply,
  clearReplyFlag,
  toggleThreadFlag,
} from "@/app/admin/actions";
import { authorLabel } from "@/lib/forum";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const authorSel = {
  select: { displayName: true, username: true, isAnonymous: true, email: true },
} as const;

export default async function AdminThreadDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const thread = await prisma.thread
    .findUnique({
      where: { id },
      include: {
        category: true,
        author: authorSel,
        replies: { orderBy: { createdAt: "asc" }, include: { author: authorSel } },
      },
    })
    .catch(() => null);

  if (!thread) notFound();

  return (
    <div>
      <Link
        href="/admin/threads"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Til baka í þræði
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{thread.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {thread.category.name} · {formatDate(thread.createdAt)} ·{" "}
            {authorLabel(thread.author, thread.isAnonymous)}
            {thread.author?.email ? ` (${thread.author.email})` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={toggleThreadFlag}>
            <input type="hidden" name="id" value={thread.id} />
            <input type="hidden" name="field" value="isPinned" />
            <Button type="submit" variant="outline" size="sm">
              <Pin className="h-4 w-4" />
              {thread.isPinned ? "Aftengja" : "Festa"}
            </Button>
          </form>
          <form action={toggleThreadFlag}>
            <input type="hidden" name="id" value={thread.id} />
            <input type="hidden" name="field" value="isLocked" />
            <Button type="submit" variant="outline" size="sm">
              <Lock className="h-4 w-4" />
              {thread.isLocked ? "Opna" : "Læsa"}
            </Button>
          </form>
          <form action={deleteThread}>
            <input type="hidden" name="id" value={thread.id} />
            <Button type="submit" variant="destructive" size="sm">
              <Trash2 className="h-4 w-4" />
              Eyða þræði
            </Button>
          </form>
        </div>
      </div>

      {/* Private case info — admin only */}
      <Card className="mt-6 border-primary/30">
        <CardHeader>
          <CardTitle className="text-base">
            Trúnaðarupplýsingar (aðeins admin)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Nafn þolanda
            </p>
            <p className="mt-1 font-medium">
              {thread.victimName || "— ekki skráð —"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Nafn geranda
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="font-medium">
                {thread.perpetratorName || "— ekki skráð —"}
              </p>
              {thread.perpetratorName && (
                <Link
                  href={`/admin/threads?q=${encodeURIComponent(thread.perpetratorName)}`}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Search className="h-3 w-3" />
                  Tengd mál
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Public content */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Texti þráðar (birtur)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {thread.content}
          </p>
        </CardContent>
      </Card>

      {/* Replies */}
      <h2 className="mt-8 text-lg font-semibold">Svör ({thread.replies.length})</h2>
      <div className="mt-4 space-y-3">
        {thread.replies.map((reply) => (
          <div
            key={reply.id}
            className={`rounded-xl border p-4 ${
              reply.flagged
                ? "border-destructive/40 bg-destructive/5"
                : "border-border bg-card"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {authorLabel(reply.author)}
                </span>
                <span>{formatDate(reply.createdAt)}</span>
                {reply.flagged && (
                  <Badge variant="destructive">
                    <Flag className="mr-1 h-3 w-3" />
                    {reply.flagReason ?? "Flaggað"}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                {reply.flagged && (
                  <form action={clearReplyFlag}>
                    <input type="hidden" name="id" value={reply.id} />
                    <input type="hidden" name="threadId" value={thread.id} />
                    <button
                      type="submit"
                      className="text-xs font-medium text-success hover:underline"
                    >
                      Hreinsa flagg
                    </button>
                  </form>
                )}
                <form action={deleteReply}>
                  <input type="hidden" name="id" value={reply.id} />
                  <input type="hidden" name="threadId" value={thread.id} />
                  <button
                    type="submit"
                    className="text-xs font-medium text-destructive hover:underline"
                  >
                    Eyða
                  </button>
                </form>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">
              {reply.content}
            </p>
          </div>
        ))}
        {thread.replies.length === 0 && (
          <p className="text-sm text-muted-foreground">Engin svör.</p>
        )}
      </div>
    </div>
  );
}
