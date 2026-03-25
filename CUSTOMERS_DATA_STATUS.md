# 👥 DANH SÁCH KHÁCH HÀNG & TRẠNG THÁI DỮ LIỆU
# (Full Customer List & Data Status Report)

**Ngày tạo:** 2026-03-25
**Template Status:** Ready for your database

---

## 🚀 HOW TO GET REAL DATA

### Option 1: Run SQL Query (Fastest)
Go to **Supabase SQL Editor** and run:
```bash
-- Copy contents of scripts/get-customers-data-status.sql
```

### Option 2: Run Node Script (With credentials)
```bash
# Create .env.local with Supabase keys
cp .env.example .env.local
# Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

node scripts/get-customers-data-status.js
```

---

## 📊 EXPECTED OUTPUT FORMAT

When you run the query above, you'll get a table like this:

| STT | Khách hàng | Slug | Thành phố | GA | Ads | GSC | GBP | Ngày mới nhất | Tuổi | Ads Data | GA Data | GSC Data | GBP Data |
|-----|-----------|------|-----------|----|----|-----|-----|--------------|------|---------|---------|---------|----------|
| 1 | Client A | client-a | Los Angeles | ✅ | ✅ | ✅ | ✅ | 2026-03-24 | ✅ 1 day | ✅ | ✅ | ✅ | ✅ |
| 2 | Client B | client-b | New York | ✅ | ✅ | ✅ | ❌ | 2026-03-24 | ✅ 1 day | ✅ | ✅ | ✅ | ❌ |
| 3 | Client C | client-c | Chicago | ✅ | ❌ | ✅ | ✅ | 2026-03-23 | ⚠️ 2 days | ❌ | ✅ | ✅ | ✅ |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| 21 | Client U | client-u | Seattle | ✅ | ✅ | ✅ | ✅ | 2026-03-24 | ✅ 1 day | ✅ | ✅ | ✅ | ✅ |

---

## 📋 COLUMN EXPLANATIONS

| Column | Ý nghĩa | Chi tiết |
|--------|---------|----------|
| **STT** | Số thứ tự | 1-21 |
| **Khách hàng** | Tên khách hàng | Tên công ty |
| **Slug** | URL slug | client-name format |
| **Thành phố** | Vị trí | City name |
| **GA** | Google Analytics configured? | ✅ = Yes, ❌ = No |
| **Ads** | Google Ads configured? | ✅ = Yes, ❌ = No |
| **GSC** | Search Console configured? | ✅ = Yes, ❌ = No |
| **GBP** | Google Business Profile? | ✅ = Yes, ❌ = No |
| **Ngày mới nhất** | Latest date with data | Format: YYYY-MM-DD |
| **Tuổi dữ liệu** | How old is the data? | ✅ Today, ⚠️ X days, ❌ No data |
| **Ads Data ✅** | Has ads data yesterday? | ✅ = Yes, ⚠️ = Old, ❌ = No |
| **GA Data ✅** | Has GA data yesterday? | ✅ = Yes, ⚠️ = Old, ❌ = No |
| **GSC Data ✅** | Has GSC data yesterday? | ✅ = Yes, ⚠️ = Old, ❌ = No |
| **GBP Data ✅** | Has GBP data yesterday? | ✅ = Yes, ⚠️ = Old, ❌ = No |

---

## 🎯 WHAT TO LOOK FOR

### ✅ GOOD (All green)
```
Khách hàng: Perfect Client
- GA: ✅, Ads: ✅, GSC: ✅, GBP: ✅
- Ngày mới nhất: 2026-03-24
- Tuổi: ✅ 1 day
- Ads Data: ✅, GA Data: ✅, GSC Data: ✅, GBP Data: ✅

Meaning: All 4 APIs configured, fresh data from yesterday
```

### ⚠️ WARNING (Some issues)
```
Khách hàng: Partial Client
- GA: ✅, Ads: ✅, GSC: ❌, GBP: ❌
- Ngày mới nhất: 2026-03-24
- Tuổi: ⚠️ 2 days
- Ads Data: ✅, GA Data: ✅, GSC Data: ❌, GBP Data: ❌

Meaning: Only 2 APIs, data is 2 days old, need to backfill
```

### 🔴 PROBLEM (Red flags)
```
Khách hàng: Broken Client
- GA: ❌, Ads: ❌, GSC: ❌, GBP: ❌
- Ngày mới nhất: ❌ NO DATA
- Tuổi: ❌
- All Data: ❌

Meaning: Not configured, no data at all
```

---

## 🔧 TROUBLESHOOTING BY ISSUE

### Issue: "Ngày mới nhất: ❌ NO DATA"

**Solution:**
1. Check if APIs are configured (should show ✅)
2. Run manual rollup:
   ```bash
   curl -X POST https://ultimate-report-dashboard-main.vercel.app/api/admin/run-rollup \
     -H "Authorization: Bearer $CRON_SECRET"
   ```
3. Wait for cron to run (2 AM LA time tomorrow)
4. Re-check after 24 hours

### Issue: "Tuổi: ⚠️ 3+ days"

**Solution:**
1. Data is stale - should be 1 day old max
2. Check if cron job is running:
   ```bash
   node scripts/check-cron-status.js
   ```
3. Check Vercel logs for errors
4. Manually trigger rollup (see above)

### Issue: "GA/Ads/GSC/GBP: ❌"

**Solution:**
1. API not configured for this customer
2. Go to admin panel and add:
   - GA Property ID
   - Ads Customer ID
   - GSC Site URL
   - GBP Location ID
3. Then re-run rollup

### Issue: "Ads Data ✅: ❌" (But GA Data: ✅)

**Solution:**
1. Google Ads API might have issues
2. Check credentials:
   - GOOGLE_ADS_DEVELOPER_TOKEN
   - GOOGLE_ADS_CLIENT_ID
   - GOOGLE_ADS_REFRESH_TOKEN
   - GOOGLE_ADS_MCC_ID
3. Run manual backfill for that API
4. Check Vercel logs for specific errors

---

## 📊 SUMMARY STATS YOU'LL SEE

```json
{
  "Tổng khách hàng": 21,
  "Có GA": 21,
  "Có Google Ads": 21,
  "Có GSC": 21,
  "Có GBP": 15
}
```

**Expected:**
- All 21 should have GA, Ads, GSC
- 15 should have GBP (depends on business type)
- Data freshness: 1 day old (yesterday)

---

## 🔗 LEGEND

| Symbol | Meaning | Context |
|--------|---------|---------|
| ✅ | Configured & Working | Green light, all good |
| ⚠️ | Partially Working | Yellow light, needs attention |
| ❌ | Not Configured | Red light, needs setup |

---

## 📝 QUICK CHECKLIST

After running the report, verify:

- [ ] All 21 customers listed
- [ ] Most have GA, Ads, GSC configured
- [ ] Latest data date is yesterday or today
- [ ] Data age is 1 day or less for most
- [ ] Ads, GA, GSC data showing ✅ for recent dates
- [ ] GBP data showing ✅ if configured
- [ ] No customers with ❌ NO DATA

---

## 🎯 NEXT STEPS BASED ON RESULTS

### If all ✅:
- Continue monitoring with `node scripts/check-cron-status.js` daily
- Check report weekly to ensure freshness

### If some ⚠️:
1. Identify which customers have issues
2. Check what APIs are missing
3. Add missing API configurations
4. Run manual rollup to backfill
5. Re-check after 24 hours

### If any 🔴:
1. Identify which customers have no data
2. Check if APIs are configured
3. Check Vercel logs for errors
4. Run `node scripts/check-cron-status.js` to diagnose
5. Contact support if APIs are failing

---

## 🚀 HOW TO RUN REPORTS REGULARLY

### Weekly Report
```bash
# Every Monday morning, run:
node scripts/get-customers-data-status.js > reports/customer-status-$(date +%Y-%m-%d).txt

# Or in Supabase:
-- Run: scripts/get-customers-data-status.sql
-- Export as CSV
```

### Daily Automated Check
```bash
# Add to cron (if needed):
0 8 * * * cd /path/to/project && node scripts/get-customers-data-status.js >> logs/daily-check.log
```

---

## 📞 QUICK REFERENCE

**To see all customers + data status:**
```bash
# Method 1: SQL Query
# Go to Supabase > SQL Editor
# Run: scripts/get-customers-data-status.sql

# Method 2: Node Script
node scripts/get-customers-data-status.js
```

**To check if cron is working:**
```bash
node scripts/check-cron-status.js
```

**To verify database has fresh data:**
```sql
-- In Supabase SQL Editor:
SELECT date, COUNT(*) as records, COUNT(DISTINCT client_id) as customers
FROM client_metrics_summary
WHERE date >= CURRENT_DATE - INTERVAL '1 day'
GROUP BY date
ORDER BY date DESC;
```

---

**Status:** Ready to use
**Updated:** 2026-03-25
**By:** Claude Code Diagnostic System
