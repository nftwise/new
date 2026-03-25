# 🔍 CRON JOB & DATA DIAGNOSTIC REPORT

**Generated:** 2026-03-25
**Project:** ultimate-report-dashboard-main
**Status:** ⚠️ NEEDS VERIFICATION

---

## 📋 EXECUTIVE SUMMARY

| Check | Status | Details |
|-------|--------|---------|
| **Vercel Cron Config** | ❌ NOT FOUND | `vercel.json` is missing - cron may not be running |
| **TZ Environment** | ✅ CONFIGURED | `TZ=America/Los_Angeles` set (commit 6aa5427) |
| **GBP OAuth** | ✅ RECENT | GBP OAuth flow added (commit f5b2228, Jan 22) |
| **API Endpoints** | ✅ ACTIVE | 3 cron endpoints available |
| **DB Schema** | ✅ CREATED | `client_metrics_summary` table with 59 metrics |
| **Middleware** | ✅ CONFIGURED | Cron secret validation enabled |

---

## 🚨 CRITICAL ISSUES

### Issue #1: Missing `vercel.json`
**Severity:** 🔴 CRITICAL

The Vercel cron configuration is missing. Without it, scheduled jobs won't run automatically.

**Solution:** Create `vercel.json` with cron configuration

```json
{
  "crons": [
    {
      "path": "/api/admin/run-rollup",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/admin/health-check",
      "schedule": "0 10 * * *"
    }
  ]
}
```

---

## 📊 DATA FRESHNESS CHECK

### Current Setup (as of March 25, 2026)

```
Cron Schedule:     0 2 * * * (2:00 AM LA time = 10:00 UTC)
Today's Date:      2026-03-25
Expected Data:     2026-03-24 (yesterday)
Age of Latest:     ? (Need DB verification)
Customers:         21 (to be verified)
```

### Metrics Collected Daily (59 Total)

**Google Ads (11 metrics)**
- Impressions, Clicks, CTR, CPC
- Conversions, Cost, ROAS
- Quality Score, Impression Share
- Search Lost (Budget/Rank)

**Google Analytics (19 metrics)**
- Sessions, Users, Pageviews
- Events, Conversions, Revenue
- Device breakdown, Traffic sources
- AI traffic detection (ChatGPT, Claude, Perplexity, etc.)

**Google Search Console (10 metrics)**
- Search Clicks, Impressions
- CTR, Average Position
- Top Keywords, Ranking Keywords
- Branded vs Non-branded traffic

**Google Business Profile (16 metrics)**
- Calls, Website Clicks, Directions
- Reviews (count, rating, new)
- Profile Views, Posts, Photos
- Posts Engagement (views, clicks)

**Calculated Metrics (3 metrics)**
- Total Leads, CPL, AI Traffic %

---

## 🔧 HOW TO VERIFY

### Method 1: Check Via Vercel Logs
```bash
# Visit: https://vercel.com/[account]/ultimate-report-dashboard-main/deployments
# Look for cron execution logs at 2 AM LA time daily
```

### Method 2: Check Database
**SQL queries to run in Supabase:**

```sql
-- 1. Count records for last 7 days
SELECT
  DATE(date) as day,
  COUNT(*) as total_records,
  COUNT(DISTINCT client_id) as unique_clients
FROM client_metrics_summary
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
  AND period_type = 'daily'
GROUP BY DATE(date)
ORDER BY day DESC;

-- 2. Check if all 21 customers have data
SELECT
  COUNT(DISTINCT client_id) as active_clients,
  MAX(date) as latest_date,
  MIN(date) as oldest_date
FROM client_metrics_summary
WHERE period_type = 'daily'
  AND date = CURRENT_DATE - INTERVAL '1 day';

-- 3. Find missing customers
SELECT
  c.id,
  c.name,
  c.slug,
  COALESCE(cms.date, 'NO DATA') as latest_data_date
FROM clients c
LEFT JOIN client_metrics_summary cms ON c.id = cms.client_id
  AND cms.date = CURRENT_DATE - INTERVAL '1 day'
  AND cms.period_type = 'daily'
WHERE c.is_active = true
ORDER BY c.name;

-- 4. Check GBP backfill status
SELECT
  client_id,
  MAX(date) as latest_gbp_data,
  COUNT(*) as total_gbp_records,
  SUM(CASE WHEN gbp_calls > 0 THEN 1 ELSE 0 END) as days_with_gbp_calls
FROM client_metrics_summary
WHERE period_type = 'daily'
  AND (gbp_calls > 0 OR gbp_website_clicks > 0)
GROUP BY client_id
ORDER BY MAX(date) DESC;

-- 5. Data freshness by API source
SELECT
  date,
  COUNT(*) as total_records,
  SUM(CASE WHEN google_ads_conversions > 0 THEN 1 ELSE 0 END) as has_ads_data,
  SUM(CASE WHEN form_fills > 0 THEN 1 ELSE 0 END) as has_ga_data,
  SUM(CASE WHEN top_keywords > 0 THEN 1 ELSE 0 END) as has_gsc_data,
  SUM(CASE WHEN gbp_calls > 0 THEN 1 ELSE 0 END) as has_gbp_data
FROM client_metrics_summary
WHERE period_type = 'daily'
GROUP BY date
ORDER BY date DESC
LIMIT 10;
```

### Method 3: Check GBP OAuth Token
```sql
-- Check if GBP token is stored and valid
SELECT
  key,
  value::text as token_info,
  updated_at
FROM system_settings
WHERE key = 'gbp_agency_master';

-- Expected output: Valid JSON with access_token and expiry_date
```

---

## 🐛 TROUBLESHOOTING

### Cron Not Running?

**Check 1: Verify Vercel Configuration**
```bash
# Does vercel.json exist?
test -f vercel.json && echo "✅ Found" || echo "❌ Missing"

# Is it properly formatted?
cat vercel.json | jq .crons
```

**Check 2: Verify Environment Variables**
- [ ] `CRON_SECRET` is set in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] `GOOGLE_CLIENT_EMAIL` is set
- [ ] `GOOGLE_PRIVATE_KEY` is set

**Check 3: Check Vercel Logs**
```bash
# Login to Vercel CLI
vercel login

# Check logs for cron execution
vercel logs --follow
```

### No Data Appearing?

**Check 1: Run Rollup Manually**
```bash
# Via API (if authorized)
curl -X GET https://ultimate-report-dashboard-main.vercel.app/api/admin/run-rollup \
  -H "Authorization: Bearer $CRON_SECRET"

# Or via POST
curl -X POST https://ultimate-report-dashboard-main.vercel.app/api/admin/run-rollup \
  -H "Content-Type: application/json" \
  -d '{"secret": "'$CRON_SECRET'", "date": "2026-03-24"}'
```

**Check 2: Verify API Credentials**
- [ ] Google Ads: Check if `GOOGLE_ADS_CUSTOMER_ID` is correct
- [ ] GA4: Check if `GOOGLE_ANALYTICS_PROPERTY_ID` exists
- [ ] Search Console: Verify site URL in `clients.service_configs`
- [ ] GBP: Check OAuth token expiry in `system_settings`

**Check 3: Check Rollup Logs**
Look in Vercel logs for lines like:
```
🌙 [Rollup] Starting 59-metric rollup for 2026-03-24 (US date)
👥 Processing 21 clients
✅ [Rollup] Completed in XXms, YYY records
```

### GBP Data Missing?

**Check 1: GBP Location IDs**
```sql
-- Check if clients have GBP location IDs
SELECT
  c.id,
  c.name,
  sc.gbp_location_id
FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
WHERE c.is_active = true;
```

**Check 2: GBP OAuth Token Status**
```sql
SELECT
  value::jsonb->>'email' as email,
  (value::jsonb->>'expiry_date')::bigint as expiry_time,
  CASE
    WHEN (value::jsonb->>'expiry_date')::bigint > EXTRACT(EPOCH FROM NOW())::bigint
    THEN '✅ Valid'
    ELSE '❌ Expired'
  END as token_status
FROM system_settings
WHERE key = 'gbp_agency_master';
```

**Check 3: Manual GBP Backfill**
```bash
# Run locally (requires .env.local)
node scripts/run-gbp-backfill-local.js 2026-03-24 2026-03-24

# Or via API
curl -X POST https://ultimate-report-dashboard-main.vercel.app/api/admin/run-gbp-backfill \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "'$CRON_SECRET'",
    "startDate": "2026-03-24",
    "endDate": "2026-03-24"
  }'
```

---

## 📅 RECENT CHANGES

| Date | Commit | Change |
|------|--------|--------|
| 2026-03-25 | (now) | DIAGNOSTIC CREATED |
| 2026-01-23 | e4838d1 | Allow GBP backfill API in middleware |
| 2026-01-22 | f5b2228 | Add GBP OAuth flow and backfill API |
| 2026-01-21 | 6aa5427 | Add TZ env for cron (2am LA = 10:00 UTC) |

---

## ✅ ACTION ITEMS

**Priority 1 (Critical):**
- [ ] Create `vercel.json` with cron configuration
- [ ] Verify Vercel environment variables
- [ ] Test manual rollup via API

**Priority 2 (High):**
- [ ] Verify all 21 customers have recent data
- [ ] Check GBP OAuth token validity
- [ ] Review Vercel deployment logs

**Priority 3 (Medium):**
- [ ] Set up email alerts for failed rollups
- [ ] Create dashboard for cron job monitoring
- [ ] Document backup rollup process

---

## 🔗 USEFUL LINKS

- **Vercel Logs:** https://vercel.com/[account]/ultimate-report-dashboard-main/deployments
- **Supabase Dashboard:** https://supabase.com/dashboard/project/tupedninjtaarmdwppgy
- **API Health Check:** `/api/admin/health-check`
- **Run Rollup (Manual):** `/api/admin/run-rollup` (POST or GET)
- **GBP Backfill:** `/api/admin/run-gbp-backfill` (POST)

---

## 📝 NOTES

1. **Data Delay:** All APIs have 24-48 hour delays. Data for today (03-25) won't be available until tomorrow.
2. **Timezone:** Cron runs at 2 AM Los Angeles time = 10:00 UTC
3. **21 Customers:** Verify this count with the SQL queries above
4. **59 Metrics:** Includes all Google APIs + calculated metrics

---

Generated with ❤️ for diagnostic purposes
