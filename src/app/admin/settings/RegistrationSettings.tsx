"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type Settings = {
  autoApproveEnabled: boolean;
  threshold: number;
  checks: { name: boolean; email: boolean; online: boolean };
  threadNameModeration: boolean;
  hateSpeechKeywords: string;
};

type TestResult = {
  assessment: string;
  scorePercent: number;
  threshold: number;
  wouldAutoApprove: boolean;
  details: {
    breakdown: {
      nameScore: number | null;
      emailScore: number | null;
      onlineScore: number | null;
      finalScore: number;
    };
    reasons: string[];
  };
};

export function RegistrationSettings() {
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [testName, setTestName] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);
  const [test, setTest] = useState<TestResult | null>(null);
  const [testErr, setTestErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/registration")
      .then((r) => r.json())
      .then(setS)
      .catch(() => setS(null));
  }, []);

  async function save() {
    if (!s) return;
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/settings/registration", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(s),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function runTest() {
    setTesting(true);
    setTest(null);
    setTestErr(null);
    try {
      const res = await fetch("/api/admin/settings/registration/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: testName, email: testEmail }),
      });
      const d = await res.json();
      if (res.ok) setTest(d);
      else setTestErr(d.error ?? "Prófun mistókst");
    } catch {
      setTestErr("Prófun mistókst");
    } finally {
      setTesting(false);
    }
  }

  if (!s) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Hleð...
      </div>
    );
  }

  const Check = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => {
          onChange(e.target.checked);
          setSaved(false);
        }}
        className="h-4 w-4 accent-primary"
      />
      {label}
    </label>
  );

  return (
    <div className="space-y-6">
      {/* Auto-approval */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-lg font-semibold text-primary">
          Sjálfvirk samþykki skráningar
        </h2>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={s.autoApproveEnabled}
            onChange={(e) => {
              setS({ ...s, autoApproveEnabled: e.target.checked });
              setSaved(false);
            }}
            className="h-4 w-4 accent-primary"
          />
          Kveikt á sjálfvirku samþykki
        </label>

        <div className="mt-4">
          <label className="block text-sm font-medium">
            Lágmarksskor: <span className="text-primary">{s.threshold}%</span>
          </label>
          <input
            type="range"
            min={50}
            max={100}
            value={s.threshold}
            onChange={(e) => {
              setS({ ...s, threshold: Number(e.target.value) });
              setSaved(false);
            }}
            className="mt-2 w-full accent-primary"
          />
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Athuganir:</p>
          <Check
            label="Nafnagreining (íslensk nafnaskrá)"
            value={s.checks.name}
            onChange={(v) => setS({ ...s, checks: { ...s.checks, name: v } })}
          />
          <Check
            label="Tölvupóstgreining"
            value={s.checks.email}
            onChange={(v) => setS({ ...s, checks: { ...s.checks, email: v } })}
          />
          <Check
            label="Netleit (genderize.io)"
            value={s.checks.online}
            onChange={(v) => setS({ ...s, checks: { ...s.checks, online: v } })}
          />
        </div>

        <div className="mt-5 space-y-3 border-t border-border pt-4">
          <Check
            label="Sjálfvirk efnisgreining í þráðum (loka þráðum með nöfnum/persónuupplýsingum)"
            value={s.threadNameModeration}
            onChange={(v) => setS({ ...s, threadNameModeration: v })}
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Bönnuð orð (haturstal) — eitt í línu eða aðskilið með kommu
            </span>
            <textarea
              value={s.hateSpeechKeywords}
              onChange={(e) => {
                setS({ ...s, hateSpeechKeywords: e.target.value });
                setSaved(false);
              }}
              rows={4}
              placeholder="Skildu eftir tómt til að nota sjálfgefinn lista"
              className="block w-full resize-y rounded-lg border border-input bg-surface p-2 text-sm focus:border-primary focus:outline-none"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Vista stillingar
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm text-green-500">
              <CheckCircle2 className="h-4 w-4" /> Vistað
            </span>
          )}
        </div>
      </div>

      {/* Test */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 text-base font-semibold">Prófa skor (nafn + netfang)</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Nafn (t.d. Gunnar Jónsson)"
            className="h-10 rounded-lg border border-input bg-surface px-3 text-sm focus:border-primary focus:outline-none"
          />
          <input
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="netfang@example.com"
            className="h-10 rounded-lg border border-input bg-surface px-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={runTest}
          disabled={testing || !testName || !testEmail}
          className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-5 text-sm font-medium hover:bg-secondary disabled:opacity-50"
        >
          {testing && <Loader2 className="h-4 w-4 animate-spin" />}
          Prófa
        </button>

        {testErr && (
          <p className="mt-3 inline-flex items-center gap-1 text-sm text-destructive">
            <XCircle className="h-4 w-4" /> {testErr}
          </p>
        )}

        {test && (
          <div className="mt-4 rounded-lg border border-border bg-surface/40 p-4 text-sm">
            <p className="font-semibold">
              Lokaskor: <span className="text-primary">{test.scorePercent}%</span> ·{" "}
              {test.assessment} ·{" "}
              <span
                className={cn(
                  test.wouldAutoApprove ? "text-green-500" : "text-amber-400",
                )}
              >
                {test.wouldAutoApprove
                  ? "✅ Yrði sjálfkrafa samþykkt"
                  : "⏳ Færi í handvirka yfirferð"}
              </span>
            </p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>Nafnaskor: {test.details.breakdown.nameScore ?? "—"}%</li>
              <li>Netfangsskor: {test.details.breakdown.emailScore ?? "—"}%</li>
              <li>Netleitarskor: {test.details.breakdown.onlineScore ?? "—"}%</li>
            </ul>
            {test.details.reasons.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
                {test.details.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
