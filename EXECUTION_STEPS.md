# 🚀 EXECUTION STEPS - DATABASE MIGRATION

## Step 1: Copy SQL Migration Code
File: `db_migration.sql`

1. Go to Supabase Console: https://app.supabase.com
2. Select your project: `tupedninjtaarmdwppgy`
3. Go to **SQL Editor** → **New Query**
4. Copy tất cả nội dung từ `db_migration.sql`
5. Click **Run** (hoặc Cmd+Enter)
6. ✅ Verify: Không có error

---

## Step 2: Import Data from CSV
File: `import_csv_data.sql`

1. Trong SQL Editor, **New Query**
2. Copy tất cả nội dung từ `import_csv_data.sql`
3. Click **Run**
4. ✅ Verify: 20+ rows updated

---

## Step 3: Add WordPress Credentials (Optional)
Nếu muốn lưu WordPress password cho nhân viên:

```sql
-- Example: Insert WordPress credential for a client
SELECT insert_client_credential(
  (SELECT id FROM clients WHERE slug = 'dr-digrado'),
  'wordpress',
  'https://mychiropractice.com',
  'admin',
  'your_password_here',
  '/admin',
  'your_name'
);
```

---

## Step 4: Verify Everything

```sql
-- Check clients table (new columns)
SELECT id, name, website_url, phone, doctor_name, status, has_seo, has_ads, has_gbp
FROM clients
LIMIT 5;

-- Check service_configs (new columns)
SELECT id, client_id, ga_property_id, gsc_id, gbp_id
FROM service_configs
LIMIT 5;

-- Check client_credentials table (should be empty initially)
SELECT * FROM client_credentials;

-- Check credential_audit_log table (should be empty initially)
SELECT * FROM credential_audit_log;
```

---

## Step 5: Ready for Backfill

Once verified, you're ready to:
1. ✅ Backfill 9 months GA + GSC data
2. ✅ Backfill Google Ads data (for 6 clients with Ads)
3. ✅ Backfill GBP data (for 10 clients with GBP)

---

## 📋 WHAT WAS CREATED

### New Columns in `clients` table (14):
- website_url, address, phone, doctor_name, status
- seo_rating (1-5), ads_rating (1-5)
- ads_budget_month (TEXT like "$3000")
- notes
- has_seo, has_ads, has_gbp, has_callrail (BOOLEAN)
- wordpress_site

### New Columns in `service_configs` table (2):
- gsc_id (Google Search Console ID)
- gbp_id (Google Business Profile ID)

### New Tables:
- `client_credentials` - Store WordPress/platform login info
- `credential_audit_log` - Track who accessed what and when

### New Functions:
- `encrypt_password()` - Encrypt passwords
- `decrypt_credential()` - Admin only, decrypt + log access
- `insert_client_credential()` - Insert with encryption
- `update_service_flags()` - Auto-update has_seo, has_ads, has_gbp flags

### New Trigger:
- `trigger_update_service_flags` - Auto-update flags when service_configs changes

---

## ✅ NEXT STEPS

After executing SQL:
1. Check if backfill is ready
2. Start 9-month backfill (GA + GSC + Ads + GBP)
3. Verify data in `client_metrics_summary` table
