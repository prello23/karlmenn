/**
 * Presentational gender-assessment badge. No client/server-only dependencies,
 * so it can be rendered from both server and client components.
 */

/** Builds a human-readable tooltip from the stored assessment JSON. */
export function assessmentTooltip(
  score: number | null,
  details: string | null,
): string {
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

export function GenderBadge({
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
