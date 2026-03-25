# 🔍 DIAGNOSTICS TOOLKIT

Complete set of tools to verify cron jobs, data freshness, and GBP backfill status for the Ultimate Reporting Dashboard.

---

## 📦 WHAT'S INCLUDED

### 1. **CRON_DIAGNOSTIC.md**
Main diagnostic report with:
- Current system status
- Critical issues identification
- Troubleshooting guide
- SQL queries for database verification

**When to use:** Start here for an overview of the system state

### 2. **vercel.json** ⭐ NEW
Vercel cron configuration (was missing!).

```json
{
  "crons": [
    {
      "path": "/api/admin/run-rollup",
      "schedule": "0 2 * * *"  // 2 AM LA time daily
    },
    {
      "path": "/api/admin/health-check",
      "schedule": "0 10 * * *"  // 10 AM PA time daily
    }
  ]
}
```

**What it does:**
- Tells Vercel to run rollup every day at 2 AM LA
- Runs health check every day at 10 AM PA
- MUST be deployed to Vercel for cron to work

### 3. **scripts/check-cron-status.js**
Node.js script to check if cron jobs are accessible and working.

**How to run:**
```bash
# With env vars
node scripts/check-cron-status.js

# Or with .env.local
cp .env.example .env.local
# Fill in your API_URL and CRON_SECRET
node scripts/check-cron-status.js
```

**What it checks:**
- ✅ API health
- ✅ Health check endpoint
- ✅ Rollup endpoint access
- ✅ GBP backfill endpoint access
- ✅ Database connectivity

**Output:**
```
╔════════════════════════════════════════════════════════════╗
║        🔍 CRON JOB STATUS CHECKER                          ║
╚════════════════════════════════════════════════════════════╝

1️⃣  Checking API Health...
2️⃣  Checking Health Check Endpoint...
3️⃣  Checking Rollup Endpoint Access...
...
HEALTH SCORE: 80% (4/5 checks passed)
```

### 4. **scripts/check-data-freshness.sql**
SQL script to check data freshness for all 21 customers.

**How to run:**
```
1. Go to Supabase Dashboard
2. Click "SQL Editor"
3. Create new query
4. Paste contents of scripts/check-data-freshness.sql
5. Run
```

**What it shows:**
- 📅 Records by date (last 7 days)
- 👥 Customer data status (yesterday)
- 📊 Data completeness by API
- 🏢 GBP backfill status
- 🔐 GBP OAuth token status
- ⚠️ Missing data alerts
- 📈 Summary statistics

### 5. **scripts/check-gbp-status.sql**
SQL script specifically for GBP (Google Business Profile) status.

**How to run:**
```
1. Go to Supabase SQL Editor
2. Paste contents of scripts/check-gbp-status.sql
3. Run
```

**What it shows:**
- 🏢 GBP OAuth token validity
- 📍 GBP location IDs for all customers
- 📊 GBP data presence (last 30 days)
- 💯 GBP data completeness
- ❌ Customers missing GBP data
- 📈 GBP data trends
- 🔧 Diagnostic summary

---

## 🚀 QUICK START GUIDE

### Step 1: Deploy vercel.json
```bash
# vercel.json is now included in repo
git add vercel.json
git commit -m "feat: Add Vercel cron configuration"
git push origin main
```

This tells Vercel to start running your cron jobs!

### Step 2: Check if Cron is Working
```bash
# Method 1: Check API endpoints locally
node scripts/check-cron-status.js

# Method 2: Check Vercel logs
# Visit: https://vercel.com/dashboard
# Look for "Cron" section in deployment logs
```

### Step 3: Verify Data in Database
Run the SQL queries to check:

```sql
-- Quick check: Latest data for all customers
SELECT
  date::text as "Date",
  COUNT(*) as "Records",
  COUNT(DISTINCT client_id) as "Customers"
FROM client_metrics_summary
WHERE date >= CURRENT_DATE - INTERVAL '1 day'
GROUP BY date
ORDER BY date DESC;
```

### Step 4: Check GBP Backfill
```sql
-- Are GBP location IDs configured?
SELECT
  c.name,
  sc.gbp_location_id,
  MAX(cms.date) as latest_date
FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
LEFT JOIN client_metrics_summary cms ON c.id = cms.client_id
WHERE c.is_active = true
GROUP BY c.name, sc.gbp_location_id;
```

---

## 🔧 TROUBLESHOOTING

### Issue: "Cron not running"

**Solution:**
1. Verify `vercel.json` is committed and pushed
2. Check Vercel dashboard for deployment
3. Run `node scripts/check-cron-status.js` to verify endpoints
4. Check Vercel logs for any errors

### Issue: "No data appearing"

**Solution:**
1. Verify Google API credentials are valid
2. Run manual rollup: `POST /api/admin/run-rollup` with CRON_SECRET
3. Check database for any error logs
4. Verify `client_metrics_summary` table exists

### Issue: "GBP data missing"

**Solution:**
1. Check GBP OAuth token: `scripts/check-gbp-status.sql`
2. Verify clients have GBP location IDs configured
3. Run manual GBP backfill:
   ```bash
   node scripts/run-gbp-backfill.js 2026-03-24 2026-03-24
   ```
4. Check `system_settings` table for GBP token

---

## 📊 EXPECTED RESULTS

### ✅ If Everything is Working

**Cron Status Check:**
```
HEALTH SCORE: 100% (5/5 checks passed)
✅ All systems operational! Cron jobs should be running.
```

**Data Freshness:**
```
📅 RECORDS BY DATE (Last 7 Days)
Date        | Total Records | Unique Customers | Avg Ads Conv
2026-03-24  | 21            | 21               | 5.2
2026-03-23  | 21            | 21               | 4.8
```

**GBP Status:**
```
GBP OAUTH TOKEN STATUS
Status: ✅ Valid & Active
Email: [your-email@gmail.com]
Expires: 2026-06-25
```

---

## 📝 ENVIRONMENT VARIABLES NEEDED

For the cron jobs to work, these must be set in Vercel:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Google
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_PROJECT_ID=your-project-id

# Google Ads
GOOGLE_ADS_DEVELOPER_TOKEN=xxx...
GOOGLE_ADS_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=xxx...
GOOGLE_ADS_REFRESH_TOKEN=xxx...
GOOGLE_ADS_MCC_ID=xxx...

# GBP
GOOGLE_OAUTH_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=xxx...

# Cron
CRON_SECRET=your-super-secret-cron-key
TZ=America/Los_Angeles
```

---

## 🔗 USEFUL LINKS

| Resource | URL |
|----------|-----|
| **Vercel Logs** | https://vercel.com/[account]/ultimate-report-dashboard-main |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/tupedninjtaarmdwppgy |
| **Google Cloud Console** | https://console.cloud.google.com |
| **Vercel Cron Docs** | https://vercel.com/docs/cron-jobs |

---

## 📋 CHECKLIST

Use this checklist to verify everything is set up correctly:

- [ ] `vercel.json` is committed and pushed to main branch
- [ ] `CRON_SECRET` is set in Vercel environment variables
- [ ] `TZ=America/Los_Angeles` is set in Vercel
- [ ] All Google API credentials are valid
- [ ] GBP OAuth token is stored and not expired
- [ ] Clients have GBP location IDs configured (if using GBP)
- [ ] `client_metrics_summary` table exists in database
- [ ] `node scripts/check-cron-status.js` shows 100% health
- [ ] SQL check shows data for yesterday's date
- [ ] Vercel logs show successful cron execution

---

## 🚨 CRITICAL ISSUES FOUND

### ✅ FIXED: Missing vercel.json
- **Status:** RESOLVED
- **What was missing:** `vercel.json` configuration file
- **Why it matters:** Vercel needs this to know which endpoints to run as cron jobs
- **Solution:** `vercel.json` has been created with proper cron schedule

### ⏰ Schedule
- **Rollup:** 0 2 * * * (2:00 AM LA time = 10:00 UTC)
- **Health Check:** 0 10 * * * (10:00 AM PA time = 6:00 PM UTC)

---

## 📞 SUPPORT

If you encounter issues:

1. **Check the logs first:**
   - Vercel: https://vercel.com/dashboard
   - Supabase: SQL Editor console

2. **Run diagnostic scripts:**
   ```bash
   node scripts/check-cron-status.js
   ```

3. **Review relevant SQL queries:**
   - `scripts/check-data-freshness.sql`
   - `scripts/check-gbp-status.sql`

4. **Check environment variables:**
   - Verify all required vars are set in Vercel
   - Verify no typos or formatting issues

---

**Last Updated:** 2026-03-25
**Status:** Ready for production
**Generated by:** Claude Code Diagnostic System
