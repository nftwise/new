# 📊 Data Audit Report - Hướng dẫn sử dụng

File này giúp bạn kiểm tra chi tiết dữ liệu SEO, Local Map (GBP), và Google Ads đã được lưu trong database.

## 🎯 Mục đích

Audit report này sẽ cho bạn biết:
- Dữ liệu được lưu từ ngày nào đến ngày nào
- Service nào có dữ liệu (SEO, GBP, Ads, GA)
- Độ đầy đủ của dữ liệu mỗi client
- Dữ liệu có còn fresh không (cập nhật trong 7 ngày)
- So sánh giữa services được assign và dữ liệu thực tế

## 📁 Files

1. **DATA_AUDIT_REPORT.sql** - File SQL queries chính
2. **BACKFILL_QUERIES_CORRECTED.md** - Queries để kiểm tra backfill data

## 🚀 Cách sử dụng

### Bước 1: Mở Supabase SQL Editor

1. Truy cập Supabase Dashboard
2. Vào **SQL Editor**
3. Click **New Query**

### Bước 2: Chạy từng query trong DATA_AUDIT_REPORT.sql

File có 7 sections, chạy lần lượt:

#### **1. OVERVIEW - Tổng quan**
```sql
-- Copy và paste query section 1
-- Kết quả sẽ cho biết:
-- - Có bao nhiêu clients có data
-- - Data từ ngày nào đến ngày nào
-- - Tổng số records và leads
```

**Kết quả mẫu:**
| total_clients_with_data | earliest_data | latest_data | days_span | total_records | avg_daily_leads | total_all_leads |
|------------------------|---------------|-------------|-----------|---------------|-----------------|-----------------|
| 15                     | 2025-12-01    | 2026-01-08  | 38        | 570           | 5.23            | 2,981           |

#### **2. DATA BY SERVICE - Phân tích theo service**
```sql
-- Copy và paste query section 2
-- Kết quả chi tiết cho TỪNG CLIENT:
-- - SEO: bao nhiêu ngày có data, từ ngày nào, trung bình keywords
-- - GBP: bao nhiêu ngày có data, từ ngày nào, trung bình calls
-- - Ads: bao nhiêu ngày có data, từ ngày nào, trung bình conversions
-- - GA: bao nhiêu ngày có data, từ ngày nào, trung bình sessions
```

**Kết quả mẫu:**
| business_name | seo_days | seo_first | seo_last | seo_avg | gbp_days | gbp_first | gbp_last | gbp_avg | ads_days | ads_first | ads_last | ads_avg |
|--------------|----------|-----------|----------|---------|----------|-----------|----------|---------|----------|-----------|----------|---------|
| ABC Chiro    | 38       | 2025-12-01| 2026-01-08| 245     | 38       | 2025-12-01| 2026-01-08| 3.2     | 35       | 2025-12-04| 2026-01-08| 8.5     |

#### **3. DATA COMPLETENESS - Độ đầy đủ**
```sql
-- Copy và paste query section 3
-- Kết quả cho biết:
-- - Client nào có SEO data (✓/✗)
-- - Client nào có GBP data (✓/✗)
-- - Client nào có Ads data (✓/✗)
-- - Client nào có GA data (✓/✗)
-- - Data có fresh không (✓ Recent / ⚠ Old / ✗ Stale)
```

**Kết quả mẫu:**
| business_name | has_seo | has_gbp | has_ads | has_ga | first_data | last_data | days_recorded | data_freshness |
|--------------|---------|---------|---------|--------|------------|-----------|---------------|----------------|
| ABC Chiro    | ✓ SEO   | ✓ GBP   | ✓ Ads   | ✓ GA   | 2025-12-01 | 2026-01-08| 38            | ✓ Recent       |
| XYZ Health   | ✓ SEO   | ✗ No GBP| ✗ No Ads| ✓ GA   | 2025-12-15 | 2025-12-25| 10            | ✗ Stale (>30)  |

#### **4. DAILY ACTIVITY - Timeline hàng ngày**
```sql
-- Copy và paste query section 4
-- Kết quả cho biết MỖI NGÀY (30 ngày gần nhất):
-- - Có bao nhiêu clients có data
-- - Bao nhiêu clients có SEO, GBP, Ads, GA
-- - Tổng leads, keywords, calls, conversions mỗi ngày
```

**Kết quả mẫu:**
| date       | clients_with_data | clients_with_seo | clients_with_gbp | clients_with_ads | daily_total_leads |
|------------|-------------------|------------------|------------------|------------------|-------------------|
| 2026-01-08 | 15                | 15               | 12               | 10               | 87                |
| 2026-01-07 | 15                | 15               | 12               | 10               | 92                |

#### **5. DATA QUALITY - Chất lượng dữ liệu**
```sql
-- Copy và paste query section 5
-- Kết quả kiểm tra:
-- - Có bao nhiêu records NULL
-- - Có bao nhiêu records = 0
-- - Có bao nhiêu records > 0
-- - Có giá trị bất thường không (quá cao)
```

**Kết quả mẫu:**
| business_name | total_records | seo_null | seo_zero | seo_positive | gbp_null | gbp_zero | gbp_positive | quality_flags |
|--------------|---------------|----------|----------|--------------|----------|----------|--------------|---------------|
| ABC Chiro    | 38            | 0        | 0        | 38           | 0        | 5        | 33           | ✓ Normal      |

#### **6. SAMPLE RECENT DATA - Mẫu dữ liệu gần nhất**
```sql
-- Copy và paste query section 6
-- Kết quả hiển thị 20 records gần nhất
-- Giúp bạn XEM TRỰC TIẾP dữ liệu thực tế
```

**Kết quả mẫu:**
| business_name | date       | total_leads | seo_keywords | seo_top_3 | seo_top_10 | gbp_calls | ads_conversions | ga_sessions |
|--------------|------------|-------------|--------------|-----------|------------|-----------|----------------|-------------|
| ABC Chiro    | 2026-01-08 | 6           | 245          | 12        | 45         | 4         | 9              | 156         |

#### **7. SERVICE VS DATA - So sánh assigned services với data**
```sql
-- Copy và paste query section 7
-- Kết quả cho biết:
-- - Client được assign services nào
-- - Client có data cho services nào
-- - Có mismatch không (assigned nhưng ko có data)
```

**Kết quả mẫu:**
| business_name | assigned_services    | has_seo | has_gbp | has_ads | data_service_match           |
|--------------|---------------------|---------|---------|---------|------------------------------|
| ABC Chiro    | seo, local_seo, ads | SEO     | GBP     | Ads     | ✓ Data matches services      |
| XYZ Health   | seo, local_seo      | SEO     | NULL    | NULL    | ⚠ Local SEO assigned but no GBP data |

## 💡 Tips

### Nếu thấy "✗ No data"
Có thể do:
1. Chưa có API credentials (GA, GBP, Ads)
2. API chưa được authorize
3. Backfill chưa chạy cho client đó
4. Client không có activity thực sự

### Nếu thấy "✗ Stale (>30 days)"
Có thể do:
1. Cron job không chạy
2. API credentials expired
3. Client bị deactivated
4. Có lỗi trong run-rollup API

### Nếu thấy "⚠ Service assigned but no data"
Có thể do:
1. Client mới được assign, chưa có data
2. API chưa được setup
3. Service type assignment sai

## 📋 Checklist khi audit

- [ ] Chạy query 1 (OVERVIEW) để biết tổng quan
- [ ] Chạy query 2 (DATA BY SERVICE) để xem chi tiết từng client
- [ ] Chạy query 3 (DATA COMPLETENESS) để check độ đầy đủ
- [ ] Chạy query 4 (DAILY ACTIVITY) để xem timeline
- [ ] Chạy query 5 (DATA QUALITY) để phát hiện vấn đề
- [ ] Chạy query 6 (SAMPLE DATA) để verify dữ liệu thực tế
- [ ] Chạy query 7 (SERVICE VS DATA) để tìm mismatches
- [ ] Note lại clients nào thiếu data
- [ ] Plan để fix missing/stale data

## 🔧 Actions sau khi audit

### Nếu cần backfill data:
```bash
# Backfill 30 ngày gần nhất
curl -X POST https://your-app.vercel.app/api/admin/backfill \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2025-12-01",
    "endDate": "2026-01-08",
    "secret": "your-cron-secret"
  }'
```

### Nếu cần check API connections:
1. Vào admin dashboard
2. Check client configurations
3. Re-authorize APIs nếu cần

### Nếu cần check cron jobs:
1. Kiểm tra Vercel cron settings
2. Check logs: `vercel logs`
3. Test manually: `/api/admin/run-rollup`

## 📊 Expected Data Structure

Table: **client_metrics_summary**

Fields:
- `client_id` - UUID của client
- `date` - Ngày của data
- `total_leads` - Tổng leads (sum tất cả sources)
- SEO fields: `seo_total_keywords`, `seo_top_3`, `seo_top_10`, `seo_top_20`
- GBP fields: `gbp_calls`, `gbp_direction_requests`, `gbp_website_clicks`
- Ads fields: `google_ads_conversions`, `google_ads_cost`, `google_ads_clicks`
- GA fields: `ga_sessions`, `ga_new_users`, `ga_pageviews`

## ❓ FAQ

**Q: Tại sao có clients không có data?**
A: Có thể clients mới, chưa connect APIs, hoặc không có activity.

**Q: Tại sao data bị gaps (thiếu ngày)?**
A: Có thể API rate limit, cron job failed, hoặc thực sự không có activity ngày đó.

**Q: Làm sao để có data real-time?**
A: Data được cập nhật daily qua cron job. Không phải real-time.

**Q: Tôi có thể delete old data không?**
A: Có thể, nhưng nên backup trước. Data cũ hữu ích cho historical reports.

## 📞 Support

Nếu có vấn đề:
1. Check Vercel logs
2. Check Supabase logs
3. Verify API credentials
4. Run manual rollup test
