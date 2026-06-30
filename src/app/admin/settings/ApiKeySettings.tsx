"use client";

import { useEffect, useState } from "react";
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type KeyInfo = {
  provider: string;
  label: string;
  configured: boolean;
  masked: string;
};

function KeyCard({ info, onSaved }: { info: KeyInfo; onSaved: () => void }) {
  const [value, setValue] = useState(info.masked);
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  async function save() {
    setSaving(true);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/settings/api-keys/${info.provider}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: value }),
      });
      if (res.ok) {
        setResult({ ok: true, msg: "Lykill vistaður" });
        onSaved();
      } else {
        const d = await res.json().catch(() => ({}));
        setResult({ ok: false, msg: d.error ?? "Vistun mistókst" });
      }
    } finally {
      setSaving(false);
    }
  }

  async function test() {
    setTesting(true);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/settings/api-keys/${info.provider}/test`, {
        method: "POST",
      });
      const d = await res.json();
      setResult(
        d.success
          ? { ok: true, msg: "Tenging virkar!" }
          : { ok: false, msg: d.error ?? "Tenging mistókst" },
      );
    } catch {
      setResult({ ok: false, msg: "Tenging mistókst" });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold">🤖 {info.label}</h3>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-sm",
            info.configured ? "text-green-500" : "text-muted-foreground",
          )}
        >
          {info.configured ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Lykill stilltur
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4" /> Enginn lykill
            </>
          )}
        </span>
      </div>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="sk-..."
          className="h-10 w-full rounded-lg border border-input bg-surface px-3 pr-10 text-sm focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={show ? "Fela" : "Sýna"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Vista
        </button>
        <button
          type="button"
          onClick={test}
          disabled={testing}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium hover:bg-secondary disabled:opacity-50"
        >
          {testing && <Loader2 className="h-4 w-4 animate-spin" />}
          Prófa tengingu
        </button>
        {result && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-sm",
              result.ok ? "text-green-500" : "text-destructive",
            )}
          >
            {result.ok ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {result.msg}
          </span>
        )}
      </div>
    </div>
  );
}

export function ApiKeySettings() {
  const [keys, setKeys] = useState<KeyInfo[] | null>(null);

  function load() {
    fetch("/api/admin/settings/api-keys")
      .then((r) => r.json())
      .then((d) => setKeys(d.keys))
      .catch(() => setKeys([]));
  }

  useEffect(load, []);

  if (!keys) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Hleð...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {keys.map((k) => (
        <KeyCard key={k.provider} info={k} onSaved={load} />
      ))}
    </div>
  );
}
