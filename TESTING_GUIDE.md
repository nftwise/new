# 🧪 Testing Guide - Google Ads Analysis Module

**Last Updated**: 2026-01-09
**Status**: Ready for Testing

---

## 📋 Pre-Testing Checklist

Before starting testing, ensure:

- [ ] You have admin access to Supabase dashboard
- [ ] You have created a backup of current database
- [ ] You have at least 3 active clients in the database
- [ ] You are logged in as admin user
- [ ] Development environment is running (`npm run dev`)

---

## 🗄️ Step 1: Run Database Migration

### Option A: Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy/paste content from: `supabase/migrations/001_create_ads_analysis_tables.sql`
6. Click **Run** (bottom right)
7. Verify success: "Success. No rows returned"

### Option B: Supabase CLI (Advanced)

```bash
# If you have Supabase CLI installed
supabase db push

# Or apply migration directly
supabase db execute -f supabase/migrations/001_create_ads_analysis_tables.sql
```

### Verify Migration Success

Run this query in SQL Editor:

```sql
-- Check tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'ads_%'
ORDER BY table_name;
```

**Expected Output:**
```
ads_account_health
ads_ad_group_metrics
ads_campaign_metrics
ads_insights
ads_keyword_metrics
```

✅ If you see all 5 tables → Migration successful!

---

## 🌱 Step 2: Seed Demo Data

### Create Demo Data

```bash
# Using curl
curl -X POST http://localhost:3000/api/admin/seed-ads-demo-data \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "clientCount": 3,
    "daysBack": 30
  }'

# Or using Postman/Insomnia:
POST http://localhost:3000/api/admin/seed-ads-demo-data
Body (JSON):
{
  "clientCount": 3,
  "daysBack": 30
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Created demo data for 3 clients",
  "clients": [
    { "id": "uuid1", "name": "Client A" },
    { "id": "uuid2", "name": "Client B" },
    { "id": "uuid3", "name": "Client C" }
  ],
  "results": {
    "campaigns": 450,
    "keywords": 900,
    "insights": 12,
    "healthScores": 90,
    "errors": []
  }
}
```

### Verify Data in Database

Run these queries in Supabase SQL Editor:

```sql
-- 1. Check campaign metrics
SELECT
  c.business_name,
  COUNT(DISTINCT acm.campaign_id) as campaigns,
  COUNT(*) as total_records,
  MIN(acm.date) as earliest_date,
  MAX(acm.date) as latest_date
FROM ads_campaign_metrics acm
JOIN clients c ON c.id = acm.client_id
GROUP BY c.business_name;

-- Expected: 3 clients, 3-5 campaigns each, 30 days of data


-- 2. Check insights
SELECT
  severity,
  category,
  COUNT(*) as count
FROM ads_insights
WHERE status = 'active'
GROUP BY severity, category
ORDER BY severity DESC;

-- Expected: Mix of critical, high, medium severity


-- 3. Check health scores
SELECT
  c.business_name,
  ah.date,
  ah.health_score,
  ah.total_active_alerts
FROM ads_account_health ah
JOIN clients c ON c.id = ah.client_id
ORDER BY ah.date DESC
LIMIT 10;

-- Expected: Recent health scores for each client
```

✅ If all queries return data → Seeding successful!

---

## 🔍 Step 3: Manual Data Verification

### Test Query 1: Campaign Performance

```sql
SELECT
  campaign_name,
  date,
  impressions,
  clicks,
  cost,
  conversions,
  ctr,
  quality_score
FROM ads_campaign_metrics
WHERE client_id = (SELECT id FROM clients LIMIT 1)
AND date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC, campaign_name;
```

**Verify:**
- [ ] Data exists for last 7 days
- [ ] Metrics look realistic (CTR 2-5%, Quality Score 4-10)
- [ ] No NULL values in important fields

### Test Query 2: Critical Insights

```sql
SELECT
  c.business_name,
  ai.severity,
  ai.title,
  ai.description,
  ai.impact_estimate
FROM ads_insights ai
JOIN clients c ON c.id = ai.client_id
WHERE ai.status = 'active'
AND ai.severity IN ('critical', 'high')
ORDER BY ai.severity, ai.impact_estimate DESC;
```

**Verify:**
- [ ] At least 1-2 critical insights per client
- [ ] Descriptions make sense
- [ ] Impact estimates are realistic ($100-$500)

### Test Query 3: Health Score Trend

```sql
SELECT
  date,
  health_score,
  critical_alerts,
  high_alerts,
  medium_alerts
FROM ads_account_health
WHERE client_id = (SELECT id FROM clients LIMIT 1)
ORDER BY date DESC
LIMIT 30;
```

**Verify:**
- [ ] Health scores between 60-95
- [ ] Slight improvement trend over time
- [ ] Alert counts match insights table

---

## 🎨 Step 4: Build Simple Dashboard (Optional)

If you want to visualize data before building full UI:

### Quick SQL Dashboard

```sql
-- Dashboard Summary Query
WITH client_summary AS (
  SELECT
    c.id,
    c.business_name,
    ah.health_score,
    ah.total_active_alerts,
    ah.critical_alerts
  FROM clients c
  LEFT JOIN ads_account_health ah ON ah.client_id = c.id AND ah.date = CURRENT_DATE
  WHERE c.status = 'active'
),
campaign_totals AS (
  SELECT
    client_id,
    SUM(cost) as total_spend,
    SUM(conversions) as total_conversions,
    SUM(clicks) as total_clicks
  FROM ads_campaign_metrics
  WHERE date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY client_id
)
SELECT
  cs.business_name,
  cs.health_score as "Health Score",
  cs.total_active_alerts as "Active Alerts",
  cs.critical_alerts as "Critical",
  ct.total_spend as "30d Spend",
  ct.total_conversions as "30d Conv",
  ROUND(ct.total_spend / NULLIF(ct.total_conversions, 0), 2) as "CPA"
FROM client_summary cs
LEFT JOIN campaign_totals ct ON ct.client_id = cs.id
ORDER BY cs.critical_alerts DESC, cs.health_score ASC;
```

**Expected Output:**
```
Business Name        | Health Score | Active Alerts | Critical | 30d Spend | 30d Conv | CPA
--------------------|--------------|---------------|----------|-----------|----------|-------
Client A            | 75           | 6             | 2        | $3,450    | 78       | $44.23
Client B            | 82           | 4             | 1        | $2,890    | 92       | $31.41
Client C            | 88           | 3             | 1        | $1,234    | 45       | $27.42
```

---

## ✅ Step 5: Validation Checklist

Before proceeding to full implementation:

### Data Integrity
- [ ] All 5 tables created successfully
- [ ] Row Level Security policies applied
- [ ] Indexes created for performance
- [ ] Demo data seeded correctly
- [ ] No errors in Supabase logs

### Data Quality
- [ ] Metrics are within realistic ranges
- [ ] Dates are consecutive (no gaps)
- [ ] Relationships between tables work (campaigns → insights)
- [ ] Calculated metrics (CTR, CPC, CPA) are correct

### Performance
- [ ] Queries run in < 500ms
- [ ] Indexes are being used (check EXPLAIN)
- [ ] No table scans on large tables

### Security
- [ ] Admin can query all data
- [ ] RLS prevents cross-client data access
- [ ] Seed endpoint requires admin role

---

## 🧹 Step 6: Cleanup (Optional)

If you want to start fresh:

### Option A: Delete Demo Data Only

```bash
curl -X DELETE http://localhost:3000/api/admin/seed-ads-demo-data

# Response:
{
  "success": true,
  "deleted": {
    "campaigns": 450,
    "keywords": 900,
    "insights": 12,
    "healthScores": 90
  }
}
```

### Option B: Drop All Tables

⚠️ **WARNING**: This will delete ALL ads analysis data!

```sql
-- Run in Supabase SQL Editor
DROP TABLE IF EXISTS ads_ad_group_metrics CASCADE;
DROP TABLE IF EXISTS ads_account_health CASCADE;
DROP TABLE IF EXISTS ads_insights CASCADE;
DROP TABLE IF EXISTS ads_keyword_metrics CASCADE;
DROP TABLE IF EXISTS ads_campaign_metrics CASCADE;
```

Then re-run migration to start fresh.

---

## 🐛 Troubleshooting

### Issue: Migration fails with "relation already exists"

**Solution**: Tables already exist. Either:
1. Skip migration (tables are already there)
2. Or drop tables first and re-run

### Issue: Seed endpoint returns 401 Unauthorized

**Solution**: Make sure you're logged in as admin
```bash
# Check your role in database
SELECT id, email, role FROM users WHERE email = 'your-email@example.com';

# Should show role = 'admin'
```

### Issue: Queries are slow (> 1 second)

**Solution**: Check if indexes exist
```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename LIKE 'ads_%';
```

Should see indexes on:
- `client_id, date`
- `campaign_id`
- `severity, status`

### Issue: Health scores all showing 0

**Solution**: Check if account_health table has data
```sql
SELECT COUNT(*) FROM ads_account_health;
-- Should be > 0

-- If 0, re-run seeder
```

---

## 📊 Success Criteria

Testing is successful if ALL of these pass:

✅ **Database**
- All 5 tables created
- RLS policies active
- Indexes created

✅ **Data**
- Demo data for 3+ clients
- 30 days of historical data
- 10+ insights generated
- Health scores calculated

✅ **Queries**
- Summary queries run < 500ms
- Data is realistic and consistent
- No NULL values in critical fields

✅ **Security**
- Seed endpoint requires admin
- RLS prevents data leakage
- No errors in logs

---

## 🚀 Next Steps After Testing

If all tests pass:

1. ✅ **Mark Phase 1 Complete**: Database & demo data working
2. 📝 **Review with stakeholders**: Show query results and data structure
3. 🎨 **Proceed to Phase 2**: Build UI dashboard to visualize data
4. 🔌 **Phase 3**: Connect to real Google Ads API
5. 🤖 **Phase 4**: Implement automated insight detection

---

## 📞 Need Help?

Common issues and solutions documented above.

For other issues:
1. Check Supabase logs (Dashboard → Logs)
2. Check browser console for errors
3. Verify authentication cookies are set
4. Try in incognito mode to rule out cache issues

---

**Testing Time Estimate**: 30-45 minutes

Good luck! 🎯
