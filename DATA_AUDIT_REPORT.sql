-- ================================================================
-- COMPREHENSIVE DATA AUDIT REPORT
-- Kiểm tra dữ liệu SEO, Local Map (GBP), Google Ads
-- ================================================================

-- ===================================
-- 1. OVERVIEW: Tổng quan dữ liệu
-- ===================================
SELECT 
  'OVERVIEW' as report_section,
  COUNT(DISTINCT client_id) as total_clients_with_data,
  MIN(date) as earliest_data,
  MAX(date) as latest_data,
  MAX(date) - MIN(date) as days_span,
  COUNT(*) as total_records,
  ROUND(AVG(total_leads), 2) as avg_daily_leads,
  SUM(total_leads) as total_all_leads
FROM client_metrics_summary;

-- ===================================
-- 2. DATA BY SERVICE TYPE
-- Phân tích dữ liệu theo từng service
-- ===================================
SELECT 
  'DATA_BY_SERVICE' as report_section,
  c.business_name,
  
  -- SEO Data
  COUNT(DISTINCT CASE WHEN cms.seo_total_keywords > 0 THEN cms.date END) as seo_days_with_data,
  MIN(CASE WHEN cms.seo_total_keywords > 0 THEN cms.date END) as seo_first_date,
  MAX(CASE WHEN cms.seo_total_keywords > 0 THEN cms.date END) as seo_last_date,
  ROUND(AVG(cms.seo_total_keywords), 0) as seo_avg_keywords,
  
  -- Local SEO/GBP Data
  COUNT(DISTINCT CASE WHEN cms.gbp_calls > 0 OR cms.gbp_direction_requests > 0 THEN cms.date END) as gbp_days_with_data,
  MIN(CASE WHEN cms.gbp_calls > 0 OR cms.gbp_direction_requests > 0 THEN cms.date END) as gbp_first_date,
  MAX(CASE WHEN cms.gbp_calls > 0 OR cms.gbp_direction_requests > 0 THEN cms.date END) as gbp_last_date,
  ROUND(AVG(cms.gbp_calls), 1) as gbp_avg_calls,
  
  -- Google Ads Data
  COUNT(DISTINCT CASE WHEN cms.google_ads_conversions > 0 THEN cms.date END) as ads_days_with_data,
  MIN(CASE WHEN cms.google_ads_conversions > 0 THEN cms.date END) as ads_first_date,
  MAX(CASE WHEN cms.google_ads_conversions > 0 THEN cms.date END) as ads_last_date,
  ROUND(AVG(cms.google_ads_conversions), 1) as ads_avg_conversions,
  
  -- GA Data
  COUNT(DISTINCT CASE WHEN cms.ga_sessions > 0 THEN cms.date END) as ga_days_with_data,
  MIN(CASE WHEN cms.ga_sessions > 0 THEN cms.date END) as ga_first_date,
  MAX(CASE WHEN cms.ga_sessions > 0 THEN cms.date END) as ga_last_date,
  ROUND(AVG(cms.ga_sessions), 0) as ga_avg_sessions,
  
  -- Total Days
  COUNT(DISTINCT cms.date) as total_days_any_data

FROM clients c
LEFT JOIN client_metrics_summary cms ON c.id = cms.client_id
WHERE c.status = 'active'
GROUP BY c.id, c.business_name
ORDER BY total_days_any_data DESC;

-- ===================================
-- 3. DATA COMPLETENESS BY CLIENT
-- Kiểm tra độ đầy đủ của dữ liệu
-- ===================================
SELECT 
  'DATA_COMPLETENESS' as report_section,
  c.business_name,
  
  -- Check which services have data
  CASE WHEN MAX(cms.seo_total_keywords) > 0 THEN '✓ SEO' ELSE '✗ No SEO' END as has_seo_data,
  CASE WHEN MAX(cms.gbp_calls + cms.gbp_direction_requests) > 0 THEN '✓ GBP' ELSE '✗ No GBP' END as has_gbp_data,
  CASE WHEN MAX(cms.google_ads_conversions) > 0 THEN '✓ Ads' ELSE '✗ No Ads' END as has_ads_data,
  CASE WHEN MAX(cms.ga_sessions) > 0 THEN '✓ GA' ELSE '✗ No GA' END as has_ga_data,
  
  -- Date ranges
  MIN(cms.date) as first_data,
  MAX(cms.date) as last_data,
  COUNT(DISTINCT cms.date) as days_recorded,
  
  -- Check if data is recent (within last 7 days)
  CASE 
    WHEN MAX(cms.date) >= CURRENT_DATE - INTERVAL '7 days' THEN '✓ Recent'
    WHEN MAX(cms.date) >= CURRENT_DATE - INTERVAL '30 days' THEN '⚠ 1-4 weeks old'
    ELSE '✗ Stale (>30 days)'
  END as data_freshness

FROM clients c
LEFT JOIN client_metrics_summary cms ON c.id = cms.client_id
WHERE c.status = 'active'
GROUP BY c.id, c.business_name
ORDER BY MAX(cms.date) DESC;

-- ===================================
-- 4. DAILY ACTIVITY TIMELINE
-- Kiểm tra hoạt động theo ngày (30 ngày gần nhất)
-- ===================================
SELECT 
  'DAILY_ACTIVITY' as report_section,
  cms.date,
  COUNT(DISTINCT cms.client_id) as clients_with_data,
  
  -- Count by service type
  COUNT(DISTINCT CASE WHEN cms.seo_total_keywords > 0 THEN cms.client_id END) as clients_with_seo,
  COUNT(DISTINCT CASE WHEN cms.gbp_calls + cms.gbp_direction_requests > 0 THEN cms.client_id END) as clients_with_gbp,
  COUNT(DISTINCT CASE WHEN cms.google_ads_conversions > 0 THEN cms.client_id END) as clients_with_ads,
  COUNT(DISTINCT CASE WHEN cms.ga_sessions > 0 THEN cms.client_id END) as clients_with_ga,
  
  -- Totals
  SUM(cms.total_leads) as daily_total_leads,
  SUM(cms.seo_total_keywords) as daily_total_keywords,
  SUM(cms.gbp_calls) as daily_gbp_calls,
  SUM(cms.google_ads_conversions) as daily_ads_conversions,
  SUM(cms.ga_sessions) as daily_ga_sessions

FROM client_metrics_summary cms
WHERE cms.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY cms.date
ORDER BY cms.date DESC;

-- ===================================
-- 5. DATA QUALITY CHECK
-- Kiểm tra chất lượng dữ liệu (NULL, 0, outliers)
-- ===================================
SELECT 
  'DATA_QUALITY' as report_section,
  c.business_name,
  
  -- Count NULL vs 0 vs positive values
  COUNT(*) as total_records,
  
  -- SEO Quality
  COUNT(CASE WHEN cms.seo_total_keywords IS NULL THEN 1 END) as seo_null_count,
  COUNT(CASE WHEN cms.seo_total_keywords = 0 THEN 1 END) as seo_zero_count,
  COUNT(CASE WHEN cms.seo_total_keywords > 0 THEN 1 END) as seo_positive_count,
  
  -- GBP Quality
  COUNT(CASE WHEN cms.gbp_calls IS NULL THEN 1 END) as gbp_null_count,
  COUNT(CASE WHEN cms.gbp_calls = 0 THEN 1 END) as gbp_zero_count,
  COUNT(CASE WHEN cms.gbp_calls > 0 THEN 1 END) as gbp_positive_count,
  
  -- Ads Quality
  COUNT(CASE WHEN cms.google_ads_conversions IS NULL THEN 1 END) as ads_null_count,
  COUNT(CASE WHEN cms.google_ads_conversions = 0 THEN 1 END) as ads_zero_count,
  COUNT(CASE WHEN cms.google_ads_conversions > 0 THEN 1 END) as ads_positive_count,
  
  -- Detect potential issues
  CASE 
    WHEN COUNT(CASE WHEN cms.seo_total_keywords > 1000 THEN 1 END) > 0 THEN '⚠ High SEO values'
    WHEN COUNT(CASE WHEN cms.gbp_calls > 100 THEN 1 END) > 0 THEN '⚠ High GBP calls'
    WHEN COUNT(CASE WHEN cms.google_ads_conversions > 100 THEN 1 END) > 0 THEN '⚠ High Ads conversions'
    ELSE '✓ Normal range'
  END as quality_flags

FROM clients c
LEFT JOIN client_metrics_summary cms ON c.id = cms.client_id
WHERE c.status = 'active'
GROUP BY c.id, c.business_name
HAVING COUNT(*) > 0
ORDER BY total_records DESC;

-- ===================================
-- 6. SAMPLE RECENT DATA
-- Xem mẫu dữ liệu gần nhất để verify
-- ===================================
SELECT 
  'SAMPLE_DATA' as report_section,
  c.business_name,
  cms.date,
  cms.total_leads,
  cms.seo_total_keywords,
  cms.seo_top_3,
  cms.seo_top_10,
  cms.gbp_calls,
  cms.gbp_direction_requests,
  cms.google_ads_conversions,
  cms.ga_sessions,
  cms.ga_new_users
FROM client_metrics_summary cms
JOIN clients c ON cms.client_id = c.id
WHERE cms.date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY cms.date DESC, c.business_name
LIMIT 20;

-- ===================================
-- 7. SERVICE ASSIGNMENT VS DATA
-- So sánh team assignments với dữ liệu thực tế
-- ===================================
SELECT 
  'SERVICE_VS_DATA' as report_section,
  c.business_name,
  
  -- Assigned services
  STRING_AGG(DISTINCT cta.service_type, ', ') as assigned_services,
  
  -- Actual data presence
  CASE WHEN MAX(cms.seo_total_keywords) > 0 THEN 'SEO' ELSE NULL END as has_seo,
  CASE WHEN MAX(cms.gbp_calls + cms.gbp_direction_requests) > 0 THEN 'GBP' ELSE NULL END as has_gbp,
  CASE WHEN MAX(cms.google_ads_conversions) > 0 THEN 'Ads' ELSE NULL END as has_ads,
  
  -- Data match check
  CASE
    WHEN 'seo' = ANY(ARRAY_AGG(cta.service_type)) AND MAX(cms.seo_total_keywords) = 0 
      THEN '⚠ SEO assigned but no data'
    WHEN 'local_seo' = ANY(ARRAY_AGG(cta.service_type)) AND MAX(cms.gbp_calls) = 0 
      THEN '⚠ Local SEO assigned but no GBP data'
    WHEN 'google_ads' = ANY(ARRAY_AGG(cta.service_type)) AND MAX(cms.google_ads_conversions) = 0 
      THEN '⚠ Ads assigned but no conversion data'
    ELSE '✓ Data matches services'
  END as data_service_match

FROM clients c
LEFT JOIN client_team_assignments cta ON c.id = cta.client_id AND cta.status = 'active'
LEFT JOIN client_metrics_summary cms ON c.id = cms.client_id
WHERE c.status = 'active'
GROUP BY c.id, c.business_name
ORDER BY c.business_name;
