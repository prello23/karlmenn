import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

import { adminGuard } from "@/lib/admin-api";
import { getDbSetting } from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

const IS_MONTHS = [
  "jan", "feb", "mar", "apr", "maí", "jún",
  "júl", "ágú", "sep", "okt", "nóv", "des",
];

// "YYYYMMDD" → "25 jún"
function formatGaDate(yyyymmdd: string): string {
  const m = /^(\d{4})(\d{2})(\d{2})$/.exec(yyyymmdd);
  if (!m) return yyyymmdd;
  const day = Number(m[3]);
  const month = IS_MONTHS[Number(m[2]) - 1] ?? "";
  return `${day} ${month}`;
}

// Last 7 date keys (oldest → newest) as "YYYYMMDD".
function last7DateKeys(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key =
      String(d.getFullYear()) +
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0");
    keys.push(key);
  }
  return keys;
}

// GET /api/admin/analytics — GA4 Data API stats for the admin dashboard.
export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;

  const [saJson, propRaw] = await Promise.all([
    getDbSetting("ga_service_account_json"),
    getDbSetting("ga_property_id"),
  ]);

  const propertyId = (propRaw ?? "").replace(/^properties\//, "").trim();
  if (!saJson || !propertyId) {
    return NextResponse.json({
      configured: false,
      error:
        "Google Analytics er ekki uppsett. Vantar þjónustureikning (ga_service_account_json) og/eða eignarauðkenni (ga_property_id).",
    });
  }

  let credentials: { client_email?: string; private_key?: string };
  try {
    credentials = JSON.parse(saJson);
  } catch {
    return NextResponse.json({
      configured: false,
      error: "Þjónustureikningur (JSON) er ógildur.",
    });
  }

  try {
    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
    });
    const property = `properties/${propertyId}`;

    const [totalsRes, dailyRes, pagesRes, todayRes] = await Promise.all([
      client.runReport({
        property,
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        metrics: [{ name: "totalUsers" }, { name: "screenPageViews" }],
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 50,
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate: "today", endDate: "today" }],
        metrics: [{ name: "activeUsers" }],
      }),
    ]);

    const totalUsers = Number(totalsRes[0].rows?.[0]?.metricValues?.[0]?.value ?? 0);
    const totalPageViews = Number(
      totalsRes[0].rows?.[0]?.metricValues?.[1]?.value ?? 0,
    );
    const todayUsers = Number(todayRes[0].rows?.[0]?.metricValues?.[0]?.value ?? 0);

    // Daily users, filled to exactly 7 days (missing days → 0).
    const dailyMap = new Map<string, number>();
    for (const row of dailyRes[0].rows ?? []) {
      const key = row.dimensionValues?.[0]?.value ?? "";
      dailyMap.set(key, Number(row.metricValues?.[0]?.value ?? 0));
    }
    const keys = last7DateKeys();
    const last7Days = {
      users: keys.map((k) => dailyMap.get(k) ?? 0),
      dates: keys.map(formatGaDate),
    };

    // Top pages + top threads (threads are page paths under /samfelag/<slug>/<id>).
    const allPages = (pagesRes[0].rows ?? []).map((row) => ({
      path: row.dimensionValues?.[0]?.value ?? "",
      title: row.dimensionValues?.[1]?.value ?? "",
      views: Number(row.metricValues?.[0]?.value ?? 0),
    }));
    const topPages = allPages.slice(0, 10);
    const topThreads = allPages
      .filter((p) => /^\/samfelag\/[^/]+\/[^/]+/.test(p.path))
      .slice(0, 10);

    return NextResponse.json({
      configured: true,
      totalUsers,
      totalPageViews,
      todayUsers,
      topPages,
      topThreads,
      last7Days,
    });
  } catch (e) {
    return NextResponse.json({
      configured: false,
      error:
        e instanceof Error
          ? `GA4 fyrirspurn mistókst: ${e.message}`
          : "GA4 fyrirspurn mistókst.",
    });
  }
}
