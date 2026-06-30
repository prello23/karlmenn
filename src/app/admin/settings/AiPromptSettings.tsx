"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";

export function AiPromptSettings() {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [isDefault, setIsDefault] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [testInput, setTestInput] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  function load() {
    fetch("/api/admin/settings/ai-prompt")
      .then((r) => r.json())
      .then((d) => {
        setPrompt(d.prompt);
        setIsDefault(d.isDefault);
      })
      .catch(() => setPrompt(""));
  }

  useEffect(load, []);

  async function save() {
    if (prompt == null) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings/ai-prompt", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) {
        setSaved(true);
        setIsDefault(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings/ai-prompt", { method: "DELETE" });
      const d = await res.json();
      if (res.ok) {
        setPrompt(d.prompt);
        setIsDefault(true);
      }
    } finally {
      setSaving(false);
    }
  }

  async function runTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/settings/ai-prompt/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ testInput }),
      });
      const d = await res.json();
      setTestResult(
        d.success
          ? { ok: true, text: d.response }
          : { ok: false, text: d.error ?? "Prófun mistókst" },
      );
    } catch {
      setTestResult({ ok: false, text: "Prófun mistókst" });
    } finally {
      setTesting(false);
    }
  }

  if (prompt == null) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Hleð...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">AI kerfis-prompt</h2>
          <span className="text-xs text-muted-foreground">
            {isDefault ? "Sjálfgefið" : "Sérsniðið"}
          </span>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          Kerfis-prompt sem notað er fyrir AI prófanir.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setSaved(false);
          }}
          rows={14}
          spellCheck={false}
          className="block w-full resize-y rounded-lg border border-input bg-surface p-3 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Vista
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium hover:bg-secondary disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" /> Endurstilla
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm text-green-500">
              <CheckCircle2 className="h-4 w-4" /> Vistað
            </span>
          )}
        </div>
      </div>

      {/* Preview / test */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 text-base font-semibold">Prófa prompt</h3>
        <textarea
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
          rows={3}
          placeholder="Sláðu inn prófunartexta..."
          className="block w-full resize-y rounded-lg border border-input bg-surface p-3 text-sm focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={runTest}
          disabled={testing || !testInput.trim()}
          className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-5 text-sm font-medium hover:bg-secondary disabled:opacity-50"
        >
          {testing && <Loader2 className="h-4 w-4 animate-spin" />}
          Prófa
        </button>
        {testResult && (
          <div
            className={cn(
              "mt-3 rounded-lg border p-3 text-sm",
              testResult.ok
                ? "border-border bg-surface text-foreground"
                : "border-destructive/40 bg-destructive/10 text-destructive",
            )}
          >
            {!testResult.ok && <XCircle className="mb-1 inline h-4 w-4" />}
            <pre className="whitespace-pre-wrap break-words font-sans">
              {testResult.text}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
