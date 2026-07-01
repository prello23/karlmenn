"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, Eye, TrendingUp, AlertCircle } from "lucide-react";

type Analytics = {
  configured: boolean;
  error?: string;
  totalUsers: number;
  totalPageViews: number;
  todayUsers: number;
  topPages: { path: string; title: string; views: number }[];
  topThreads: { path: string; title: string; views: number }[];
  last7Days: { users: number[]; dates: string[] };
};

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight">
        {value.toLocaleString("is-IS")}
      </p>
    </div>
  );
}

// Lightweight inline SVG line chart — no chart dependency.
function LineChart({ users, dates }: { users: number[]; dates: string[] }) {
  const W = 640;
  const H = 200;
  const pad = { top: 16, right: 16, bottom: 28, left: 32 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const max = Math.max(1, ...users);
  const n = users.length;
  const x = (i: number) => pad.left + (n <= 1 ? 0 : (i / (n - 1)) * innerW);
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;

  const points = users.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `${pad.left},${pad.top + innerH} ${points} ${x(n - 1)},${pad.top + innerH}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-52 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Gestir síðustu 7 daga"
    >
      {/* baseline */}
      <line
        x1={pad.left}
        y1={pad.top + innerH}
        x2={W - pad.right}
        y2={pad.top + innerH}
        className="stroke-border"
        strokeWidth={1}
      />
      <polygon points={area} className="fill-primary/10" />
      <polyline
        points={points}
        fill="none"
        className="stroke-primary"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {users.map((v, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(v)} r={3} className="fill-primary" />
          <text
            x={x(i)}
            y={H - 8}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {dates[i]}
          </text>
          <text
            x={x(i)}
            y={y(v) - 8}
            textAnchor="middle"
            className="fill-foreground text-[10px]"
          >
            {v}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ViewsTable({
  title,
  rows,
  emptyLabel,
}: {
  title: string;
  rows: { path: string; title: string; views: number }[];
  emptyLabel: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <th className="pb-2 font-medium">Síða</th>
              <th className="pb-2 text-right font-medium">Flettingar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.path} className="border-b border-border/50 last:border-0">
                <td className="py-2">
                  <div className="font-medium text-foreground">
                    {r.title || r.path}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {r.path}
                  </div>
                </td>
                <td className="py-2 text-right font-semibold text-primary">
                  {r.views.toLocaleString("is-IS")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Hleð tölfræði...
      </div>
    );
  }

  if (!data || !data.configured) {
    return (
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 text-sm text-amber-300">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-4 w-4" /> Google Analytics ekki uppsett
        </div>
        <p className="mt-2 text-amber-200/80">
          {data?.error ??
            "Ekki tókst að sækja tölfræði. Vantar þjónustureikning og eignarauðkenni."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Gestir í dag" value={data.todayUsers} icon={Users} />
        <StatCard
          label="Síðuflettingar (7 dagar)"
          value={data.totalPageViews}
          icon={Eye}
        />
        <StatCard
          label="Gestir (7 dagar)"
          value={data.totalUsers}
          icon={TrendingUp}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-lg font-semibold">Gestir síðustu 7 daga</h2>
        <LineChart users={data.last7Days.users} dates={data.last7Days.dates} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ViewsTable
          title="Vinsælustu síður"
          rows={data.topPages}
          emptyLabel="Engin gögn enn."
        />
        <ViewsTable
          title="Vinsælustu þræðir"
          rows={data.topThreads}
          emptyLabel="Engin gögn enn."
        />
      </div>
    </div>
  );
}
