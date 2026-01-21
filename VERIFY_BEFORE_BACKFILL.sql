-- ============================================================================
-- COMPREHENSIVE VERIFICATION BEFORE BACKFILL
-- ============================================================================

-- 1. OVERALL STATS
SELECT
  COUNT(*) as total_active_clients,
  COUNT(CASE WHEN website_url IS NOT NULL THEN 1 END) as with_website,
  COUNT(CASE WHEN has_seo THEN 1 END) as with_seo,
  COUNT(CASE WHEN has_ads THEN 1 END) as with_ads,
  COUNT(CASE WHEN has_gbp THEN 1 END) as with_gbp,
  COUNT(CASE WHEN has_callrail THEN 1 END) as with_callrail
FROM clients WHERE is_active = true;

-- 2. DETAILED CLIENT LIST WITH ALL INFO
SELECT
  c.name,
  c.slug,
  c.website_url,
  c.phone,
  c.doctor_name,
  c.status,
  c.seo_rating,
  c.ads_rating,
  c.ads_budget_month,
  c.has_seo,
  c.has_ads,
  c.has_gbp,
  c.has_callrail,
  sc.ga_property_id,
  sc.gads_customer_id,
  sc.gsc_site_url,
  sc.gbp_location_id
FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
WHERE c.is_active = true
ORDER BY c.name;

-- 3. CLIENTS WITH SEO (GSC)
SELECT COUNT(*) as seo_clients, 'Google Search Console' as service
FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
WHERE c.is_active = true
AND sc.gsc_site_url IS NOT NULL
AND sc.gsc_site_url != '';

-- 4. CLIENTS WITH GOOGLE ADS
SELECT COUNT(*) as ads_clients, 'Google Ads' as service
FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
WHERE c.is_active = true
AND sc.gads_customer_id IS NOT NULL
AND sc.gads_customer_id != ''
AND sc.gads_customer_id != '0';

-- 5. CLIENTS WITH GOOGLE ANALYTICS
SELECT COUNT(*) as ga_clients, 'Google Analytics' as service
FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
WHERE c.is_active = true
AND sc.ga_property_id IS NOT NULL
AND sc.ga_property_id != '';

-- 6. CLIENTS WITH GBP
SELECT COUNT(*) as gbp_clients, 'Google Business Profile' as service
FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
WHERE c.is_active = true
AND sc.gbp_location_id IS NOT NULL
AND sc.gbp_location_id != '';

-- 7. LIST ALL GOOGLE ADS CLIENTS WITH THEIR IDs
SELECT c.name, sc.gads_customer_id
FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
WHERE c.is_active = true
AND sc.gads_customer_id IS NOT NULL
AND sc.gads_customer_id != ''
AND sc.gads_customer_id != '0'
ORDER BY c.name;

-- 8. LIST ALL GBP CLIENTS WITH THEIR LOCATION IDs
SELECT c.name, sc.gbp_location_id
FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
WHERE c.is_active = true
AND sc.gbp_location_id IS NOT NULL
AND sc.gbp_location_id != ''
ORDER BY c.name;

-- 9. CHECK FOR MISSING DATA
SELECT
  'Missing GA Property ID' as issue,
  COUNT(*) as count,
  GROUP_CONCAT(name) as affected_clients
FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
WHERE c.is_active = true
AND (sc.ga_property_id IS NULL OR sc.ga_property_id = '')

UNION ALL

SELECT
  'Missing GSC URL' as issue,
  COUNT(*) as count,
  GROUP_CONCAT(name) as affected_clients
FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
WHERE c.is_active = true
AND (sc.gsc_site_url IS NULL OR sc.gsc_site_url = '')

UNION ALL

SELECT
  'Missing website_url in clients' as issue,
  COUNT(*) as count,
  GROUP_CONCAT(name) as affected_clients
FROM clients c
WHERE c.is_active = true
AND c.website_url IS NULL;

-- 10. VERIFY SERVICE FLAGS MATCH ACTUAL DATA
SELECT
  c.name,
  c.has_seo,
  (sc.gsc_site_url IS NOT NULL AND sc.gsc_site_url != '') as should_have_seo,
  c.has_ads,
  (sc.gads_customer_id IS NOT NULL AND sc.gads_customer_id != '' AND sc.gads_customer_id != '0') as should_have_ads,
  c.has_gbp,
  (sc.gbp_location_id IS NOT NULL AND sc.gbp_location_id != '') as should_have_gbp
FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
WHERE c.is_active = true
AND (
  c.has_seo != (sc.gsc_site_url IS NOT NULL AND sc.gsc_site_url != '')
  OR c.has_ads != (sc.gads_customer_id IS NOT NULL AND sc.gads_customer_id != '' AND sc.gads_customer_id != '0')
  OR c.has_gbp != (sc.gbp_location_id IS NOT NULL AND sc.gbp_location_id != '')
);

-- 11. VERIFY NEW TABLES EXIST
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('client_credentials', 'credential_audit_log')
ORDER BY table_name;

-- 12. COUNT RECORDS IN NEW TABLES
SELECT
  'client_credentials' as table_name,
  COUNT(*) as row_count
FROM client_credentials

UNION ALL

SELECT
  'credential_audit_log' as table_name,
  COUNT(*) as row_count
FROM credential_audit_log;

-- ============================================================================
-- SUMMARY REPORT
-- ============================================================================

-- Run all the above queries and verify:
-- ✓ Query 1: Should show 24 total_active_clients, 24 with_seo, 14 with_ads, 9+ with_gbp
-- ✓ Query 2: Should show 24 rows with all client details
-- ✓ Query 3: Should show 24 SEO clients
-- ✓ Query 4: Should show 14 Google Ads clients
-- ✓ Query 5: Should show 24 GA clients
-- ✓ Query 6: Should show 9 GBP clients
-- ✓ Query 7: Should show 14 clients with valid Ads IDs
-- ✓ Query 8: Should show 9 clients with valid GBP Location IDs
-- ✓ Query 9: Should show 0 missing data (no issues)
-- ✓ Query 10: Should show 0 rows (flags match actual data)
-- ✓ Query 11: Should show 2 tables (client_credentials, credential_audit_log)
-- ✓ Query 12: Should show 0 rows in both tables (empty initially)

-- If all checks pass ✓✓✓, proceed with backfill!
