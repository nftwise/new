-- ============================================
-- Google Ads Analysis Tables (Simplified - No RLS)
-- Migration: 001 v2
-- Created: 2026-01-09
-- Note: RLS disabled, security handled at API level
-- ============================================

-- Campaign Metrics (daily snapshots)
CREATE TABLE IF NOT EXISTS ads_campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  campaign_status TEXT,
  date DATE NOT NULL,

  -- Performance Metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  cost DECIMAL(10, 2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_value DECIMAL(10, 2) DEFAULT 0,

  -- Calculated Metrics
  ctr DECIMAL(5, 2), -- Click-through rate
  cpc DECIMAL(10, 2), -- Cost per click
  cpa DECIMAL(10, 2), -- Cost per acquisition
  roas DECIMAL(10, 2), -- Return on ad spend

  -- Quality Metrics
  quality_score DECIMAL(3, 1),
  impression_share DECIMAL(5, 2),
  search_impression_share DECIMAL(5, 2),
  search_lost_is_budget DECIMAL(5, 2),
  search_lost_is_rank DECIMAL(5, 2),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  UNIQUE(client_id, campaign_id, date)
);

CREATE INDEX idx_ads_campaign_metrics_client_date ON ads_campaign_metrics(client_id, date DESC);
CREATE INDEX idx_ads_campaign_metrics_campaign ON ads_campaign_metrics(campaign_id);
CREATE INDEX idx_ads_campaign_metrics_date ON ads_campaign_metrics(date DESC);

-- ============================================
-- Keyword Metrics (top performers only)
CREATE TABLE IF NOT EXISTS ads_keyword_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL,
  ad_group_id TEXT,
  keyword TEXT NOT NULL,
  match_type TEXT,
  date DATE NOT NULL,

  -- Performance
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  cost DECIMAL(10, 2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,

  -- Calculated
  ctr DECIMAL(5, 2),
  cpc DECIMAL(10, 2),
  cpa DECIMAL(10, 2),

  -- Quality
  quality_score INTEGER,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(client_id, campaign_id, keyword, date)
);

CREATE INDEX idx_ads_keyword_metrics_client_date ON ads_keyword_metrics(client_id, date DESC);
CREATE INDEX idx_ads_keyword_metrics_campaign ON ads_keyword_metrics(campaign_id);

-- ============================================
-- Insights & Alerts
CREATE TABLE IF NOT EXISTS ads_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  campaign_id TEXT,
  ad_group_id TEXT,
  keyword TEXT,

  -- Insight Details
  insight_type TEXT NOT NULL CHECK (insight_type IN ('warning', 'opportunity', 'recommendation', 'critical')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL CHECK (category IN ('quality_score', 'budget', 'ctr', 'conversions', 'wasted_spend', 'impression_share')),

  -- Description
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  suggested_action TEXT,

  -- Metrics
  metric_name TEXT,
  metric_value DECIMAL(10, 2),
  threshold_value DECIMAL(10, 2),
  impact_estimate DECIMAL(10, 2), -- Estimated $ impact

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed', 'in_progress')),
  resolved_at TIMESTAMP,
  resolved_by UUID,

  -- Timestamps
  detected_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ads_insights_client ON ads_insights(client_id, status);
CREATE INDEX idx_ads_insights_severity ON ads_insights(severity, status);
CREATE INDEX idx_ads_insights_detected ON ads_insights(detected_at DESC);

-- ============================================
-- Account Health Score (daily)
CREATE TABLE IF NOT EXISTS ads_account_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Overall Score (0-100)
  health_score INTEGER CHECK (health_score BETWEEN 0 AND 100),

  -- Component Scores
  quality_score_rating INTEGER,
  performance_rating INTEGER,
  budget_efficiency_rating INTEGER,
  conversion_rating INTEGER,

  -- Counts
  total_campaigns INTEGER DEFAULT 0,
  active_campaigns INTEGER DEFAULT 0,
  total_active_alerts INTEGER DEFAULT 0,
  critical_alerts INTEGER DEFAULT 0,
  high_alerts INTEGER DEFAULT 0,
  medium_alerts INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(client_id, date)
);

CREATE INDEX idx_ads_account_health_client_date ON ads_account_health(client_id, date DESC);

-- ============================================
-- Ad Group Metrics (optional - for detailed analysis)
CREATE TABLE IF NOT EXISTS ads_ad_group_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL,
  ad_group_id TEXT NOT NULL,
  ad_group_name TEXT NOT NULL,
  date DATE NOT NULL,

  -- Performance
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  cost DECIMAL(10, 2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,

  -- Calculated
  ctr DECIMAL(5, 2),
  cpc DECIMAL(10, 2),
  cpa DECIMAL(10, 2),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(client_id, campaign_id, ad_group_id, date)
);

CREATE INDEX idx_ads_ad_group_metrics_client_date ON ads_ad_group_metrics(client_id, date DESC);

-- ============================================
-- Functions & Triggers

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ads_campaign_metrics_updated_at
  BEFORE UPDATE ON ads_campaign_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ads_insights_updated_at
  BEFORE UPDATE ON ads_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments
COMMENT ON TABLE ads_campaign_metrics IS 'Daily campaign performance metrics from Google Ads';
COMMENT ON TABLE ads_keyword_metrics IS 'Top 30 keyword metrics per campaign per day';
COMMENT ON TABLE ads_insights IS 'Automated insights and alerts detected by the system';
COMMENT ON TABLE ads_account_health IS 'Daily account health scores (0-100)';
COMMENT ON TABLE ads_ad_group_metrics IS 'Ad group level performance metrics';

-- ============================================
-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Google Ads Analysis tables created successfully!';
  RAISE NOTICE 'Created 5 tables:';
  RAISE NOTICE '  - ads_campaign_metrics';
  RAISE NOTICE '  - ads_keyword_metrics';
  RAISE NOTICE '  - ads_insights';
  RAISE NOTICE '  - ads_account_health';
  RAISE NOTICE '  - ads_ad_group_metrics';
  RAISE NOTICE '';
  RAISE NOTICE 'Note: RLS is disabled. Security handled at API level.';
END $$;
