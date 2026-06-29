import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquare, ArrowUp, Pin, ArrowLeft, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewThreadForm } from "@/components/forum/new-thread-form";
import { getCategoryBySlug, getThreads, authorLabel } from "@/lib/forum";
import { requireUser } from "@/lib/auth-helpers";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return {
    title: category?.name ?? "Flokkur",
    description: category?.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireUser();
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const threads = await getThreads(category.id);

  return (
    <section className="py-12">
      <div className="container max-w-4xl">
        <Link
          href="/samfelag"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Til baka í samfélagið
        </Link>

        <div className="mt-6 flex items-start gap-4">
          <span className="text-4xl">{category.icon}</span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {category.name}
              </h1>
              {category.restricted && (
                <Badge variant="outline">
                  <Lock className="mr-1 h-3 w-3" />
                  Þarf umsókn
                </Badge>
              )}
            </div>
            <p className="mt-2 text-muted-foreground">{category.description}</p>
          </div>
        </div>

        {/* Threads */}
        <div className="mt-10 space-y-3">
          {threads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface/30 p-10 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-medium">Engir þræðir enn</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Vertu fyrstur til að byrja umræðu hér.
              </p>
            </div>
          ) : (
            threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/samfelag/${slug}/${thread.id}`}
                className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-surface"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {thread.isPinned && (
                        <Pin className="h-4 w-4 text-primary" />
                      )}
                      <h3 className="truncate font-semibold">{thread.title}</h3>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {thread.content}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{authorLabel(thread.author, thread.isAnonymous)}</span>
                      <span>{formatDate(thread.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <ArrowUp className="h-3.5 w-3.5" />
                      {thread.upvotes}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {thread._count.replies}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* New thread */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Byrja nýja umræðu</CardTitle>
            <CardDescription>
              {category.restricted
                ? "Þetta svæði krefst samþykkis. Færslur eru yfirfarnar af umsjónarmönnum áður en þær birtast."
                : "Deildu reynslu þinni eða spurningu. Nöfn eru fjarlægð sjálfkrafa."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewThreadForm categorySlug={slug} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
