# Backfill Data Check Guide

## Check Current Clients

Run this query in Supabase SQL Editor to see all active clients:

```sql
SELECT
  id,
  name,
  slug,
  contact_email,
  is_active,
  created_at
FROM clients
WHERE is_active = true
ORDER BY name;
```

## Check Backfill Data Range

Check what date range has been backfilled for each client:

```sql
SELECT
  c.name AS client_name,
  c.slug,
  MIN(dms.date) AS earliest_date,
  MAX(dms.date) AS latest_date,
  COUNT(*) AS total_days,
  SUM(CASE WHEN dms.ad_spend > 0 THEN 1 ELSE 0 END) AS days_with_ad_spend,
  SUM(CASE WHEN dms.form_fills > 0 THEN 1 ELSE 0 END) AS days_with_form_fills
FROM clients c
LEFT JOIN daily_metrics_summary dms ON c.id = dms.client_id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.slug
ORDER BY c.name;
```

## Check Recent Metrics (Last 30 Days)

```sql
SELECT
  c.name AS client_name,
  dms.date,
  dms.ad_spend,
  dms.google_ads_conversions,
  dms.form_fills,
  dms.gbp_calls,
  dms.total_leads,
  dms.cpl
FROM daily_metrics_summary dms
JOIN clients c ON dms.client_id = c.id
WHERE c.is_active = true
  AND dms.date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY c.name, dms.date DESC
LIMIT 50;
```

## Check Service Configurations

See which services each client has configured:

```sql
SELECT
  c.name AS client_name,
  c.slug,
  CASE WHEN sc.gads_customer_id IS NOT NULL AND sc.gads_customer_id != '' THEN '✓' ELSE '✗' END AS google_ads,
  CASE WHEN sc.gsc_site_url IS NOT NULL AND sc.gsc_site_url != '' THEN '✓' ELSE '✗' END AS seo,
  CASE WHEN sc.gbp_location_id IS NOT NULL AND sc.gbp_location_id != '' THEN '✓' ELSE '✗' END AS gbp,
  CASE WHEN sc.ga_property_id IS NOT NULL AND sc.ga_property_id != '' THEN '✓' ELSE '✗' END AS analytics,
  sc.gads_customer_id,
  sc.gsc_site_url,
  sc.gbp_location_id
FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
WHERE c.is_active = true
ORDER BY c.name;
```

## Check Campaigns

See Google Ads campaigns for each client:

```sql
SELECT
  c.name AS client_name,
  ca.name AS campaign_name,
  ca.status,
  ca.cost,
  ca.conversions,
  ca.clicks,
  ca.impressions,
  ca.date
FROM campaigns ca
JOIN clients c ON ca.client_id = c.id
WHERE c.is_active = true
  AND ca.date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY c.name, ca.date DESC, ca.cost DESC
LIMIT 50;
```

## Run Backfill for Missing Data

If you need to backfill data for a specific date range:

### Via API (Recommended)

```bash
curl -X POST https://your-domain.vercel.app/api/admin/backfill \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2025-12-01",
    "endDate": "2026-01-08",
    "secret": "your-cron-secret"
  }'
```

### Via Supabase (Manual)

Run the rollup for a specific date:

```bash
curl -X POST https://your-domain.vercel.app/api/admin/run-rollup \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-01-08",
    "secret": "your-cron-secret"
  }'
```

## Check Data Quality

Check for clients with no data:

```sql
SELECT
  c.name AS client_name,
  c.slug,
  c.created_at,
  COUNT(dms.id) AS days_with_data
FROM clients c
LEFT JOIN daily_metrics_summary dms ON c.id = dms.client_id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.slug, c.created_at
HAVING COUNT(dms.id) = 0
ORDER BY c.created_at DESC;
```

## Check Latest Rollup Execution

```sql
SELECT
  client_id,
  date,
  ad_spend,
  total_leads,
  cpl,
  created_at,
  updated_at
FROM daily_metrics_summary
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 100;
```

## Troubleshooting

### No Data for Client

1. Check if client has service_configs:
```sql
SELECT * FROM service_configs WHERE client_id = 'client-uuid';
```

2. Check if credentials are valid (check logs)

3. Manually trigger rollup:
```bash
curl -X POST https://your-domain.vercel.app/api/admin/run-rollup \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-01-08", "secret": "your-secret"}'
```

### Partial Data

Some services working but not others? Check:
- API credentials in environment variables
- Service-specific configurations in service_configs table
- Vercel logs for API errors

## Expected Data

For a healthy setup, you should see:
- **Daily Metrics**: Data for at least the last 30 days
- **Campaigns**: Active campaigns with recent data
- **Service Configs**: All services properly configured
- **No Gaps**: Continuous data without missing days (except weekends if applicable)

## Notes

- Backfill runs sequentially with 1-second delay between dates to avoid rate limiting
- Each date processes all active clients
- Failed dates are logged in the response
- Check Vercel logs for detailed error messages
