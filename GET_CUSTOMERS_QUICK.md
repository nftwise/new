# ⚡ QUICK: LẤY DANH SÁCH 21 KHÁCH + TRẠNG THÁI DỮ LIỆU

## 🎯 Bạn muốn gì?
- 📋 Danh sách đầy đủ 21 khách hàng
- 🔌 APIs nào được configure cho mỗi khách (GA, Ads, GSC, GBP)
- 📅 Ngày mới nhất dữ liệu được kéo về cho mỗi khách
- 📊 Status: Data fresh hay stale?

---

## ⚡ CÁCH NHANH NHẤT (2 Bước)

### Bước 1: Go to Supabase SQL Editor
```
https://supabase.com/dashboard/project/tupedninjtaarmdwppgy/sql
```

### Bước 2: Copy & Run this SQL

```sql
-- ============================================
-- DANH SÁCH KHÁCH HÀNG & TRẠNG THÁI DỮ LIỆU
-- ============================================

SELECT
  ROW_NUMBER() OVER (ORDER BY c.name) as "STT",
  c.name as "Khách hàng",
  c.slug as "Slug",
  c.city as "Thành phố",

  -- API Configurations
  COALESCE(sc.ga_property_id, '❌') as "GA",
  COALESCE(sc.gads_customer_id, '❌') as "Google Ads",
  COALESCE(sc.gsc_site_url, '❌') as "Search Console",
  COALESCE(sc.gbp_location_id, '❌') as "GBP",

  -- Latest Data
  COALESCE(MAX(cms.date)::text, '❌ NO DATA') as "Ngày mới nhất",

  -- Data Status Yesterday
  CASE
    WHEN MAX(CASE WHEN cms.date = CURRENT_DATE - INTERVAL '1 day'
                  AND cms.google_ads_conversions > 0 THEN 1 END) = 1
    THEN '✅'
    ELSE '❌'
  END as "Ads Yesterday",

  CASE
    WHEN MAX(CASE WHEN cms.date = CURRENT_DATE - INTERVAL '1 day'
                  AND cms.form_fills > 0 THEN 1 END) = 1
    THEN '✅'
    ELSE '❌'
  END as "GA Yesterday",

  CASE
    WHEN MAX(CASE WHEN cms.date = CURRENT_DATE - INTERVAL '1 day'
                  AND cms.top_keywords > 0 THEN 1 END) = 1
    THEN '✅'
    ELSE '❌'
  END as "GSC Yesterday",

  CASE
    WHEN MAX(CASE WHEN cms.date = CURRENT_DATE - INTERVAL '1 day'
                  AND (cms.gbp_calls > 0 OR cms.gbp_website_clicks > 0) THEN 1 END) = 1
    THEN '✅'
    ELSE '❌'
  END as "GBP Yesterday"

FROM clients c
LEFT JOIN service_configs sc ON c.id = sc.client_id
LEFT JOIN client_metrics_summary cms ON c.id = cms.client_id
  AND cms.period_type = 'daily'
WHERE c.is_active = true
GROUP BY c.id, c.name, c.slug, c.city,
         sc.ga_property_id, sc.gads_customer_id, sc.gsc_site_url, sc.gbp_location_id
ORDER BY c.name;
```

**Kết quả:** Bảng hiển thị 21 khách hàng với tất cả thông tin bạn cần!

---

## 📊 BẢNG KẾT QUẢ SẼ NHƯ THẾ NÀY:

| STT | Khách hàng | Slug | Thành phố | GA | Ads | GSC | GBP | Ngày mới nhất | Ads Yesterday | GA Yesterday | GSC Yesterday | GBP Yesterday |
|-----|-----------|------|-----------|----|----|-----|-----|--------------|---------------|--------------|---------------|---------------|
| 1 | Client A | client-a | LA | ✅ | ✅ | ✅ | ✅ | 2026-03-24 | ✅ | ✅ | ✅ | ✅ |
| 2 | Client B | client-b | NYC | ✅ | ✅ | ✅ | ❌ | 2026-03-24 | ✅ | ✅ | ✅ | ❌ |
| 3 | Client C | client-c | Chicago | ✅ | ❌ | ✅ | ✅ | 2026-03-23 | ❌ | ✅ | ✅ | ✅ |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| 21 | Client U | client-u | Seattle | ✅ | ✅ | ✅ | ✅ | 2026-03-24 | ✅ | ✅ | ✅ | ✅ |

---

## 📌 HIỂU KẾT QUẢ

### Cột "GA/Ads/GSC/GBP"
- **✅** = Configured (API được setup)
- **❌** = Not configured (API chưa setup)

### Cột "Ngày mới nhất"
- **2026-03-24** = Latest date data was pulled
- **❌ NO DATA** = Chưa có dữ liệu nào

### Cột "Yesterday" (Ads/GA/GSC/GBP)
- **✅** = Has data from yesterday
- **❌** = No data from yesterday (stale or not configured)

---

## ✅ WHAT SHOULD BE NORMAL

```
✅ Good Status:
- Ngày mới nhất: 2026-03-24 (yesterday or today)
- All "Yesterday" columns: ✅
- All API columns: ✅ (or ❌ if intentionally not used)

⚠️ Warning:
- Ngày mới nhất: 2026-03-22 or older (stale data)
- Some "Yesterday" columns: ❌ (data missing for that API)

🔴 Problem:
- Ngày mới nhất: ❌ NO DATA (no data at all)
```

---

## 🔧 NẾU CÓ VẤNĐỀ

### Problem: "Ngày mới nhất: ❌ NO DATA"
```
→ Run cron job manually:
curl -X POST https://ultimate-report-dashboard-main.vercel.app/api/admin/run-rollup \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Problem: "Yesterday columns: ❌"
```
→ Data is stale (> 1 day old)
→ Check if cron is running:
node scripts/check-cron-status.js

→ Or manually trigger:
POST /api/admin/run-rollup with CRON_SECRET
```

### Problem: "API columns: ❌"
```
→ API not configured for this customer
→ Go to Admin > Edit Customer
→ Add the missing API configuration
→ Re-run cron job
```

---

## 🚀 ALTERNATIVE: Run with Node.js

Nếu bạn có `.env.local` với Supabase credentials:

```bash
node scripts/get-customers-data-status.js
```

Same result, nhưng run từ terminal thay vì Supabase UI.

---

## 📋 SUMMARY

| What | How | Time |
|------|-----|------|
| Quick check (SQL) | Copy SQL vào Supabase | < 1 min |
| Detailed report (JS) | node scripts/get-customers-data-status.js | < 1 min |
| Visual check | admin.ultimate-report-dashboard-main.vercel.app | < 2 min |
| Full diagnostic | node scripts/check-cron-status.js | < 2 min |

---

## 🎯 NEXT STEPS

1. **Copy SQL query trên** (3 dòng)
2. **Go to Supabase SQL Editor**
3. **Paste & Run**
4. **Xem 21 khách hàng + data status**
5. **Done! 🎉**

---

**Bạn cần gì? 👇**
- [ ] Copy & paste SQL để chạy ngay
- [ ] Cần file có sẵn? → `scripts/get-customers-data-status.sql`
- [ ] Cần Node.js version? → `scripts/get-customers-data-status.js`
- [ ] Cần full guide? → `CUSTOMERS_DATA_STATUS.md`
