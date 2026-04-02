CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact_email TEXT,
  city TEXT,
  owner TEXT,
  website_url TEXT,
  address TEXT,
  phone TEXT,
  doctor_name TEXT,
  status TEXT DEFAULT 'Working',
  seo_rating INTEGER,
  ads_rating INTEGER,
  ads_budget_month TEXT,
  notes TEXT,
  has_seo BOOLEAN DEFAULT false,
  has_ads BOOLEAN DEFAULT false,
  has_gbp BOOLEAN DEFAULT false,
  has_callrail BOOLEAN DEFAULT false,
  wordpress_site TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  ga_property_id TEXT,
  gads_customer_id TEXT,
  gsc_site_url TEXT,
  gsc_id TEXT,
  gbp_location_id TEXT,
  gbp_id TEXT,
  gbp_account_id TEXT,
  callrail_account_id TEXT,
  ga_connected_email TEXT,
  gsc_connected_email TEXT,
  gbp_connected_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_configs_client_id ON service_configs(client_id);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_client_id ON users(client_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access clients" ON clients;
CREATE POLICY "Service role full access clients" ON clients
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access service_configs" ON service_configs;
CREATE POLICY "Service role full access service_configs" ON service_configs
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access users" ON users;
CREATE POLICY "Service role full access users" ON users
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own row" ON users;
CREATE POLICY "Users can read own row" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

GRANT ALL ON clients TO service_role;
GRANT ALL ON service_configs TO service_role;
GRANT ALL ON users TO service_role;
GRANT SELECT ON clients TO authenticated;
GRANT SELECT ON service_configs TO authenticated;
GRANT SELECT ON users TO authenticated;

ALTER TABLE client_team_assignments
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 100;

CREATE INDEX IF NOT EXISTS idx_client_team_assignments_status
  ON client_team_assignments(client_id, status, priority);

CREATE TABLE IF NOT EXISTS campaign_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'UNKNOWN',
  bid_strategy_type TEXT,
  target_cpa DECIMAL(12, 2) DEFAULT 0,
  target_roas DECIMAL(10, 2) DEFAULT 0,
  location_target_type TEXT,
  target_search_network BOOLEAN DEFAULT true,
  target_content_network BOOLEAN DEFAULT false,
  final_url_expansion BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (client_id, campaign_id, date)
);

CREATE TABLE IF NOT EXISTS campaign_search_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  search_term TEXT NOT NULL,
  match_type TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  cost DECIMAL(12, 2) DEFAULT 0,
  conversions DECIMAL(10, 2) DEFAULT 0,
  is_wasted_spend BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (client_id, campaign_id, search_term, date)
);

CREATE TABLE IF NOT EXISTS campaign_geo_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  location_type TEXT NOT NULL,
  location_name TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  cost DECIMAL(12, 2) DEFAULT 0,
  conversions DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (client_id, campaign_id, location_type, location_name, date)
);

CREATE TABLE IF NOT EXISTS campaign_schedule_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  hour_of_day INTEGER NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  cost DECIMAL(12, 2) DEFAULT 0,
  conversions DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (client_id, campaign_id, day_of_week, hour_of_day, date)
);

CREATE TABLE IF NOT EXISTS campaign_quality_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  ad_group_name TEXT,
  keyword_id TEXT NOT NULL,
  keyword_text TEXT,
  quality_score INTEGER DEFAULT 0,
  landing_page_experience TEXT,
  ad_relevance TEXT,
  expected_ctr TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (client_id, campaign_id, keyword_id, date)
);

CREATE TABLE IF NOT EXISTS campaign_conversion_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  conversion_action_name TEXT NOT NULL,
  conversion_type TEXT,
  conversions DECIMAL(10, 2) DEFAULT 0,
  conversion_value DECIMAL(12, 2) DEFAULT 0,
  cost_per_conversion DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (client_id, campaign_id, conversion_action_name, date)
);

CREATE TABLE IF NOT EXISTS campaign_ai_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (client_id, campaign_id, alert_type, date)
);

CREATE INDEX IF NOT EXISTS idx_campaign_settings_client_date
  ON campaign_settings(client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_search_terms_client_date
  ON campaign_search_terms(client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_geo_performance_client_date
  ON campaign_geo_performance(client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_schedule_performance_client_date
  ON campaign_schedule_performance(client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_quality_scores_client_date
  ON campaign_quality_scores(client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_conversion_actions_client_date
  ON campaign_conversion_actions(client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_ai_alerts_client_date
  ON campaign_ai_alerts(client_id, date DESC);

ALTER TABLE campaign_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_search_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_geo_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_schedule_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_quality_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_conversion_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_ai_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access campaign_settings" ON campaign_settings;
CREATE POLICY "Service role full access campaign_settings" ON campaign_settings
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access campaign_search_terms" ON campaign_search_terms;
CREATE POLICY "Service role full access campaign_search_terms" ON campaign_search_terms
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access campaign_geo_performance" ON campaign_geo_performance;
CREATE POLICY "Service role full access campaign_geo_performance" ON campaign_geo_performance
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access campaign_schedule_performance" ON campaign_schedule_performance;
CREATE POLICY "Service role full access campaign_schedule_performance" ON campaign_schedule_performance
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access campaign_quality_scores" ON campaign_quality_scores;
CREATE POLICY "Service role full access campaign_quality_scores" ON campaign_quality_scores
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access campaign_conversion_actions" ON campaign_conversion_actions;
CREATE POLICY "Service role full access campaign_conversion_actions" ON campaign_conversion_actions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access campaign_ai_alerts" ON campaign_ai_alerts;
CREATE POLICY "Service role full access campaign_ai_alerts" ON campaign_ai_alerts
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

GRANT ALL ON campaign_settings TO service_role;
GRANT ALL ON campaign_search_terms TO service_role;
GRANT ALL ON campaign_geo_performance TO service_role;
GRANT ALL ON campaign_schedule_performance TO service_role;
GRANT ALL ON campaign_quality_scores TO service_role;
GRANT ALL ON campaign_conversion_actions TO service_role;
GRANT ALL ON campaign_ai_alerts TO service_role;
