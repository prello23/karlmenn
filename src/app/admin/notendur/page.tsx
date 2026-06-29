import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { updateUserRole, deleteUser } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ROLES = ["USER", "MODERATOR", "ADMIN"] as const;

export default async function AdminUsersPage() {
  const users = await prisma.user
    .findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { _count: { select: { threads: true, replies: true } } },
    })
    .catch(() => []);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Notendur</h1>
      <p className="mt-2 text-muted-foreground">
        Umsjón með aðgöngum og hlutverkum.
      </p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-surface/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Netfang</th>
              <th className="px-4 py-3 font-medium">Gælunafn</th>
              <th className="px-4 py-3 font-medium">Staðfest</th>
              <th className="px-4 py-3 font-medium">Hlutverk</th>
              <th className="px-4 py-3 font-medium">Virkni</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Engir notendur.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{u.email}</td>
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
