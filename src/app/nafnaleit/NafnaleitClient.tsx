"use client";

import { useState } from "react";
import { Search, Loader2, CheckCircle2, XCircle } from "lucide-react";

export function NafnaleitClient() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ found: boolean; query: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(`/api/nafnaleit?name=${encodeURIComponent(name)}`);
      const d = await res.json();
      if (res.ok) setResult(d);
      else setError(d.error ?? "Leit mistókst");
    } catch {
      setError("Leit mistókst");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <form onSubmit={search} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Sláðu inn nafn..."
          className="h-11 flex-1 rounded-lg border border-input bg-surface px-3 text-sm focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || name.trim().length < 2}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Leita
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {result && (
        <div
          className={`mt-6 flex items-center gap-3 rounded-xl border p-5 ${
            result.found
              ? "border-destructive/40 bg-destructive/10"
              : "border-success/40 bg-success/5"
          }`}
        >
          {result.found ? (
            <>
              <XCircle className="h-7 w-7 shrink-0 text-destructive" />
              <div>
                <p className="text-lg font-bold text-destructive">Já</p>
                <p className="text-sm text-muted-foreground">
                  &quot;{result.query}&quot; fannst í skránni.
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-7 w-7 shrink-0 text-success" />
              <div>
                <p className="text-lg font-bold text-success">Nei</p>
                <p className="text-sm text-muted-foreground">
                  &quot;{result.query}&quot; fannst ekki í skránni.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
