ALTER TABLE client_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their client campaigns" ON client_campaigns;
CREATE POLICY "Users can view their client campaigns" ON client_campaigns
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT client_id FROM users WHERE id = auth.uid()
    )
  );
