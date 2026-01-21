-- ============================================
-- Seed Demo Data for Google Ads Analysis
-- Run this in Supabase SQL Editor after migration
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
  v_total_insights INT := 0;
  v_total_health INT := 0;
BEGIN
  RAISE NOTICE '🌱 Starting demo data seed...';

  -- Loop through first 3 active clients
  FOR v_client IN
    SELECT id, name
    FROM clients
    WHERE is_active = true
    LIMIT 3
  LOOP
    v_client_count := v_client_count + 1;
    RAISE NOTICE '📊 Processing client: %', v_client.name;

    -- Create 3-5 campaigns per client
    v_campaign_count := 3 + floor(random() * 3)::int;

    FOR camp_idx IN 0..(v_campaign_count - 1) LOOP
      v_campaign_id := 'campaign_' || v_client.id || '_' || camp_idx;

      -- Campaign names
      v_campaign_name := CASE camp_idx
        WHEN 0 THEN 'Emergency Services'
        WHEN 1 THEN 'Local SEO Campaign'
        WHEN 2 THEN 'Brand Awareness'
        WHEN 3 THEN 'Competitor Targeting'
        ELSE 'Seasonal Promotions'
      END;

      -- Generate 30 days of metrics for each campaign
      FOR v_day IN 0..29 LOOP
        v_date := CURRENT_DATE - v_day;

        -- Generate realistic metrics
        v_impressions := 800 + (camp_idx * 200) + floor(random() * 400)::int;
        v_clicks := 40 + (camp_idx * 10) + floor(random() * 30)::int;
        v_cost := 100 + (camp_idx * 50) + (random() * 100);
        v_conversions := CASE
          WHEN camp_idx = 0 AND v_day < 7 THEN 0  -- Zero conversions for first campaign
          ELSE 3 + camp_idx + floor(random() * 5)::int
        END;

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
      END LOOP;

      -- Insert 10 keywords per campaign (only for today)
      FOR keyword_idx IN 0..9 LOOP
        INSERT INTO ads_keyword_metrics (
          client_id, campaign_id, keyword, match_type, date,
          impressions, clicks, cost, conversions,
          ctr, cpc, cpa, quality_score
        ) VALUES (
          v_client.id,
          v_campaign_id,
          'keyword_' || keyword_idx || '_' || v_campaign_name,
          (ARRAY['EXACT', 'PHRASE', 'BROAD'])[floor(random() * 3 + 1)::int],
          CURRENT_DATE,
          50 + floor(random() * 200)::int,
          floor(random() * 50)::int,
          random() * 100,
          floor(random() * 10)::int,
          ROUND((random() * 10)::numeric, 2),
          ROUND((random() * 5)::numeric, 2),
          ROUND((random() * 50)::numeric, 2),
          4 + floor(random() * 7)::int
        )
        ON CONFLICT (client_id, campaign_id, keyword, date) DO NOTHING;
      END LOOP;
    END LOOP;

    -- Insert critical insights
    INSERT INTO ads_insights (
      client_id, campaign_id, insight_type, severity, category,
      title, description, suggested_action,
      metric_name, metric_value, threshold_value, impact_estimate, status
    ) VALUES
    (v_client.id, 'campaign_' || v_client.id || '_0', 'critical', 'critical', 'conversions',
     'Zero Conversions Alert',
     'Campaign has received 0 conversions in the last 7 days despite $450 in spend.',
     'Review landing page, check conversion tracking, or pause campaign.',
     'conversions', 0, 1, 450, 'active'),

    (v_client.id, 'campaign_' || v_client.id || '_1', 'warning', 'high', 'quality_score',
     'Low Quality Score Detected',
     'Quality Score dropped from 7 to 4 over the past 2 weeks.',
     'Improve ad relevance, landing page experience, and expected CTR.',
     'quality_score', 4, 7, 200, 'active'),

    (v_client.id, 'campaign_' || v_client.id || '_2', 'warning', 'medium', 'ctr',
     'Below Average CTR',
     'CTR is 1.8%, below industry average of 3-5%.',
     'Test new ad copy, add extensions, or refine keyword targeting.',
     'ctr', 1.8, 3.0, 150, 'active'),

    (v_client.id, NULL, 'opportunity', 'medium', 'impression_share',
     'Lost Impression Share',
     'Losing 35% of impression share due to budget constraints.',
     'Consider increasing daily budget to capture more traffic.',
     'impression_share', 65, 80, 300, 'active');

    v_total_insights := v_total_insights + 4;

    -- Insert health scores for last 30 days
    FOR v_day IN 0..29 LOOP
      v_date := CURRENT_DATE - v_day;
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

  END LOOP;

  -- Summary
  RAISE NOTICE '';
  RAISE NOTICE '✅ Demo data created successfully!';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '  - Clients: %', v_client_count;
  RAISE NOTICE '  - Campaign Metrics: %', v_total_campaigns;
  RAISE NOTICE '  - Keywords: %', v_client_count * v_campaign_count * 10;
  RAISE NOTICE '  - Insights: %', v_total_insights;
  RAISE NOTICE '  - Health Scores: %', v_total_health;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next: Query data with SELECT statements from TESTING_GUIDE.md';

END $$;
