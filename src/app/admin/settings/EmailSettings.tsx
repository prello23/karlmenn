"use client";

import { useEffect, useState } from "react";
import { Loader2, ChevronDown, CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type Cfg = {
  email_from: string;
  email_from_name: string;
  email_smtp_host: string;
  email_smtp_port: string;
  email_smtp_user: string;
  email_smtp_pass: string;
  usingSendmail: boolean;
};

const FIELDS: { key: keyof Cfg; label: string; placeholder?: string; type?: string }[] = [
  { key: "email_from", label: "Sendandi (EMAIL_FROM)", placeholder: "info@ekkieinn.is" },
  { key: "email_from_name", label: "Nafn sendanda", placeholder: "EkkiEinn.is" },
  { key: "email_smtp_host", label: "SMTP þjónn (valkvætt)", placeholder: "Staðbundið sendmail ef tómt" },
  { key: "email_smtp_port", label: "SMTP port", placeholder: "587" },
  { key: "email_smtp_user", label: "SMTP notandi", placeholder: "(valkvætt)" },
  { key: "email_smtp_pass", label: "SMTP lykilorð", placeholder: "(valkvætt)", type: "password" },
];

export function EmailSettings() {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/email")
      .then((r) => r.json())
      .then(setCfg)
      .catch(() => setCfg(null));
  }, []);

  function update(key: keyof Cfg, value: string) {
    setCfg((c) => (c ? { ...c, [key]: value } : c));
    setSaved(false);
  }

  async function save() {
    if (!cfg) return;
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/settings/email", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(cfg),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function sendTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/settings/email/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to: testTo }),
      });
      const data = await res.json();
      setTestResult(
        data.success
          ? { ok: true, msg: "Prófunarpóstur sendur!" }
          : { ok: false, msg: data.error ?? "Sending mistókst" },
      );
    } catch {
      setTestResult({ ok: false, msg: "Sending mistókst" });
    } finally {
      setTesting(false);
    }
  }

  if (!cfg) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Hleð...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-1 text-lg font-semibold text-primary">Tölvupóststillingar</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {cfg.usingSendmail
            ? "Notar staðbundinn póstþjón (sendmail). Settu SMTP þjón hér að neðan til að nota annan sendanda."
            : "SMTP þjónn stilltur."}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1 block text-sm font-medium">{f.label}</span>
              <input
                type={f.type ?? "text"}
                value={String(cfg[f.key] ?? "")}
                placeholder={f.placeholder}
                onChange={(e) => update(f.key, e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </label>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Vista
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm text-green-500">
              <CheckCircle2 className="h-4 w-4" /> Vistað
            </span>
          )}
        </div>
      </div>

      {/* Test email */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 text-base font-semibold">Senda prófunarpóst</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={testTo}
            placeholder="netfang@example.com"
            onChange={(e) => setTestTo(e.target.value)}
            className="h-10 flex-1 rounded-lg border border-input bg-surface px-3 text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={sendTest}
            disabled={testing || !testTo}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 text-sm font-medium hover:bg-secondary disabled:opacity-50"
          >
            {testing && <Loader2 className="h-4 w-4 animate-spin" />}
            Senda prófun
          </button>
        </div>
        {testResult && (
          <p
            className={cn(
              "mt-3 inline-flex items-center gap-1 text-sm",
              testResult.ok ? "text-green-500" : "text-destructive",
            )}
          >
            {testResult.ok ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {testResult.msg}
          </p>
        )}
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-border bg-card">
        <button
          type="button"
          onClick={() => setShowInstructions((s) => !s)}
          className="flex w-full items-center justify-between p-5 text-left"
        >
          <span className="font-medium">📧 Tölvupóststillingar — leiðbeiningar</span>
          <ChevronDown
            className={cn("h-5 w-5 transition-transform", showInstructions && "rotate-180")}
          />
        </button>
        {showInstructions && (
          <div className="border-t border-border p-5 text-sm leading-relaxed text-muted-foreground">
            <p className="mb-2">
              EkkiEinn.is notar staðbundinn póstþjón (postfix/sendmail) til að senda
              tölvupóst.
            </p>
            <p className="mb-1 font-medium text-foreground">Núverandi uppsetning:</p>
            <ul className="mb-2 list-inside list-disc space-y-1">
              <li>Sendandi: info@ekkieinn.is</li>
              <li>Þjónn: Staðbundinn sendmail</li>
              <li>DNS: MX og SPF færslur stilltar á ForwardEmail.net</li>
              <li>Móttaka: info@ekkieinn.is → elvarpa@gmail.com (áframsending)</li>
            </ul>
            <p>
              Til að breyta sendanda eða bæta við SMTP þjóni, breyttu stillingum hér að
              ofan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
