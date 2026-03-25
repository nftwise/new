-- ============================================
-- GET FULL LIST OF CUSTOMERS & DATA STATUS
-- Run in Supabase SQL Editor
-- Shows: All 21 customers + APIs + Latest data date
-- ============================================

SELECT
  ROW_NUMBER() OVER (ORDER BY c.name) as "STT",
  c.id as "Customer ID",
  c.name as "Khách hàng",
  c.slug as "Slug",
  c.city as "Thành phố",
  c.is_active as "Active",

  -- API Configurations
  COALESCE(sc.ga_property_id, '❌') as "GA Property",
  COALESCE(sc.gads_customer_id, '❌') as "Ads Customer ID",
  COALESCE(sc.gsc_site_url, '❌') as "GSC URL",
  COALESCE(sc.gbp_location_id, '❌') as "GBP Location",

  -- Latest Data Status
  COALESCE(MAX(cms.date)::text, '❌ NO DATA') as "Ngày mới nhất",
  (CURRENT_DATE - MAX(cms.date))::text as "Tuổi dữ liệu",

  -- Record Count
  COUNT(DISTINCT cms.date) as "Số ngày có dữ liệu",

  -- API Data Presence (Latest Day)
  CASE
    WHEN MAX(CASE WHEN cms.date = CURRENT_DATE - INTERVAL '1 day'
                  AND cms.google_ads_conversions > 0 THEN 1 END) = 1
    THEN '✅'
    ELSE '❌'
  END as "Ads Data",

  CASE
    WHEN MAX(CASE WHEN cms.date = CURRENT_DATE - INTERVAL '1 day'
                  AND cms.form_fills > 0 THEN 1 END) = 1
    THEN '✅'
    ELSE '❌'
  END as "GA Data",

  CASE
    WHEN MAX(CASE WHEN cms.date = CURRENT_DATE - INTERVAL '1 day'
                  AND cms.top_keywords > 0 THEN 1 END) = 1
    THEN '✅'
    ELSE '❌'
  END as "GSC Data",

  CASE
    WHEN MAX(CASE WHEN cms.date = CURRENT_DATE - INTERVAL '1 day'
                  AND (cms.gbp_calls > 0 OR cms.gbp_website_clicks > 0) THEN 1 END) = 1
    THEN '✅'
    ELSE '❌'
  END as "GBP Data"

FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
LEFT JOIN client_metrics_summary cms ON c.id = cms.client_id
  AND cms.period_type = 'daily'
WHERE c.is_active = true
GROUP BY c.id, c.name, c.slug, c.city, c.is_active,
         sc.ga_property_id, sc.gads_customer_id, sc.gsc_site_url, sc.gbp_location_id
ORDER BY c.name;
