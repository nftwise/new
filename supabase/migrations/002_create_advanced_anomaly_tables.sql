-- ============================================
-- Advanced Anomaly Detection Tables
-- Migration: 002
-- Created: 2026-01-16
-- ============================================

CREATE TABLE IF NOT EXISTS ads_baseline_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  day_of_week INTEGER NOT NULL,
  week_of_month INTEGER NOT NULL,
  month INTEGER NOT NULL,
  mean DECIMAL(10, 4) NOT NULL,
  std_dev DECIMAL(10, 4) NOT NULL,
  p25 DECIMAL(10, 4),
  p50 DECIMAL(10, 4),
  p75 DECIMAL(10, 4),
  ma_7day DECIMAL(10, 4),
  ema_7day DECIMAL(10, 4),
  sample_size INTEGER DEFAULT 1,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(client_id, campaign_id, metric_name, day_of_week, week_of_month, month)
);

CREATE INDEX IF NOT EXISTS idx_baseline_stats_client_date ON ads_baseline_stats(client_id, day_of_week, week_of_month);
CREATE INDEX IF NOT EXISTS idx_baseline_stats_metric ON ads_baseline_stats(campaign_id, metric_name);

CREATE TABLE IF NOT EXISTS ads_cohort_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_type TEXT NOT NULL,
  cohort_value TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  date DATE NOT NULL,
  p5 DECIMAL(10, 4),
  p10 DECIMAL(10, 4),
  p25 DECIMAL(10, 4),
  p50 DECIMAL(10, 4),
  p75 DECIMAL(10, 4),
  p90 DECIMAL(10, 4),
  p95 DECIMAL(10, 4),
  cohort_mean DECIMAL(10, 4),
  cohort_std DECIMAL(10, 4),
  account_count INTEGER DEFAULT 1,
  calculated_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(cohort_type, cohort_value, metric_name, date)
);

CREATE INDEX IF NOT EXISTS idx_cohort_benchmarks_lookup ON ads_cohort_benchmarks(cohort_type, cohort_value, metric_name);
CREATE INDEX IF NOT EXISTS idx_cohort_benchmarks_date ON ads_cohort_benchmarks(date DESC);

CREATE TABLE IF NOT EXISTS ads_correlation_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  metric_a TEXT NOT NULL,
  metric_b TEXT NOT NULL,
  lag_days INTEGER DEFAULT 0,
  correlation_coefficient DECIMAL(5, 4) NOT NULL,
  p_value DECIMAL(10, 8),
  sample_size INTEGER DEFAULT 0,
  pattern_type TEXT,
  explanation TEXT,
  is_validated BOOLEAN DEFAULT FALSE,
  confidence DECIMAL(3, 2) DEFAULT 0.5,
  detected_at TIMESTAMP DEFAULT NOW(),
  last_validated TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(client_id, metric_a, metric_b, lag_days)
);

CREATE INDEX IF NOT EXISTS idx_correlation_patterns_client ON ads_correlation_patterns(client_id);
CREATE INDEX IF NOT EXISTS idx_correlation_patterns_metrics ON ads_correlation_patterns(metric_a, metric_b);

CREATE TABLE IF NOT EXISTS ads_anomaly_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id UUID REFERENCES ads_insights(id) ON DELETE CASCADE,
  is_true_positive BOOLEAN,
  is_false_positive BOOLEAN,
  user_notes TEXT,
  action_taken TEXT,
  outcome TEXT,
  estimated_impact_usd DECIMAL(10, 2),
  days_to_resolution INTEGER,
  feedback_by UUID REFERENCES users(id),
  feedback_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anomaly_feedback_insight ON ads_anomaly_feedback(insight_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_feedback_positive ON ads_anomaly_feedback(is_true_positive, is_false_positive);

ALTER TABLE ads_insights ADD COLUMN IF NOT EXISTS detection_method TEXT;
ALTER TABLE ads_insights ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5, 4);
ALTER TABLE ads_insights ADD COLUMN IF NOT EXISTS methods_agreed TEXT;
ALTER TABLE ads_insights ADD COLUMN IF NOT EXISTS seasonal_adjusted BOOLEAN DEFAULT FALSE;
ALTER TABLE ads_insights ADD COLUMN IF NOT EXISTS cohort_percentile INTEGER;
ALTER TABLE ads_insights ADD COLUMN IF NOT EXISTS leading_metric TEXT;
ALTER TABLE ads_insights ADD COLUMN IF NOT EXISTS leading_metric_trend TEXT;
ALTER TABLE ads_insights ADD COLUMN IF NOT EXISTS correlated_metrics TEXT;

CREATE INDEX IF NOT EXISTS idx_ads_insights_detection_method ON ads_insights(detection_method);
CREATE INDEX IF NOT EXISTS idx_ads_insights_confidence ON ads_insights(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_ads_insights_seasonal ON ads_insights(seasonal_adjusted);
