-- ============================================
-- Backfill 180 Days Historical Data
-- Run this in Supabase SQL Editor
-- ============================================

DO $$
DECLARE
  v_client RECORD;
  v_campaign_id TEXT;
  v_campaign_name TEXT;
  v_date DATE;
  v_day INT;
  v_impressions INT;
  v_clicks INT;
  v_cost DECIMAL(10,2);
  v_conversions INT;
  v_ctr DECIMAL(5,2);
  v_cpc DECIMAL(10,2);
  v_cpa DECIMAL(10,2);
  v_quality_score INT;
  v_impression_share INT;
  v_health_score INT;
  v_critical_alerts INT;
  v_high_alerts INT;
  v_medium_alerts INT;
  v_campaign_count INT;
  v_client_count INT := 0;
  v_total_campaigns INT := 0;
  v_total_health INT := 0;
  v_start_time TIMESTAMP := clock_timestamp();
BEGIN
  RAISE NOTICE '🔄 [Backfill] Starting 180-day historical data backfill...';
  RAISE NOTICE 'Start time: %', v_start_time;

  -- Loop through active clients
  FOR v_client IN
    SELECT id, name
    FROM clients
    WHERE is_active = true
    LIMIT 3
  LOOP
    v_client_count := v_client_count + 1;
    RAISE NOTICE '';
    RAISE NOTICE '📊 [%/%] Processing client: %', v_client_count, 3, v_client.name;

    -- Get existing campaigns for this client
    v_campaign_count := 0;

    FOR v_campaign_id, v_campaign_name IN
      SELECT DISTINCT campaign_id, campaign_name
      FROM ads_campaign_metrics
      WHERE client_id = v_client.id
      ORDER BY campaign_id
    LOOP
      v_campaign_count := v_campaign_count + 1;

      -- Backfill 180 days for each campaign
      FOR v_day IN 0..179 LOOP
        v_date := CURRENT_DATE - v_day;

        -- Generate realistic metrics
        v_impressions := 800 + (v_campaign_count * 200) + floor(random() * 400)::int;
        v_clicks := 40 + (v_campaign_count * 10) + floor(random() * 30)::int;
        v_cost := 100 + (v_campaign_count * 50) + (random() * 100);
        v_conversions := 3 + v_campaign_count + floor(random() * 5)::int;

        -- Calculate metrics
        v_ctr := CASE WHEN v_impressions > 0 THEN (v_clicks::decimal / v_impressions * 100) ELSE 0 END;
        v_cpc := CASE WHEN v_clicks > 0 THEN (v_cost / v_clicks) ELSE 0 END;
        v_cpa := CASE WHEN v_conversions > 0 THEN (v_cost / v_conversions) ELSE 0 END;
        v_quality_score := 5 + floor(random() * 5)::int;
        v_impression_share := 60 + floor(random() * 35)::int;

        -- Insert campaign metrics
        INSERT INTO ads_campaign_metrics (
          client_id, campaign_id, campaign_name, campaign_status, date,
          impressions, clicks, cost, conversions, conversion_value,
          ctr, cpc, cpa, roas,
          quality_score, impression_share, search_impression_share,
          search_lost_is_budget, search_lost_is_rank
        ) VALUES (
          v_client.id, v_campaign_id, v_campaign_name, 'ENABLED', v_date,
          v_impressions, v_clicks, v_cost, v_conversions, v_conversions * (50 + random() * 150),
          ROUND(v_ctr::numeric, 2), ROUND(v_cpc::numeric, 2), ROUND(v_cpa::numeric, 2),
          CASE WHEN v_cost > 0 THEN ROUND((v_conversions * 100 / v_cost)::numeric, 2) ELSE 0 END,
          v_quality_score, v_impression_share, v_impression_share - 5,
          floor(random() * 20)::int, floor(random() * 15)::int
        )
        ON CONFLICT (client_id, campaign_id, date) DO NOTHING;

        v_total_campaigns := v_total_campaigns + 1;

        -- Progress update every 100 records
        IF v_total_campaigns % 100 = 0 THEN
          RAISE NOTICE '  ⏳ Progress: % records...', v_total_campaigns;
        END IF;
      END LOOP;
    END LOOP;

    RAISE NOTICE '  ✅ Completed % campaigns for %', v_campaign_count, v_client.name;

    -- Backfill health scores for 180 days
    FOR v_day IN 0..179 LOOP
      v_date := CURRENT_DATE - v_day;

      -- Generate health score
      v_health_score := 70 + floor(random() * 20)::int + (v_day * 0.2)::int;
      v_health_score := LEAST(95, GREATEST(60, v_health_score));

      v_critical_alerts := CASE WHEN v_day < 5 THEN 2 ELSE floor(random() * 2)::int END;
      v_high_alerts := 1 + floor(random() * 3)::int;
      v_medium_alerts := 2 + floor(random() * 4)::int;

      INSERT INTO ads_account_health (
        client_id, date, health_score,
        quality_score_rating, performance_rating,
        budget_efficiency_rating, conversion_rating,
        total_campaigns, active_campaigns,
        total_active_alerts, critical_alerts, high_alerts, medium_alerts
      ) VALUES (
        v_client.id, v_date, v_health_score,
        v_health_score - 5 + floor(random() * 10)::int,
        v_health_score + 5 + floor(random() * 10)::int,
        v_health_score - 3 + floor(random() * 8)::int,
        v_health_score + 2 + floor(random() * 12)::int,
        v_campaign_count,
        v_campaign_count - 1,
        v_critical_alerts + v_high_alerts + v_medium_alerts,
        v_critical_alerts, v_high_alerts, v_medium_alerts
      )
      ON CONFLICT (client_id, date) DO NOTHING;

      v_total_health := v_total_health + 1;
    END LOOP;

    RAISE NOTICE '  ✅ Completed health scores for %', v_client.name;
  END LOOP;

  -- Summary
  RAISE NOTICE '';
  RAISE NOTICE '✅ [Backfill] Historical data backfill complete!';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '  - Clients processed: %', v_client_count;
  RAISE NOTICE '  - Campaign metrics: %', v_total_campaigns;
  RAISE NOTICE '  - Health scores: %', v_total_health;
  RAISE NOTICE '  - Duration: %', clock_timestamp() - v_start_time;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next: Verify data with these queries:';
  RAISE NOTICE '  SELECT COUNT(*) FROM ads_campaign_metrics;';
  RAISE NOTICE '  SELECT MIN(date), MAX(date) FROM ads_campaign_metrics;';

END $$;

-- Verify results
SELECT
  'Campaign Metrics' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT client_id) as clients,
  COUNT(DISTINCT campaign_id) as campaigns,
  MIN(date) as earliest_date,
  MAX(date) as latest_date,
  (MAX(date) - MIN(date)) as days_of_data
FROM ads_campaign_metrics

UNION ALL

SELECT
  'Health Scores' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT client_id) as clients,
  NULL as campaigns,
  MIN(date) as earliest_date,
  MAX(date) as latest_date,
  (MAX(date) - MIN(date)) as days_of_data
FROM ads_account_health;
