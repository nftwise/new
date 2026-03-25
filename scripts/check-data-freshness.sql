-- ============================================
-- DATA FRESHNESS CHECK SCRIPT
-- Run this in Supabase SQL Editor to verify:
-- 1. Latest data for all 21 customers
-- 2. GBP backfill status
-- 3. Data sources completeness
-- ============================================

-- ============================================
-- SECTION 1: RECENT DATA SUMMARY (Last 7 Days)
-- ============================================

RAISE NOTICE '
╔════════════════════════════════════════════════════════════╗
║          📊 DATA FRESHNESS CHECK REPORT                    ║
║          Generated: %', NOW(), '
╚════════════════════════════════════════════════════════════╝
';

-- 1.1 Records by date
RAISE NOTICE '
📅 RECORDS BY DATE (Last 7 Days)
──────────────────────────────────────────────────────────────';

SELECT
  date::text as "Date",
  COUNT(*) as "Total Records",
  COUNT(DISTINCT client_id) as "Unique Customers",
  ROUND(AVG(google_ads_conversions)::numeric, 1) as "Avg Ads Conv",
  ROUND(AVG(ad_spend)::numeric, 2) as "Avg Ad Spend",
  ROUND(AVG(form_fills)::numeric, 1) as "Avg Form Fills",
  ROUND(AVG(gbp_calls)::numeric, 1) as "Avg GBP Calls"
FROM client_metrics_summary
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
  AND period_type = 'daily'
GROUP BY date
ORDER BY date DESC;

-- ============================================
-- SECTION 2: CUSTOMER DATA STATUS
-- ============================================

RAISE NOTICE '
👥 CUSTOMER DATA STATUS (Yesterday)
──────────────────────────────────────────────────────────────';

SELECT
  c.name as "Customer Name",
  COALESCE(cms.date::text, '❌ NO DATA') as "Latest Data Date",
  COALESCE(cms.google_ads_conversions, 0) as "Ads Conv",
  COALESCE(cms.ad_spend, 0)::numeric(10,2) as "Ad Spend",
  COALESCE(cms.form_fills, 0) as "Form Fills",
  COALESCE(cms.gbp_calls, 0) as "GBP Calls",
  CASE
    WHEN cms.date = CURRENT_DATE - INTERVAL '1 day' THEN '✅ Current'
    WHEN cms.date = CURRENT_DATE - INTERVAL '2 days' THEN '⚠️  1 Day Old'
    WHEN cms.date < CURRENT_DATE - INTERVAL '2 days' THEN '❌ Stale'
    ELSE '? Unknown'
  END as "Status"
FROM clients c
LEFT JOIN client_metrics_summary cms ON
  c.id = cms.client_id
  AND cms.date >= CURRENT_DATE - INTERVAL '1 day'
  AND cms.period_type = 'daily'
WHERE c.is_active = true
ORDER BY
  CASE
    WHEN cms.date = CURRENT_DATE - INTERVAL '1 day' THEN 1
    WHEN cms.date = CURRENT_DATE - INTERVAL '2 days' THEN 2
    ELSE 3
  END,
  c.name;

-- ============================================
-- SECTION 3: DATA COMPLETENESS BY API
-- ============================================

RAISE NOTICE '
📊 DATA COMPLETENESS BY API (Last 24 Hours)
──────────────────────────────────────────────────────────────';

SELECT
  date::text as "Date",
  COUNT(*) as "Total Records",
  SUM(CASE WHEN google_ads_conversions > 0 THEN 1 ELSE 0 END) as "Has Ads",
  SUM(CASE WHEN ad_spend > 0 THEN 1 ELSE 0 END) as "Has Ad $",
  SUM(CASE WHEN form_fills > 0 THEN 1 ELSE 0 END) as "Has GA Events",
  SUM(CASE WHEN top_keywords > 0 THEN 1 ELSE 0 END) as "Has GSC",
  SUM(CASE WHEN gbp_calls > 0 OR gbp_website_clicks > 0 THEN 1 ELSE 0 END) as "Has GBP",
  ROUND((SUM(CASE WHEN google_ads_conversions > 0 THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100, 1) as "Ads %",
  ROUND((SUM(CASE WHEN top_keywords > 0 THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100, 1) as "GSC %",
  ROUND((SUM(CASE WHEN gbp_calls > 0 OR gbp_website_clicks > 0 THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100, 1) as "GBP %"
FROM client_metrics_summary
WHERE date >= CURRENT_DATE - INTERVAL '1 day'
  AND period_type = 'daily'
GROUP BY date
ORDER BY date DESC;

-- ============================================
-- SECTION 4: GBP BACKFILL STATUS
-- ============================================

RAISE NOTICE '
🏢 GBP BACKFILL STATUS
──────────────────────────────────────────────────────────────';

SELECT
  c.name as "Customer",
  sc.gbp_location_id as "GBP Location ID",
  MAX(cms.date)::text as "Latest GBP Data",
  COUNT(*) as "Days with GBP",
  SUM(CASE WHEN cms.gbp_calls > 0 THEN 1 ELSE 0 END) as "Days with Calls",
  MAX(cms.gbp_calls) as "Max Calls",
  ROUND(AVG(NULLIF(cms.gbp_calls, 0))::numeric, 1) as "Avg Calls",
  ROUND(AVG(NULLIF(cms.gbp_profile_views, 0))::numeric, 1) as "Avg Profile Views"
FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
LEFT JOIN client_metrics_summary cms ON
  c.id = cms.client_id
  AND cms.period_type = 'daily'
  AND (cms.gbp_calls > 0 OR cms.gbp_website_clicks > 0)
WHERE c.is_active = true
  AND sc.gbp_location_id IS NOT NULL
GROUP BY c.name, sc.gbp_location_id
ORDER BY MAX(cms.date) DESC NULLS LAST;

-- ============================================
-- SECTION 5: GBP OAUTH TOKEN STATUS
-- ============================================

RAISE NOTICE '
🔐 GBP OAUTH TOKEN STATUS
──────────────────────────────────────────────────────────────';

SELECT
  key as "Setting Key",
  CASE
    WHEN (value::jsonb->>'expiry_date')::bigint > (EXTRACT(EPOCH FROM NOW())::bigint * 1000)
    THEN '✅ Valid'
    ELSE '❌ Expired'
  END as "Token Status",
  (value::jsonb->>'email')::text as "Email",
  to_timestamp((value::jsonb->>'expiry_date')::bigint / 1000.0) as "Expiry Time",
  updated_at as "Last Updated"
FROM system_settings
WHERE key = 'gbp_agency_master';

-- ============================================
-- SECTION 6: MISSING DATA ALERTS
-- ============================================

RAISE NOTICE '
⚠️  MISSING DATA ALERTS (Yesterday)
──────────────────────────────────────────────────────────────';

SELECT
  c.name as "Customer",
  STRING_AGG(
    CASE
      WHEN cms.id IS NULL THEN 'No record at all'
      WHEN cms.google_ads_conversions = 0 AND cms.ad_spend = 0 THEN 'Missing Ads data'
      WHEN cms.form_fills = 0 THEN 'Missing GA data'
      WHEN cms.top_keywords = 0 THEN 'Missing GSC data'
      WHEN cms.gbp_calls = 0 THEN 'Missing GBP data'
    END,
    ', '
  ) as "Issues"
FROM clients c
LEFT JOIN client_metrics_summary cms ON
  c.id = cms.client_id
  AND cms.date = CURRENT_DATE - INTERVAL '1 day'
  AND cms.period_type = 'daily'
WHERE c.is_active = true
HAVING STRING_AGG(
  CASE
    WHEN cms.id IS NULL THEN 'No record at all'
    WHEN cms.google_ads_conversions = 0 AND cms.ad_spend = 0 THEN 'Missing Ads data'
    WHEN cms.form_fills = 0 THEN 'Missing GA data'
    WHEN cms.top_keywords = 0 THEN 'Missing GSC data'
    WHEN cms.gbp_calls = 0 THEN 'Missing GBP data'
  END,
  ', '
) IS NOT NULL
ORDER BY c.name;

-- ============================================
-- SECTION 7: SUMMARY STATISTICS
-- ============================================

RAISE NOTICE '
📈 SUMMARY STATISTICS (All Time)
──────────────────────────────────────────────────────────────';

SELECT
  'Total Records' as "Metric",
  COUNT(*)::text as "Value"
FROM client_metrics_summary
UNION ALL
SELECT
  'Unique Customers',
  COUNT(DISTINCT client_id)::text
FROM client_metrics_summary
UNION ALL
SELECT
  'Date Range',
  (MIN(date)::text || ' to ' || MAX(date)::text)
FROM client_metrics_summary
UNION ALL
SELECT
  'Total Days Tracked',
  COUNT(DISTINCT date)::text
FROM client_metrics_summary
UNION ALL
SELECT
  'Avg Records/Day',
  ROUND((COUNT(*)::numeric / NULLIF(COUNT(DISTINCT date), 0)), 2)::text
FROM client_metrics_summary;

RAISE NOTICE '
✅ Data Freshness Check Complete!
──────────────────────────────────────────────────────────────';
