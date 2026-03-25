-- ============================================
-- GBP BACKFILL STATUS CHECK
-- Run this in Supabase to verify:
-- 1. GBP OAuth token validity
-- 2. GBP location IDs configured
-- 3. GBP data presence and freshness
-- ============================================

\echo '╔════════════════════════════════════════════════════════════╗'
\echo '║        🏢 GBP BACKFILL STATUS CHECK                        ║'
\echo '╚════════════════════════════════════════════════════════════╝'
\echo ''

-- ============================================
-- SECTION 1: GBP OAUTH TOKEN STATUS
-- ============================================

\echo '1️⃣  GBP OAUTH TOKEN STATUS'
\echo '──────────────────────────────────────────────────────────────'

SELECT
  key as "Setting",
  CASE
    WHEN value IS NULL THEN '❌ No token found'
    WHEN (value::jsonb->>'expiry_date')::bigint > (EXTRACT(EPOCH FROM NOW())::bigint * 1000)
    THEN '✅ Valid & Active'
    ELSE '❌ Expired'
  END as "Status",
  value::jsonb->>'email' as "Email",
  to_timestamp((value::jsonb->>'expiry_date')::bigint / 1000.0)::text as "Expires At",
  updated_at::text as "Last Updated"
FROM system_settings
WHERE key = 'gbp_agency_master'
UNION ALL
SELECT
  'GBP Agency Master',
  CASE
    WHEN NOT EXISTS(SELECT 1 FROM system_settings WHERE key = 'gbp_agency_master')
    THEN '❌ NOT CONFIGURED'
    ELSE '✅ Configured'
  END,
  '-',
  '-',
  '-'
WHERE NOT EXISTS(SELECT 1 FROM system_settings WHERE key = 'gbp_agency_master');

\echo ''

-- ============================================
-- SECTION 2: GBP CONFIGURATION
-- ============================================

\echo '2️⃣  GBP CONFIGURATION (Clients with Location IDs)'
\echo '──────────────────────────────────────────────────────────────'

SELECT
  ROW_NUMBER() OVER (ORDER BY c.name) as "No",
  c.name as "Customer",
  c.slug as "Slug",
  c.is_active as "Active",
  COALESCE(sc.gbp_location_id, '❌ Not Set') as "GBP Location ID",
  COALESCE(sc.ga_property_id, '-') as "GA Property",
  COALESCE(sc.gads_customer_id, '-') as "Ads Customer ID"
FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
WHERE c.is_active = true
ORDER BY c.name;

\echo ''

-- ============================================
-- SECTION 3: GBP DATA PRESENCE
-- ============================================

\echo '3️⃣  GBP DATA PRESENCE (Last 30 Days)'
\echo '──────────────────────────────────────────────────────────────'

SELECT
  c.name as "Customer",
  COUNT(DISTINCT cms.date) as "Days with Data",
  MAX(cms.date)::text as "Latest Date",
  MIN(cms.date)::text as "Oldest Date",
  CURRENT_DATE - MAX(cms.date) as "Days Old",
  SUM(CASE WHEN cms.gbp_calls > 0 THEN 1 ELSE 0 END) as "Days w/ Calls",
  SUM(CASE WHEN cms.gbp_website_clicks > 0 THEN 1 ELSE 0 END) as "Days w/ Clicks",
  SUM(CASE WHEN cms.gbp_directions > 0 THEN 1 ELSE 0 END) as "Days w/ Directions",
  COALESCE(MAX(cms.gbp_calls), 0) as "Max Calls",
  ROUND(COALESCE(AVG(NULLIF(cms.gbp_calls, 0)), 0)::numeric, 1) as "Avg Calls"
FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
LEFT JOIN client_metrics_summary cms ON
  c.id = cms.client_id
  AND cms.date >= CURRENT_DATE - INTERVAL '30 days'
  AND cms.period_type = 'daily'
WHERE c.is_active = true
  AND sc.gbp_location_id IS NOT NULL
GROUP BY c.id, c.name
ORDER BY MAX(cms.date) DESC NULLS LAST, c.name;

\echo ''

-- ============================================
-- SECTION 4: GBP DATA COMPLETENESS
-- ============================================

\echo '4️⃣  GBP DATA COMPLETENESS BY METRIC (Last 7 Days)'
\echo '──────────────────────────────────────────────────────────────'

SELECT
  date::text as "Date",
  COUNT(*) as "Total Records",
  SUM(CASE WHEN gbp_calls > 0 THEN 1 ELSE 0 END) as "Calls",
  SUM(CASE WHEN gbp_website_clicks > 0 THEN 1 ELSE 0 END) as "Clicks",
  SUM(CASE WHEN gbp_directions > 0 THEN 1 ELSE 0 END) as "Directions",
  SUM(CASE WHEN gbp_profile_views > 0 THEN 1 ELSE 0 END) as "Profile Views",
  SUM(CASE WHEN gbp_reviews_count > 0 THEN 1 ELSE 0 END) as "Reviews",
  SUM(CASE WHEN gbp_posts_count > 0 THEN 1 ELSE 0 END) as "Posts",
  SUM(CASE WHEN gbp_photos_count > 0 THEN 1 ELSE 0 END) as "Photos",
  ROUND((SUM(CASE WHEN gbp_calls > 0 THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100, 1) as "Coverage %"
FROM client_metrics_summary
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
  AND period_type = 'daily'
GROUP BY date
ORDER BY date DESC;

\echo ''

-- ============================================
-- SECTION 5: MISSING GBP DATA
-- ============================================

\echo '5️⃣  CUSTOMERS MISSING GBP DATA'
\echo '──────────────────────────────────────────────────────────────'

SELECT
  c.name as "Customer",
  CASE
    WHEN sc.gbp_location_id IS NULL THEN '❌ No GBP Location ID'
    WHEN NOT EXISTS(
      SELECT 1 FROM client_metrics_summary
      WHERE client_id = c.id
        AND date >= CURRENT_DATE - INTERVAL '1 day'
        AND period_type = 'daily'
    ) THEN '❌ No recent data'
    WHEN NOT EXISTS(
      SELECT 1 FROM client_metrics_summary
      WHERE client_id = c.id
        AND date >= CURRENT_DATE - INTERVAL '1 day'
        AND period_type = 'daily'
        AND gbp_calls > 0
    ) THEN '⚠️  Data but no calls'
    ELSE '✅ Data present'
  END as "Status"
FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
WHERE c.is_active = true
HAVING CASE
  WHEN sc.gbp_location_id IS NULL THEN '❌ No GBP Location ID'
  WHEN NOT EXISTS(
    SELECT 1 FROM client_metrics_summary
    WHERE client_id = c.id
      AND date >= CURRENT_DATE - INTERVAL '1 day'
      AND period_type = 'daily'
  ) THEN '❌ No recent data'
  WHEN NOT EXISTS(
    SELECT 1 FROM client_metrics_summary
    WHERE client_id = c.id
      AND date >= CURRENT_DATE - INTERVAL '1 day'
      AND period_type = 'daily'
      AND gbp_calls > 0
  ) THEN '⚠️  Data but no calls'
  ELSE '✅ Data present'
END != '✅ Data present'
ORDER BY c.name;

\echo ''

-- ============================================
-- SECTION 6: GBP DATA TRENDS
-- ============================================

\echo '6️⃣  GBP DATA TRENDS (Last 30 Days Summary)'
\echo '──────────────────────────────────────────────────────────────'

SELECT
  date::text as "Date",
  COUNT(*) as "Customers",
  ROUND(AVG(NULLIF(gbp_calls, 0))::numeric, 1) as "Avg Calls",
  ROUND(AVG(NULLIF(gbp_website_clicks, 0))::numeric, 1) as "Avg Clicks",
  ROUND(AVG(NULLIF(gbp_directions, 0))::numeric, 1) as "Avg Directions",
  ROUND(AVG(NULLIF(gbp_profile_views, 0))::numeric, 1) as "Avg Views",
  ROUND(AVG(NULLIF(gbp_reviews_count, 0))::numeric, 1) as "Avg Reviews"
FROM client_metrics_summary
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
  AND period_type = 'daily'
GROUP BY date
ORDER BY date DESC;

\echo ''

-- ============================================
-- SECTION 7: DIAGNOSTIC SUMMARY
-- ============================================

\echo '7️⃣  DIAGNOSTIC SUMMARY'
\echo '──────────────────────────────────────────────────────────────'

SELECT
  'GBP Token Status' as "Check",
  CASE
    WHEN EXISTS(
      SELECT 1 FROM system_settings
      WHERE key = 'gbp_agency_master'
        AND (value::jsonb->>'expiry_date')::bigint > (EXTRACT(EPOCH FROM NOW())::bigint * 1000)
    ) THEN '✅ Valid'
    ELSE '❌ Invalid/Missing'
  END as "Status"
UNION ALL
SELECT
  'Customers with GBP',
  COUNT(*) || ' customers'
FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
WHERE c.is_active = true
  AND sc.gbp_location_id IS NOT NULL
UNION ALL
SELECT
  'Days with GBP Data',
  COUNT(DISTINCT date) || ' days'
FROM client_metrics_summary
WHERE period_type = 'daily'
UNION ALL
SELECT
  'Latest GBP Data',
  COALESCE(MAX(date)::text, 'None')
FROM client_metrics_summary
WHERE period_type = 'daily'
  AND (gbp_calls > 0 OR gbp_website_clicks > 0)
UNION ALL
SELECT
  'Data Freshness',
  CASE
    WHEN MAX(date) = CURRENT_DATE - INTERVAL '1 day'
    THEN '✅ Current'
    WHEN MAX(date) = CURRENT_DATE - INTERVAL '2 days'
    THEN '⚠️  1 day old'
    ELSE '❌ Stale'
  END
FROM client_metrics_summary
WHERE period_type = 'daily'
  AND (gbp_calls > 0 OR gbp_website_clicks > 0);

\echo ''
\echo '✅ GBP Status Check Complete!'
\echo ''
