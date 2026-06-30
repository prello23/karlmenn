import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSetting } from "@/lib/settings";
import { formatDate } from "@/lib/utils";
import {
  applyThreadSuggestion,
  ignoreThread,
  editThreadContent,
  applyReplySuggestion,
  ignoreReply,
  editReplyContent,
  setModerationMode,
} from "@/app/admin/moderation/actions";

export const dynamic = "force-dynamic";

type Suggestion = {
  has_names: boolean;
  names_found: { original: string; replacement: string; context: string }[];
  redacted: string;
};

function parseSuggestions(raw: string | null): Suggestion | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Suggestion;
  } catch {
    return null;
  }
}

/** Render text with detected names highlighted. */
function Highlighted({
  text,
  names,
}: {
  text: string;
  names: { original: string }[];
}) {
  if (names.length === 0) return <>{text}</>;
  const escaped = names
    .map((n) => n.original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .filter(Boolean);
  if (escaped.length === 0) return <>{text}</>;
  const re = new RegExp(`(${escaped.join("|")})`, "g");
  const parts = text.split(re);
  return (
    <>
      {parts.map((part, i) =>
        names.some((n) => n.original === part) ? (
          <mark
            key={i}
            className="rounded bg-destructive/30 px-0.5 text-foreground"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function ModerationItem({
  kind,
  id,
  title,
  content,
  suggestion,
  createdAt,
  link,
  applyAction,
  ignoreAction,
  editAction,
}: {
  kind: "Þráður" | "Svar";
  id: string;
  title?: string;
  content: string;
  suggestion: Suggestion | null;
  createdAt: Date;
  link: string;
  applyAction: (fd: FormData) => Promise<void>;
  ignoreAction: (fd: FormData) => Promise<void>;
  editAction: (fd: FormData) => Promise<void>;
}) {
  const names = suggestion?.names_found ?? [];
  return (
    <div className="rounded-xl border border-destructive/40 bg-card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="destructive">{kind}</Badge>
          {title && <span className="font-medium">{title}</span>}
          <span className="text-xs text-muted-foreground">
            {formatDate(createdAt)}
          </span>
        </div>
        <Link href={link} className="text-xs text-primary hover:underline">
          Skoða á vefnum
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Núverandi texti
          </p>
          <p className="whitespace-pre-wrap rounded-lg bg-surface/50 p-3 text-sm">
            <Highlighted text={content} names={names} />
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tillaga (nöfn fjarlægð)
          </p>
          <p className="whitespace-pre-wrap rounded-lg bg-success/5 p-3 text-sm">
            {suggestion?.redacted ?? content}
          </p>
        </div>
      </div>

      {names.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Fundin nöfn:{" "}
          {names.map((n, i) => (
            <span key={i}>
              {i > 0 && ", "}
              <span className="text-foreground">{n.original}</span> → {n.replacement}
            </span>
          ))}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <form action={applyAction}>
          <input type="hidden" name="id" value={id} />
          <Button type="submit" variant="success" size="sm">
            Samþykkja tillögu
          </Button>
        </form>
        <form action={ignoreAction}>
          <input type="hidden" name="id" value={id} />
          <Button type="submit" variant="outline" size="sm">
            Hunsa
          </Button>
        </form>
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm text-primary">Breyta handvirkt</summary>
        <form action={editAction} className="mt-2 space-y-2">
          <input type="hidden" name="id" value={id} />
          <textarea
            name="content"
            defaultValue={content}
            className="min-h-[120px] w-full rounded-lg border border-input bg-surface p-3 text-sm"
          />
          <Button type="submit" size="sm">
            Vista breytingu
          </Button>
        </form>
      </details>
    </div>
  );
}

export default async function ModerationPage() {
  const [mode, threads, replies] = await Promise.all([
    getSetting("ai_moderation_mode"),
    prisma.thread
      .findMany({
        where: { needsReview: true },
        orderBy: { createdAt: "desc" },
        include: { category: { select: { slug: true } } },
      })
      .catch(() => []),
    prisma.reply
      .findMany({
        where: { needsReview: true },
        orderBy: { createdAt: "desc" },
        include: { thread: { include: { category: { select: { slug: true } } } } },
      })
      .catch(() => []),
  ]);

  const total = threads.length + replies.length;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Nafnagreining / Efnisyfirferð
          </h1>
          <p className="mt-2 text-muted-foreground">
            Efni sem inniheldur hugsanleg nöfn og bíður yfirferðar.
          </p>
        </div>
        <form action={setModerationMode} className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sjálfvirk nafnagreining:</span>
          <input type="hidden" name="mode" value={mode === "auto" ? "manual" : "auto"} />
          <Button type="submit" variant={mode === "auto" ? "default" : "outline"} size="sm">
            {mode === "auto" ? "ON (sjálfvirk)" : "OFF (handvirk)"}
          </Button>
        </form>
      </div>

      <div className="mt-8 space-y-4">
        {total === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface/30 p-10 text-center text-muted-foreground">
            Ekkert efni bíður yfirferðar. 🎉
          </p>
        ) : (
          <>
            {threads.map((t) => (
              <ModerationItem
                key={`t-${t.id}`}
                kind="Þráður"
                id={t.id}
                title={t.title}
                content={t.content}
                suggestion={parseSuggestions(t.aiSuggestions)}
                createdAt={t.createdAt}
                link={`/samfelag/${t.category.slug}/${t.id}`}
                applyAction={applyThreadSuggestion}
                ignoreAction={ignoreThread}
                editAction={editThreadContent}
              />
            ))}
            {replies.map((r) => (
              <ModerationItem
                key={`r-${r.id}`}
                kind="Svar"
                id={r.id}
                content={r.content}
                suggestion={parseSuggestions(r.aiSuggestions)}
                createdAt={r.createdAt}
                link={`/samfelag/${r.thread.category.slug}/${r.threadId}`}
                applyAction={applyReplySuggestion}
                ignoreAction={ignoreReply}
                editAction={editReplyContent}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
