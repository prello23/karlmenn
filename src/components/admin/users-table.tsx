"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { GenderBadge } from "@/components/admin/gender-badge";
import { formatDate, cn } from "@/lib/utils";

export type AdminUserRow = {
  id: string;
  name: string;
  displayName: string | null;
  email: string;
  role: string;
  approvalStatus: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  genderAssessment: string;
  genderAssessmentScore: number | null;
  postCount: number;
};

type SortKey = "name" | "email" | "approvalStatus" | "role" | "createdAt" | "postCount";

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") return <Badge variant="success">Samþykkt</Badge>;
  if (status === "REJECTED") return <Badge variant="destructive">Hafnað</Badge>;
  return <Badge variant="outline">Bíður</Badge>;
}

export function UsersTable({ users }: { users: AdminUserRow[] }) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [asc, setAsc] = useState(false);

  const sorted = useMemo(() => {
    const copy = [...users];
    copy.sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      switch (sortKey) {
        case "postCount":
          av = a.postCount;
          bv = b.postCount;
          break;
        case "createdAt":
          av = a.createdAt;
          bv = b.createdAt;
          break;
        case "name":
          av = (a.name || a.email).toLowerCase();
          bv = (b.name || b.email).toLowerCase();
          break;
        default:
          av = String(a[sortKey]).toLowerCase();
          bv = String(b[sortKey]).toLowerCase();
      }
      if (av < bv) return asc ? -1 : 1;
      if (av > bv) return asc ? 1 : -1;
      return 0;
    });
    return copy;
  }, [users, sortKey, asc]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setAsc((s) => !s);
    else {
      setSortKey(key);
      setAsc(key === "name" || key === "email"); // text asc, others desc
    }
  }

  function Th({ label, k }: { label: string; k: SortKey }) {
    return (
      <th className="px-4 py-3 font-medium">
        <button
          type="button"
          onClick={() => toggleSort(k)}
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          {label}
          {sortKey === k &&
            (asc ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            ))}
        </button>
      </th>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[860px] text-sm">
        <thead className="bg-surface/50 text-left text-muted-foreground">
          <tr>
            <Th label="Nafn" k="name" />
            <Th label="Netfang" k="email" />
            <th className="px-4 py-3 font-medium">Kyn (mat)</th>
            <Th label="Staða" k="approvalStatus" />
            <Th label="Hlutverk" k="role" />
            <th className="px-4 py-3 font-medium">Staðfest</th>
            <Th label="Pósta" k="postCount" />
            <Th label="Skráði sig" k="createdAt" />
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                Engir notendur.
              </td>
            </tr>
          ) : (
            sorted.map((u) => (
              <tr
                key={u.id}
                onClick={() => router.push(`/admin/notendur/${u.id}`)}
                className={cn(
                  "cursor-pointer border-t border-border transition-colors hover:bg-surface/50",
                )}
              >
                <td className="px-4 py-3 font-medium">{u.name || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <GenderBadge
                    assessment={u.genderAssessment}
                    score={u.genderAssessmentScore}
                    details={null}
                  />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={u.approvalStatus} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium">{u.role}</span>
                </td>
                <td className="px-4 py-3">
                  {u.emailVerified ? (
                    <Badge variant="success">Já</Badge>
                  ) : (
                    <Badge variant="outline">Nei</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.postCount}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(u.createdAt)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <p className="border-t border-border bg-surface/30 px-4 py-2 text-xs text-muted-foreground">
        Smelltu á notanda til að sjá nánari upplýsingar.
      </p>
    </div>
  );
}
