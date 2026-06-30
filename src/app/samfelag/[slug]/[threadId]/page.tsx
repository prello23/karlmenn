import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUp, MessageSquare, Lock } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { ReplyForm } from "@/components/forum/reply-form";
import { getThread, authorLabel } from "@/lib/forum";
import { requireUser } from "@/lib/auth-helpers";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; threadId: string }>;
}): Promise<Metadata> {
  const { threadId } = await params;
  const thread = await getThread(threadId);
  return { title: thread?.title ?? "Þráður" };
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ slug: string; threadId: string }>;
}) {
  await requireUser();
  const { slug, threadId } = await params;
  const thread = await getThread(threadId);
  if (!thread || thread.isHidden || thread.status !== "PUBLISHED") notFound();

  return (
    <section className="py-12">
      <div className="container max-w-3xl">
        <Link
          href={`/samfelag/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Til baka
        </Link>

        {/* Original post */}
        <article className="mt-6 rounded-2xl border border-border bg-card p-7">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {thread.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {authorLabel(thread.author, thread.isAnonymous)}
            </span>
            <span>{formatDate(thread.createdAt)}</span>
            <span className="inline-flex items-center gap-1">
              <ArrowUp className="h-3.5 w-3.5" />
              {thread.upvotes}
            </span>
          </div>
          <div className="mt-5 whitespace-pre-wrap leading-relaxed text-foreground/90">
            {thread.content}
          </div>
        </article>

        {/* Replies */}
        <div className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            {thread.replies.length} svör
          </h2>
          <Separator className="my-5" />

          <div className="space-y-4">
            {thread.replies.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Engin svör enn. Vertu fyrstur til að svara.
              </p>
            ) : (
              thread.replies.map((reply) => (
                <div
                  key={reply.id}
                  className="rounded-xl border border-border bg-surface/40 p-5"
                >
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {authorLabel(reply.author)}
                    </span>
                    <span>{formatDate(reply.createdAt)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap leading-relaxed text-foreground/90">
                    {reply.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reply form */}
        {thread.isLocked ? (
          <div className="mt-10 flex items-center gap-2 rounded-xl border border-border bg-surface/40 p-5 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            Þessum þræði hefur verið lokað fyrir svörum.
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-border bg-card p-7">
            <h3 className="mb-4 text-lg font-semibold">Skrifa svar</h3>
            <ReplyForm threadId={thread.id} categorySlug={slug} />
          </div>
        )}
      </div>
    </section>
  );
}
