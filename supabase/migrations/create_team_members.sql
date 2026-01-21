-- =============================================
-- Migration: Create team_members table and assign to clients
-- Purpose: Show which team member is handling which service for each client
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/tupedninjtaarmdwppgy/sql
-- =============================================

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL,
  specialties TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create client_team_assignments table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS client_team_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL, -- 'google_ads', 'seo', 'local_seo', 'strategy', etc.
  is_primary BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,

  -- Unique constraint: one primary member per service per client
  UNIQUE(client_id, service_type, is_primary)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_active ON team_members(is_active);
CREATE INDEX IF NOT EXISTS idx_client_team_assignments_client ON client_team_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_client_team_assignments_member ON client_team_assignments(team_member_id);
CREATE INDEX IF NOT EXISTS idx_client_team_assignments_service ON client_team_assignments(service_type);

-- Comments
COMMENT ON TABLE team_members IS 'Team members who handle client accounts';
COMMENT ON TABLE client_team_assignments IS 'Assignment of team members to client services';
COMMENT ON COLUMN client_team_assignments.service_type IS 'Service type: google_ads, seo, local_seo, strategy, development, etc.';
COMMENT ON COLUMN client_team_assignments.is_primary IS 'Primary point of contact for this service';

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_team_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role full access team_members" ON team_members
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access client_team_assignments" ON client_team_assignments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON team_members TO service_role;
GRANT SELECT ON team_members TO authenticated;
GRANT ALL ON client_team_assignments TO service_role;
GRANT SELECT ON client_team_assignments TO authenticated;

-- Insert team members
INSERT INTO team_members (name, role, specialties, is_active) VALUES
  ('Sam', 'Google Ads Specialist', ARRAY['google_ads', 'ppc', 'conversion_optimization'], true),
  ('Quan', 'SEO & Local SEO Expert', ARRAY['seo', 'local_seo', 'technical_seo'], true),
  ('Thiên', 'SEO & Local SEO Expert', ARRAY['seo', 'local_seo', 'content_strategy'], true),
  ('Trieu', 'Strategic Developer', ARRAY['strategy', 'development', 'analytics'], true),
  ('An', 'Google Ads Specialist', ARRAY['google_ads', 'ppc', 'campaign_management'], true)
ON CONFLICT DO NOTHING;

-- Note: To assign team members to clients, run queries like:
-- INSERT INTO client_team_assignments (client_id, team_member_id, service_type, is_primary)
-- SELECT
--   c.id,
--   tm.id,
--   'google_ads',
--   true
-- FROM clients c
-- CROSS JOIN team_members tm
-- WHERE c.slug = 'dr-digrado' AND tm.name = 'Sam';
