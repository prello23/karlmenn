import { Trash2 } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { addPerpetrator, removePerpetrator } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminRegistryPage() {
  const entries = await prisma.perpetratorRegistry
    .findMany({ orderBy: { name: "asc" } })
    .catch(() => []);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Nafnaskrá</h1>
      <p className="mt-2 text-muted-foreground">
        Skrá sem knýr <code>/nafnaleit</code>. Notendur fá aðeins Já/Nei — listinn
        er aldrei birtur opinberlega.
      </p>

      {/* Add */}
      <form action={addPerpetrator} className="mt-6 flex max-w-md gap-2">
        <Input name="name" placeholder="Bæta nafni við skrána..." required />
        <Button type="submit">Bæta við</Button>
      </form>

      {/* List */}
      <div className="mt-8 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nafn</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Bætt við</th>
              <th className="px-4 py-3 font-medium">Af</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  Engin nöfn í skránni.
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{e.name}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {formatDate(e.addedAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {e.addedBy ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={removePerpetrator}>
                      <input type="hidden" name="id" value={e.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
