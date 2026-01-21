-- ============================================================================
-- UPDATE GOOGLE ADS CUSTOMER IDs FROM CSV
-- ============================================================================

-- Zen Care: 5022485586
UPDATE service_configs SET gads_customer_id = '5022485586'
WHERE client_id = (SELECT id FROM clients WHERE slug = 'zen-care-physical-medicine' LIMIT 1);

-- Whole Body Wellness: 5158262337
UPDATE service_configs SET gads_customer_id = '5158262337'
WHERE client_id = (SELECT id FROM clients WHERE slug = 'whole-body-wellness' LIMIT 1);

-- Tails Animal Chiropractic: 1574876840
UPDATE service_configs SET gads_customer_id = '1574876840'
WHERE client_id = (SELECT id FROM clients WHERE slug = 'tails-animal-chiropractic' LIMIT 1);

-- Chiropractic Care Centre: 9639673835
UPDATE service_configs SET gads_customer_id = '9639673835'
WHERE client_id = (SELECT id FROM clients WHERE slug = 'chiropractic-care-centre' LIMIT 1);

-- Southport Chiropractic: 1349170500
UPDATE service_configs SET gads_customer_id = '1349170500'
WHERE client_id = (SELECT id FROM clients WHERE slug = 'southport-chiropractic' LIMIT 1);

-- Tinker Family Chiro: 3752604874
UPDATE service_configs SET gads_customer_id = '3752604874'
WHERE client_id = (SELECT id FROM clients WHERE slug = 'tinker-family-chiro' LIMIT 1);

-- Cinque Chiropractic: 8210250172
UPDATE service_configs SET gads_customer_id = '8210250172'
WHERE client_id = (SELECT id FROM clients WHERE slug = 'cinque-chiropractic' LIMIT 1);

-- Ray Chiropractic: 6644432911
UPDATE service_configs SET gads_customer_id = '6644432911'
WHERE client_id = (SELECT id FROM clients WHERE slug = 'ray-chiropractic' LIMIT 1);

-- Hood Chiropractic: 1033065858
UPDATE service_configs SET gads_customer_id = '1033065858'
WHERE client_id = (SELECT id FROM clients WHERE slug = 'hood-chiropractic' LIMIT 1);

-- North Alabama Spine & Rehab: 5707391484
UPDATE service_configs SET gads_customer_id = '5707391484'
WHERE client_id = (SELECT id FROM clients WHERE slug = 'north-alabama-spine-rehab' LIMIT 1);

-- ============================================================================
-- UPDATE HAS_ADS FLAGS
-- ============================================================================

UPDATE clients c SET has_ads = true
WHERE is_active = true
AND EXISTS (
  SELECT 1 FROM service_configs sc
  WHERE sc.client_id = c.id
  AND sc.gads_customer_id IS NOT NULL
  AND sc.gads_customer_id != ''
  AND sc.gads_customer_id != '0'
);

-- ============================================================================
-- VERIFY
-- ============================================================================

-- Run this to verify all 14+ clients now have Ads:
-- SELECT COUNT(*) as total_with_ads FROM clients WHERE is_active = true AND has_ads = true;
-- Expected: 14 or more
