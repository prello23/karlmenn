import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, ExternalLink } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { GenderBadge } from "@/components/admin/gender-badge";
import { UserDetailActions } from "@/components/admin/user-detail";
import { togglePostHidden } from "./actions";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") return <Badge variant="success">Samþykkt</Badge>;
  if (status === "REJECTED") return <Badge variant="destructive">Hafnað</Badge>;
  return <Badge variant="outline">Bíður</Badge>;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user
    .findUnique({
      where: { id },
      include: {
        threads: {
          orderBy: { createdAt: "desc" },
          include: { category: { select: { slug: true, name: true } } },
        },
        _count: { select: { threads: true, replies: true } },
      },
    })
    .catch(() => null);

  if (!user) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/notendur"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Til baka í notendur
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">
          {user.name || user.email}
        </h1>
        <GenderBadge
          assessment={user.genderAssessment}
          score={user.genderAssessmentScore}
          details={user.genderAssessmentDetails}
        />
      </div>

      {/* Info */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="mb-2 text-lg font-semibold text-primary">Upplýsingar</h2>
        <InfoRow label="Netfang">{user.email}</InfoRow>
        <InfoRow label="Nafn">{user.name || "—"}</InfoRow>
        <InfoRow label="Gælunafn">{user.displayName ?? "—"}</InfoRow>
        <InfoRow label="Hlutverk">{user.role}</InfoRow>
        <InfoRow label="Staða">
          <StatusBadge status={user.approvalStatus} />
        </InfoRow>
        <InfoRow label="Staðfest">
          {user.emailVerified ? (
            <Badge variant="success">Já</Badge>
          ) : (
            <Badge variant="outline">Nei</Badge>
          )}
        </InfoRow>
        <InfoRow label="Skráði sig">{formatDate(user.createdAt)}</InfoRow>
        <InfoRow label="Síðast innskráður">
          {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Aldrei"}
        </InfoRow>
        <InfoRow label="Fjöldi pósta">
          {user._count.threads} þræðir · {user._count.replies} svör
        </InfoRow>
        <InfoRow label="IP tala">Ekki skráð</InfoRow>
      </div>

      {/* Edit / reset / delete */}
      <div className="mt-6">
        <UserDetailActions
          user={{
            id: user.id,
            name: user.name,
            displayName: user.displayName,
            email: user.email,
            role: user.role,
            approvalStatus: user.approvalStatus,
            emailVerified: user.emailVerified,
          }}
        />
      </div>

      {/* Threads */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          Þræðir notanda ({user.threads.length})
        </h2>
        {user.threads.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-border bg-surface/30 p-6 text-center text-sm text-muted-foreground">
            Þessi notandi hefur ekki birt neina þræði.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {user.threads.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/samfelag/${t.category.slug}/${t.id}`}
                    className="inline-flex items-center gap-1 font-medium hover:text-primary hover:underline"
                  >
                    {t.title || "(án titils)"}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {t.category.name} · {formatDate(t.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {t.isHidden ? (
                    <Badge variant="outline">Falið</Badge>
                  ) : (
                    <Badge variant="success">Sýnilegt</Badge>
                  )}
                  <form action={togglePostHidden}>
                    <input type="hidden" name="threadId" value={t.id} />
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                    >
                      {t.isHidden ? (
                        <>
                          <Eye className="h-3.5 w-3.5" /> Sýna
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5" /> Fela
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
