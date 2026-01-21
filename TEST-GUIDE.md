# 🧪 Test Guide - Dashboard Performance Testing

## Option B: Test với Mock Data (RECOMMENDED để test nhanh)

### Bước 1: Kiểm tra Supabase có clients chưa

```sql
-- Chạy query này trong Supabase SQL Editor
SELECT id, name, slug, is_active FROM clients WHERE is_active = true LIMIT 5;
```

**Nếu CHƯA có clients**, tạo client test:

```sql
-- Tạo 1 client test
INSERT INTO clients (name, slug, city, is_active)
VALUES ('Test Client', 'test-client', 'Los Angeles, CA', true);
```

---

### Bước 2: Seed Mock Data (30 ngày)

**Không cần API credentials, không cần .env setup!**

```bash
# Start dev server (terminal 1)
cd ultimate-report-dashboard-main
npm install
npm run dev
```

```bash
# Seed mock data (terminal 2)
curl -X POST http://localhost:3000/api/admin/seed-mock-data \
  -H "Content-Type: application/json" \
  -d '{}'

# Hoặc với secret nếu có CRON_SECRET trong .env
curl -X POST http://localhost:3000/api/admin/seed-mock-data \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-secret"}'
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Seeded 30 days of data for 5 clients",
  "records": 150,
  "clients": [...],
  "duration": 234
}
```

---

### Bước 3: Test Fast Endpoint Performance

```bash
# Test admin overview endpoint
time curl "http://localhost:3000/api/admin/overview-fast?startDate=2025-12-07&endDate=2026-01-06"
```

**Expected:**
- ✅ Response time: **< 100ms**
- ✅ Returns data cho all clients
- ✅ Summary metrics calculated

```bash
# Test client dashboard endpoint
time curl "http://localhost:3000/api/client-dashboard?clientId=test-client&startDate=2025-12-07&endDate=2026-01-06"
```

**Expected:**
- ✅ Response time: **< 100ms**
- ✅ Detailed metrics for client
- ✅ Comparison data included

---

### Bước 4: Test Dashboard UI

1. **Mở browser:** http://localhost:3000/login
2. **Login** với user credentials
3. **Verify:**
   - ✅ Dashboard loads instantly (<1 second)
   - ✅ Charts render with mock data
   - ✅ Metrics show realistic numbers
   - ✅ No API errors in console

4. **Open Admin Dashboard:** http://localhost:3000/admin
   - ✅ All 5 clients show data
   - ✅ Sparklines render
   - ✅ Summary metrics accurate
   - ✅ Date range selector works

---

### Bước 5: Verify Database

```sql
-- Check data was inserted
SELECT
  client_id,
  COUNT(*) as days,
  SUM(total_leads) as total_leads,
  AVG(ad_spend) as avg_spend
FROM client_metrics_summary
WHERE period_type = 'daily'
GROUP BY client_id;
```

**Expected:**
- Each client: 30 days of data
- Realistic metrics (15-35 leads/day)
- Ad spend: $500-$1500/day

---

## ✅ Success Criteria

| Test | Expected | Status |
|------|----------|--------|
| Mock data seeded | 150 records (5 clients × 30 days) | ⬜ |
| Fast endpoint < 100ms | ✅ Sub-100ms response | ⬜ |
| Dashboard loads | < 1 second | ⬜ |
| Charts render | All charts display data | ⬜ |
| No console errors | Clean browser console | ⬜ |

---

## 🔄 Next Steps After Successful Test

**Option A: Real Data Backfill** (6+ hours)

Sau khi verify dashboard works với mock data, bạn có thể:

1. Setup API credentials (.env file)
2. Run backfill script cho real data
3. Replace mock data với production data

See: [Backfill Guide](#real-data-backfill)

---

## Real Data Backfill

### Prerequisites:

1. **Environment Variables** (.env.local):
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Google Service Account
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_PROJECT_ID=your-project-id

# Optional: Cron security
CRON_SECRET=your-random-secret-string
```

2. **Google APIs Enabled:**
   - Google Analytics Data API
   - Google Ads API
   - Search Console API
   - Google Business Profile API

---

### Run Backfill:

```bash
# Calculate dates (180 days ago to yesterday)
# Start: 180 days ago
# End: Yesterday

curl -X POST http://localhost:3000/api/admin/backfill \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-07-15",
    "endDate": "2026-01-06",
    "secret": "your-cron-secret"
  }'
```

**Expected Time:**
- 7 days: ~1-2 minutes
- 30 days: ~5-10 minutes
- 180 days: ~30-45 minutes

**Monitor Progress:**
```bash
# Watch logs
tail -f .next/trace

# Or check console in terminal where npm run dev is running
```

---

## 🐛 Troubleshooting

### Issue: "No active clients found"
**Solution:** Create clients in Supabase first (see Bước 1)

### Issue: "Table client_metrics_summary doesn't exist"
**Solution:** Run migration:
```bash
# In Supabase SQL Editor
-- Run: supabase/migrations/create_client_metrics_summary.sql
```

### Issue: Mock data endpoint returns 500
**Check:**
1. Supabase connection working?
2. Clients table has data?
3. Check server console for error details

### Issue: Dashboard shows no data
**Check:**
1. Login credentials correct?
2. Client has `is_active = true`?
3. Browser console for API errors
4. Verify data in database (SQL query above)

---

## 📊 Performance Benchmarks

**Target Performance (with database-only architecture):**

| Endpoint | Target | Current |
|----------|--------|---------|
| `/api/admin/overview-fast` | < 100ms | ⬜ Test it |
| `/api/client-dashboard` | < 100ms | ⬜ Test it |
| Dashboard page load | < 1s | ⬜ Test it |
| Admin page load | < 1s | ⬜ Test it |

**Previous (slow) performance:**
- Old `/api/dashboard`: 5-10 seconds ❌ DELETED
- Live API fetching: 25+ seconds ❌ REPLACED

**Improvement:** **100x faster!** 🚀
