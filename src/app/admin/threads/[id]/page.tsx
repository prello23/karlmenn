import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Flag, Search, Pin, Lock, Trash2, EyeOff, Eye } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteThread,
  deleteReply,
  clearReplyFlag,
  toggleThreadFlag,
  toggleThreadHidden,
  approveThread,
  rejectThread,
  updateThreadContent,
} from "@/app/admin/actions";
import { authorLabel } from "@/lib/forum";
import { formatDate } from "@/lib/utils";
import { ThreadContentEditor } from "@/components/admin/thread-content-editor";

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
          <h1 className="text-2xl font-bold tracking-tight">
            {thread.title}
            {thread.isHidden && (
              <Badge variant="secondary" className="ml-2">Falinn</Badge>
            )}
            {thread.status === "pending" && (
              <Badge className="ml-2 border-amber-500/40 bg-amber-500/15 text-amber-400">
                Bíður samþykktar
              </Badge>
            )}
            {thread.status === "rejected" && (
              <Badge variant="destructive" className="ml-2">
                Hafnað
              </Badge>
            )}
          </h1>
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
          <form action={toggleThreadHidden}>
            <input type="hidden" name="id" value={thread.id} />
            <Button type="submit" variant={thread.isHidden ? "default" : "outline"} size="sm">
              {thread.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {thread.isHidden ? "Birta þráð" : "Fela þráð"}
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

      {/* AI content analysis (GPT) — shown whenever a verdict was stored */}
      {(() => {
        let ai: {
          safe?: boolean;
          confidence?: number;
          categories?: string[];
          reasoning?: string;
          suggestedAction?: string;
          provider?: string;
          error?: boolean;
        } | null = null;
        try {
          ai = thread.aiAnalysis ? JSON.parse(thread.aiAnalysis)?.ai ?? null : null;
        } catch {
          ai = null;
        }
        if (!ai) return null;

        if (ai.error) {
          return (
            <Card className="mt-6 border-destructive/40">
              <CardHeader>
                <CardTitle className="text-base text-destructive">
                  AI greining
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-destructive">
                  AI greining mistókst — handvirk yfirferð nauðsynleg.
                </p>
              </CardContent>
            </Card>
          );
        }

        return (
          <Card className="mt-6 border-primary/30">
            <CardHeader>
              <CardTitle className="text-base">AI mat á efni</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {ai.safe ? (
                  <Badge className="border-emerald-500/40 bg-emerald-500/15 text-emerald-400">
                    AI mat: Leyfilegt ✅
                  </Badge>
                ) : (
                  <Badge variant="destructive">AI mat: Hafnað ❌</Badge>
                )}
                {typeof ai.confidence === "number" && (
                  <Badge variant="secondary">Vissa: {ai.confidence}%</Badge>
                )}
                {ai.suggestedAction && (
                  <Badge variant="secondary">
                    Tillaga: {ai.suggestedAction}
                  </Badge>
                )}
                {ai.provider && (
                  <span className="text-xs text-muted-foreground">
                    {ai.provider}
                  </span>
                )}
              </div>
              {ai.categories && ai.categories.length > 0 && (
                <p className="text-sm">
                  Flokkar:{" "}
                  {ai.categories.map((c) => (
                    <span
                      key={c}
                      className="mx-0.5 inline-block rounded bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {c}
                    </span>
                  ))}
                </p>
              )}
              {ai.reasoning && (
                <p className="whitespace-pre-wrap text-sm text-foreground/90">
                  {ai.reasoning}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Moderation — anything not yet approved */}
      {thread.status !== "approved" && (
        <Card className="mt-6 border-amber-500/40">
          <CardHeader>
            <CardTitle className="text-base text-amber-400">
              Yfirferð efnis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              let reasons: string[] = [];
              try {
                reasons = thread.aiAnalysis
                  ? (JSON.parse(thread.aiAnalysis)?.reasons ?? [])
                  : [];
              } catch {
                reasons = [];
              }
              return reasons.length > 0 ? (
                <ul className="list-inside list-disc text-sm text-amber-200">
                  {reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              ) : null;
            })()}
            {thread.flaggedNames && (
              <p className="text-sm">
                Möguleg nöfn:{" "}
                {(JSON.parse(thread.flaggedNames) as string[]).map((n) => (
                  <span
                    key={n}
                    className="mx-0.5 inline-block rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-medium text-amber-200"
                  >
                    {n}
                  </span>
                ))}
              </p>
            )}

            {/* Original (left) vs suggested [AAA] (right) */}
            {thread.suggestedText && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Upprunalegur texti
                  </p>
                  <p className="whitespace-pre-wrap rounded-lg border border-border bg-surface/40 p-3 text-sm text-foreground/90">
                    {thread.content}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tillaga (nöfn fjarlægð)
                  </p>
                  <p className="whitespace-pre-wrap rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-foreground/90">
                    {thread.suggestedText}
                  </p>
                  <form action={updateThreadContent} className="mt-2">
                    <input type="hidden" name="id" value={thread.id} />
                    <input type="hidden" name="title" value={thread.title} />
                    <input type="hidden" name="content" value={thread.suggestedText} />
                    <Button type="submit" variant="outline" size="sm">
                      Nota tillögu sem texta
                    </Button>
                  </form>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <form action={approveThread}>
                <input type="hidden" name="id" value={thread.id} />
                <Button type="submit" variant="success" size="sm">
                  Samþykkja og birta
                </Button>
              </form>
              <form action={rejectThread} className="flex items-center gap-2">
                <input type="hidden" name="id" value={thread.id} />
                <input
                  name="note"
                  placeholder="Athugasemd til notanda (valfrjálst)"
                  className="h-9 w-64 rounded-md border border-input bg-surface px-2 text-sm"
                />
                <Button type="submit" variant="outline" size="sm">
                  Hafna og láta vita
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Public content — editable by admin (remove/replace names) */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">
            Texti þráðar {thread.status === "approved" ? "(birtur)" : "(óbirtur)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ThreadContentEditor
            id={thread.id}
            title={thread.title}
            content={thread.content}
          />
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
