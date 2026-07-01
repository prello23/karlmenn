# EKKIEINN-GOOGLE-ANALYTICS.md
## Add Google Analytics + Admin Dashboard Analytics

### 1. Add GA4 tracking script to all pages

Add the Google Analytics gtag.js script to the Next.js root layout (`src/app/layout.tsx`).

**Measurement ID: `G-LZK3TP8PPF`**

Add this in the `<head>` section using next/script:
```tsx
import Script from 'next/script'

// In layout:
<Script src="https://www.googletagmanager.com/gtag/js?id=G-LZK3TP8PPF" strategy="afterInteractive" />
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-LZK3TP8PPF');
  `}
</Script>
```

### 2. Track thread views with custom events

When a user views a thread (at `/samfelag/[id]`), fire a custom GA event:
```tsx
// In the thread view page/component
gtag('event', 'view_thread', {
  thread_id: thread.id,
  thread_title: thread.title,
  category: thread.category
});
```

This way each thread view is tracked individually.

### 3. Admin Analytics Dashboard page

Create `/admin/analytics` page that shows:

**Option A (simple — use this):** Embed Google Analytics using the GA4 embed URL.

Add a new admin sidebar item "Tölfræði" (Analytics) with a chart icon.

The page should show:
- An iframe embedding the GA4 reports (or alternatively, display stats from a simple server-side GA4 Data API call)
- BUT since GA4 embed requires auth, use the **GA4 Data API** instead

**Use GA4 Data API (recommended approach):**

Create an API route `/api/admin/analytics` that:
1. Reads a Google service account JSON from an environment variable or the Settings DB table
2. Uses `@google-analytics/data` npm package to query the GA4 Data API
3. Returns stats: total users, page views, top pages, active users (real-time if possible)

**Service Account JSON** — store the entire JSON as a Setting in the DB (key: `ga_service_account_json`). The agent will insert it after deployment.

**GA4 Property ID:** `properties/PROPERTY_ID` — the property ID number will be stored as a Setting (key: `ga_property_id`).

**API route should return:**
```json
{
  "totalUsers": 123,
  "totalPageViews": 456,
  "topPages": [
    {"path": "/samfelag/5", "views": 45, "title": "Thread title"},
    {"path": "/", "views": 30, "title": "Forsíða"}
  ],
  "last7Days": {
    "users": [10, 15, 8, 20, 12, 18, 25],
    "dates": ["25 jún", "26 jún", ...]
  }
}
```

**Admin page UI:**
- Cards at top: "Gestir í dag", "Síðuflettingar", "Gestir (7 dagar)"
- Line chart showing last 7 days users
- Table of top pages with view counts
- Table of top threads with view counts
- Dark theme matching rest of admin

### 4. Install required packages
```bash
npm install @google-analytics/data
```

### After changes
- Build, restart PM2 ekkieinn, push to beta
- Do NOT worry about inserting the service account JSON — the agent will do that separately
