import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  updateUserRole,
  deleteUser,
  approveUser,
  rejectUser,
} from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ROLES = ["USER", "MODERATOR", "ADMIN"] as const;

function ApprovalBadge({ status }: { status: string }) {
  if (status === "APPROVED") return <Badge variant="success">Samþykkt</Badge>;
  if (status === "REJECTED") return <Badge variant="destructive">Hafnað</Badge>;
  return <Badge variant="outline">Bíður</Badge>;
}

/** Builds a human-readable tooltip from the stored assessment JSON. */
function assessmentTooltip(score: number | null, details: string | null): string {
  const lines: string[] = [];
  if (score != null) lines.push(`Skor: ${(score * 100).toFixed(0)}% líklega karl`);
  if (details) {
    try {
      const d = JSON.parse(details);
      const reasons: string[] = d?.heuristic?.reasons ?? [];
      lines.push(...reasons);
      if (d?.ai?.reasoning) lines.push(`AI: ${d.ai.reasoning}`);
    } catch {
      /* ignore malformed JSON */
    }
  }
  return lines.join("\n");
}

function GenderBadge({
  assessment,
  score,
  details,
}: {
  assessment: string;
  score: number | null;
  details: string | null;
}) {
  const tooltip = assessmentTooltip(score, details);
  const pct = score != null ? ` ${(score * 100).toFixed(0)}%` : "";
  const map: Record<string, { emoji: string; label: string; cls: string }> = {
    LIKELY_MALE: {
      emoji: "🟢",
      label: "Líklega karl",
      cls: "border-success/40 bg-success/10 text-success",
    },
    LIKELY_FEMALE: {
      emoji: "🔴",
      label: "Líklega kona",
      cls: "border-destructive/40 bg-destructive/10 text-destructive",
    },
    UNCERTAIN: {
      emoji: "🟡",
      label: "Óviss",
      cls: "border-border bg-surface text-muted-foreground",
    },
  };
  const m = map[assessment] ?? map.UNCERTAIN;
  return (
    <span
      title={tooltip || undefined}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${m.cls}`}
    >
      {m.emoji} {m.label}
      {pct}
    </span>
  );
}

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
        take: 200,
        include: { _count: { select: { threads: true, replies: true } } },
      })
      .catch(() => []),
  ]);

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
                    <p className="font-medium">{u.name || u.email}</p>
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
      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nafn</th>
              <th className="px-4 py-3 font-medium">Netfang</th>
              <th className="px-4 py-3 font-medium">Kyn (mat)</th>
              <th className="px-4 py-3 font-medium">Gælunafn</th>
              <th className="px-4 py-3 font-medium">Staðfest</th>
              <th className="px-4 py-3 font-medium">Staða</th>
              <th className="px-4 py-3 font-medium">Hlutverk</th>
              <th className="px-4 py-3 font-medium">Virkni</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                  Engir notendur.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{u.name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <GenderBadge
                      assessment={u.genderAssessment}
                      score={u.genderAssessmentScore}
                      details={u.genderAssessmentDetails}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {u.displayName ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {u.emailVerified ? (
                      <Badge variant="success">Já</Badge>
                    ) : (
                      <Badge variant="outline">Nei</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ApprovalBadge status={u.approvalStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="rounded-md border border-input bg-surface px-2 py-1 text-sm"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Vista
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {u._count.threads} þræðir · {u._count.replies} svör
                    <br />
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteUser}>
                      <input type="hidden" name="id" value={u.id} />
                      <button
                        type="submit"
                        className="text-xs font-medium text-destructive hover:underline"
                      >
                        Eyða
                      </button>
                    </form>
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
