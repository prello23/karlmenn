import { AnalyticsDashboard } from "./AnalyticsDashboard";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Tölfræði</h1>
      <p className="mt-2 text-muted-foreground">
        Google Analytics yfirlit — gestir, síðuflettingar og vinsælustu síður.
      </p>
      <div className="mt-8">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
