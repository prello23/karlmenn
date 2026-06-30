"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  KeyRound,
  Trash2,
  Save,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type EditableUser = {
  id: string;
  name: string;
  displayName: string | null;
  email: string;
  role: string;
  approvalStatus: string;
  emailVerified: boolean;
};

const ROLES = ["USER", "MODERATOR", "ADMIN"];
const STATUSES: [string, string][] = [
  ["APPROVED", "Samþykkt"],
  ["PENDING_APPROVAL", "Bíður"],
  ["REJECTED", "Hafnað"],
];

function Msg({ ok, text }: { ok: boolean; text: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm",
        ok ? "text-green-500" : "text-destructive",
      )}
    >
      {ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      {text}
    </span>
  );
}

export function UserDetailActions({ user }: { user: EditableUser }) {
  const router = useRouter();

  const [name, setName] = useState(user.name);
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [role, setRole] = useState(user.role);
  const [approvalStatus, setApprovalStatus] = useState(user.approvalStatus);
  const [emailVerified, setEmailVerified] = useState(user.emailVerified);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          displayName: displayName || null,
          role,
          approvalStatus,
          emailVerified,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setSaveMsg({ ok: true, text: "Vistað" });
        router.refresh();
      } else {
        setSaveMsg({ ok: false, text: d.error ?? "Vistun mistókst" });
      }
    } catch {
      setSaveMsg({ ok: false, text: "Vistun mistókst" });
    } finally {
      setSaving(false);
    }
  }

  async function resetPassword() {
    setResetting(true);
    setResetMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: "POST",
      });
      const d = await res.json().catch(() => ({}));
      setResetMsg(
        d.success
          ? { ok: true, text: `Nýtt lykilorð sent á ${d.email}` }
          : { ok: false, text: d.error ?? "Sending mistókst" },
      );
    } catch {
      setResetMsg({ ok: false, text: "Sending mistókst" });
    } finally {
      setResetting(false);
    }
  }

  async function doDelete() {
    setDeleting(true);
    setDeleteMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        router.push("/admin/notendur");
        router.refresh();
      } else {
        setDeleteMsg(d.error ?? "Eyðing mistókst");
        setDeleting(false);
      }
    } catch {
      setDeleteMsg("Eyðing mistókst");
      setDeleting(false);
    }
  }

  const inputCls =
    "h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm text-foreground focus:border-primary focus:outline-none";

  return (
    <div className="space-y-6">
      {/* Edit info */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-lg font-semibold text-primary">
          Breyta upplýsingum
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Nafn</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Gælunafn</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Hlutverk</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputCls}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Staða</span>
            <select
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value)}
              className={inputCls}
            >
              {STATUSES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={emailVerified}
            onChange={(e) => setEmailVerified(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Netfang staðfest
        </label>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Vista breytingar
          </button>
          {saveMsg && <Msg ok={saveMsg.ok} text={saveMsg.text} />}
        </div>
      </div>

      {/* Password reset */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-1 text-lg font-semibold">Lykilorð</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Býr til nýtt handahófskennt lykilorð og sendir það á {user.email}.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={resetPassword}
            disabled={resetting}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-5 text-sm font-medium hover:bg-secondary disabled:opacity-50"
          >
            {resetting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            Senda nýtt lykilorð
          </button>
          {resetMsg && <Msg ok={resetMsg.ok} text={resetMsg.text} />}
        </div>
      </div>

      {/* Delete */}
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5">
        <h2 className="mb-1 text-lg font-semibold text-destructive">
          Eyða notanda
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Þetta eyðir notandanum og öllum póstum hans varanlega.
        </p>
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-destructive/50 px-5 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Eyða notanda
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">
              Ertu viss? Þetta eyðir notandanum og öllum póstum hans.
            </span>
            <button
              type="button"
              onClick={doDelete}
              disabled={deleting}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-destructive px-5 text-sm font-semibold text-destructive-foreground disabled:opacity-50"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Já, eyða
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="inline-flex h-10 items-center rounded-lg border border-border bg-surface px-5 text-sm font-medium hover:bg-secondary"
            >
              Hætta við
            </button>
          </div>
        )}
        {deleteMsg && <p className="mt-3"><Msg ok={false} text={deleteMsg} /></p>}
      </div>
    </div>
  );
}
