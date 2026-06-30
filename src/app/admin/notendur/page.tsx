import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approveUser, rejectUser } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";
import { GenderBadge } from "@/components/admin/gender-badge";
import { UsersTable, type AdminUserRow } from "@/components/admin/users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [pending, users] = await Promise.all([
    prisma.user
      .findMany({
        where: { approvalStatus: "PENDING_APPROVAL", role: { not: "ADMIN" } },
        orderBy: { createdAt: "desc" },
      })
      .catch(() => []),
    prisma.user
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 500,
        include: { _count: { select: { threads: true, replies: true } } },
      })
      .catch(() => []),
  ]);

  // Serialize to a plain shape for the client table (dates → ISO strings).
  const rows: AdminUserRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    displayName: u.displayName,
    email: u.email,
    role: u.role,
    approvalStatus: u.approvalStatus,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    genderAssessment: u.genderAssessment,
    genderAssessmentScore: u.genderAssessmentScore,
    postCount: u._count.threads + u._count.replies,
  }));

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Notendur</h1>
      <p className="mt-2 text-muted-foreground">
        Umsjón með aðgöngum og hlutverkum.
      </p>

      {/* Pending approval */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          Notendur sem bíða samþykkis
          {pending.length > 0 && (
            <Badge variant="destructive">{pending.length}</Badge>
          )}
        </h2>
        {pending.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-border bg-surface/30 p-6 text-center text-sm text-muted-foreground">
            Engir notendur bíða samþykkis.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {pending.map((u) => (
              <div
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`/admin/notendur/${u.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {u.name || u.email}
                    </a>
                    <GenderBadge
                      assessment={u.genderAssessment}
                      score={u.genderAssessmentScore}
                      details={u.genderAssessmentDetails}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {u.email}
                    {u.displayName ? ` · ${u.displayName}` : ""} · Skráði sig{" "}
                    {formatDate(u.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={approveUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <Button type="submit" variant="success" size="sm">
                      Samþykkja
                    </Button>
                  </form>
                  <form action={rejectUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <Button type="submit" variant="outline" size="sm">
                      Hafna
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* All users */}
      <h2 className="mt-10 text-xl font-semibold">Allir notendur</h2>
      <UsersTable users={rows} />
    </div>
  );
}
