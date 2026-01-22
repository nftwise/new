-- =====================================================
-- SYSTEM_SETTINGS TABLE FOR GBP TOKEN STORAGE
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create system_settings table if not exists
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast key lookup
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for service role only (no public access)
DROP POLICY IF EXISTS "Service role can manage system_settings" ON system_settings;
CREATE POLICY "Service role can manage system_settings"
  ON system_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verify table exists
SELECT 'system_settings table created successfully' as status;
