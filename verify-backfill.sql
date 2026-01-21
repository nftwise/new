-- ============================================
-- Verify Backfill Data - Google Ads Analysis
-- Run these queries in Supabase SQL Editor
-- ============================================

-- 1. Count total records by table
SELECT
  'Campaign Metrics' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT client_id) as clients,
  COUNT(DISTINCT campaign_id) as campaigns,
  MIN(date) as earliest_date,
  MAX(date) as latest_date,
  ROUND(COUNT(*)::DECIMAL / COUNT(DISTINCT client_id), 0) as avg_per_client
FROM ads_campaign_metrics

UNION ALL

SELECT
  'Health Scores' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT client_id) as clients,
  NULL as campaigns,
  MIN(date) as earliest_date,
  MAX(date) as latest_date,
  ROUND(COUNT(*)::DECIMAL / COUNT(DISTINCT client_id), 0) as avg_per_client
FROM ads_account_health

UNION ALL

SELECT
  'Insights' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT client_id) as clients,
  NULL as campaigns,
  NULL as earliest_date,
  NULL as latest_date,
  NULL as avg_per_client
FROM ads_insights

UNION ALL

SELECT
  'Keywords' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT client_id) as clients,
  COUNT(DISTINCT campaign_id) as campaigns,
  MIN(date) as earliest_date,
  MAX(date) as latest_date,
  NULL as avg_per_client
FROM ads_keyword_metrics;

-- ============================================
-- 2. Data distribution by client
-- ============================================
SELECT
  c.name as client_name,
  COUNT(DISTINCT acm.campaign_id) as campaigns,
  COUNT(*) as campaign_records,
  MIN(acm.date) as earliest_data,
  MAX(acm.date) as latest_data,
  (MAX(acm.date) - MIN(acm.date)) as days_of_data,
  ROUND(SUM(acm.cost), 2) as total_spend,
  SUM(acm.conversions) as total_conversions
FROM clients c
LEFT JOIN ads_campaign_metrics acm ON acm.client_id = c.id
WHERE c.is_active = true
GROUP BY c.id, c.name
ORDER BY c.name;

-- ============================================
-- 3. Daily data completeness check
-- ============================================
WITH date_series AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '180 days',
    CURRENT_DATE,
    INTERVAL '1 day'
  )::date as check_date
),
expected_records AS (
  SELECT
    ds.check_date,
    COUNT(c.id) as expected_clients,
    COUNT(c.id) * 5 as expected_campaigns -- assuming 5 campaigns per client
  FROM date_series ds
  CROSS JOIN clients c
  WHERE c.is_active = true
  GROUP BY ds.check_date
),
actual_records AS (
  SELECT
    date,
    COUNT(DISTINCT client_id) as actual_clients,
    COUNT(DISTINCT campaign_id) as actual_campaigns,
    COUNT(*) as actual_records
  FROM ads_campaign_metrics
  WHERE date >= CURRENT_DATE - INTERVAL '180 days'
  GROUP BY date
)
SELECT
  er.check_date as date,
  er.expected_clients,
  COALESCE(ar.actual_clients, 0) as actual_clients,
  er.expected_campaigns,
  COALESCE(ar.actual_campaigns, 0) as actual_campaigns,
  COALESCE(ar.actual_records, 0) as actual_records,
  CASE
    WHEN COALESCE(ar.actual_records, 0) = 0 THEN '❌ Missing'
    WHEN COALESCE(ar.actual_campaigns, 0) < er.expected_campaigns THEN '⚠️ Incomplete'
    ELSE '✅ Complete'
  END as status
FROM expected_records er
LEFT JOIN actual_records ar ON ar.date = er.check_date
ORDER BY er.check_date DESC
LIMIT 30;

-- ============================================
-- 4. Health score coverage
-- ============================================
SELECT
  c.name as client_name,
  COUNT(*) as health_records,
  MIN(ah.date) as earliest_health,
  MAX(ah.date) as latest_health,
  ROUND(AVG(ah.health_score), 1) as avg_health_score,
  MIN(ah.health_score) as min_health,
  MAX(ah.health_score) as max_health,
  SUM(ah.critical_alerts) as total_critical,
  SUM(ah.high_alerts) as total_high
FROM clients c
LEFT JOIN ads_account_health ah ON ah.client_id = c.id
WHERE c.is_active = true
GROUP BY c.id, c.name
ORDER BY c.name;

-- ============================================
-- 5. Campaign performance summary (Last 30 days)
-- ============================================
SELECT
  c.name as client_name,
  acm.campaign_name,
  COUNT(*) as days_of_data,
  ROUND(SUM(acm.cost), 2) as total_spend,
  SUM(acm.clicks) as total_clicks,
  SUM(acm.conversions) as total_conversions,
  ROUND(AVG(acm.ctr), 2) as avg_ctr,
  ROUND(AVG(acm.quality_score), 1) as avg_quality_score,
  ROUND(SUM(acm.cost) / NULLIF(SUM(acm.conversions), 0), 2) as cpa
FROM clients c
JOIN ads_campaign_metrics acm ON acm.client_id = c.id
WHERE acm.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY c.id, c.name, acm.campaign_name
ORDER BY c.name, total_spend DESC;

-- ============================================
-- 6. Data quality checks
-- ============================================

-- Check for NULL values in critical fields
SELECT
  'Campaign Metrics - NULLs' as check_type,
  COUNT(*) FILTER (WHERE cost IS NULL) as null_cost,
  COUNT(*) FILTER (WHERE clicks IS NULL) as null_clicks,
  COUNT(*) FILTER (WHERE impressions IS NULL) as null_impressions,
  COUNT(*) FILTER (WHERE conversions IS NULL) as null_conversions,
  COUNT(*) as total_records
FROM ads_campaign_metrics

UNION ALL

SELECT
  'Health Scores - NULLs' as check_type,
  COUNT(*) FILTER (WHERE health_score IS NULL) as null_health,
  COUNT(*) FILTER (WHERE critical_alerts IS NULL) as null_critical,
  COUNT(*) FILTER (WHERE high_alerts IS NULL) as null_high,
  COUNT(*) FILTER (WHERE medium_alerts IS NULL) as null_medium,
  COUNT(*) as total_records
FROM ads_account_health;

-- ============================================
-- 7. Recent data sample (Last 7 days)
-- ============================================
SELECT
  c.name as client,
  acm.campaign_name,
  acm.date,
  acm.impressions,
  acm.clicks,
  acm.cost,
  acm.conversions,
  acm.ctr,
  acm.quality_score
FROM ads_campaign_metrics acm
JOIN clients c ON c.id = acm.client_id
WHERE acm.date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY acm.date DESC, c.name, acm.campaign_name
LIMIT 50;

-- ============================================
-- 8. Check for duplicates
-- ============================================
SELECT
  'Campaign Metrics Duplicates' as check_type,
  client_id,
  campaign_id,
  date,
  COUNT(*) as duplicate_count
FROM ads_campaign_metrics
GROUP BY client_id, campaign_id, date
HAVING COUNT(*) > 1
LIMIT 10;

-- ============================================
-- SUCCESS CRITERIA
-- ============================================
-- Expected results for 3 clients, 180 days, 5 campaigns each:
--
-- ✅ Campaign Metrics: ~2,700 records (3 × 5 × 180)
-- ✅ Health Scores: 540 records (3 × 180)
-- ✅ Date Range: 180 days back from today
-- ✅ No missing dates
-- ✅ No NULL values in critical fields
-- ✅ No duplicates
-- ============================================
