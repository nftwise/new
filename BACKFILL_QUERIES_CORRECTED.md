# Backfill Data Verification Queries (CORRECTED)

The correct table name is **`client_metrics_summary`** (not "daily_rollups").

## 1. Check how many clients have backfill data

```sql
SELECT 
  COUNT(DISTINCT client_id) as clients_with_data,
  MIN(date) as earliest_date,
  MAX(date) as latest_date,
  COUNT(*) as total_records
FROM client_metrics_summary;
```

## 2. Check date range for each client

```sql
SELECT 
  c.business_name,
  c.id as client_id,
  MIN(cms.date) as first_data_date,
  MAX(cms.date) as last_data_date,
  COUNT(DISTINCT cms.date) as days_of_data,
  ROUND(AVG(cms.total_leads), 2) as avg_daily_leads
FROM clients c
LEFT JOIN client_metrics_summary cms ON c.id = cms.client_id
WHERE c.status = 'active'
GROUP BY c.id, c.business_name
ORDER BY days_of_data DESC;
```

## 3. Check how many days of data each client has

```sql
SELECT 
  c.business_name,
  COUNT(DISTINCT cms.date) as days_of_data,
  MIN(cms.date) as from_date,
  MAX(cms.date) as to_date
FROM clients c
LEFT JOIN client_metrics_summary cms ON c.id = cms.client_id
WHERE c.status = 'active'
GROUP BY c.id, c.business_name
HAVING COUNT(DISTINCT cms.date) > 0
ORDER BY days_of_data DESC;
```

## 4. Check recent backfill data (last 30 days)

```sql
SELECT 
  date,
  COUNT(DISTINCT client_id) as clients_with_data,
  SUM(total_leads) as total_leads,
  SUM(google_ads_conversions) as total_ga_conversions,
  SUM(gbp_calls) as total_gbp_calls
FROM client_metrics_summary
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY date
ORDER BY date DESC;
```

## 5. Find clients with missing data gaps

```sql
WITH date_series AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE - INTERVAL '1 day',
    '1 day'::interval
  )::date as expected_date
),
client_dates AS (
  SELECT 
    c.id as client_id,
    c.business_name,
    ds.expected_date
  FROM clients c
  CROSS JOIN date_series ds
  WHERE c.status = 'active'
)
SELECT 
  cd.business_name,
  COUNT(cd.expected_date) as expected_days,
  COUNT(cms.date) as actual_days,
  COUNT(cd.expected_date) - COUNT(cms.date) as missing_days
FROM client_dates cd
LEFT JOIN client_metrics_summary cms 
  ON cd.client_id = cms.client_id 
  AND cd.expected_date = cms.date
GROUP BY cd.client_id, cd.business_name
HAVING COUNT(cd.expected_date) - COUNT(cms.date) > 0
ORDER BY missing_days DESC;
```

## 6. Sample recent data to verify quality

```sql
SELECT 
  c.business_name,
  cms.date,
  cms.total_leads,
  cms.google_ads_conversions,
  cms.gbp_calls,
  cms.ga_sessions,
  cms.ga_new_users
FROM client_metrics_summary cms
JOIN clients c ON cms.client_id = c.id
WHERE cms.date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY cms.date DESC, c.business_name
LIMIT 50;
```

## 7. Check team member assignments for backfill verification

```sql
SELECT 
  c.business_name,
  tm.name as team_member,
  cta.service_type,
  cta.is_primary,
  cta.status
FROM clients c
JOIN client_team_assignments cta ON c.id = cta.client_id
JOIN team_members tm ON cta.team_member_id = tm.id
WHERE c.status = 'active'
  AND cta.status = 'active'
ORDER BY c.business_name, cta.is_primary DESC, cta.priority ASC;
```

## Summary

All queries above use the correct table name: **`client_metrics_summary`**

This table stores the daily rollup/summary data for each client's metrics including:
- total_leads
- google_ads_conversions  
- gbp_calls
- ga_sessions
- ga_new_users
- and other metrics

Run these queries in your Supabase SQL editor to verify backfill data.
