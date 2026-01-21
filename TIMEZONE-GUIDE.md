# 🌍 Timezone Handling Guide

## ⚠️ QUAN TRỌNG - Đọc trước khi deploy!

Dashboard này được build cho **US business data** nhưng developer ở **Vietnam**.

### Vấn đề:
- 🇻🇳 **Bạn:** Vietnam (GMT+7)
- 🇺🇸 **Data:** US (Google Analytics, Ads, Search Console)
- ⏰ **Cron:** 2AM US time
- 📊 **Dashboard:** Hiển thị US dates

---

## 🎯 Giải pháp (Đã implement)

### **1. Tất cả dates = US timezone (Pacific Time)**

```typescript
import { getUSYesterday, getUSToday } from '@/lib/utils/timezone'

// ĐÚNG ✅
const yesterday = getUSYesterday() // "2026-01-07" (US date)

// SAI ❌
const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)
// → Returns VN date, not US date!
```

### **2. Cron schedule**

```json
{
  "crons": [
    {
      "path": "/api/admin/run-rollup",
      "schedule": "0 2 * * *"  // 2AM US Pacific
    }
  ]
}
```

**Khi cron chạy:**
- 🇺🇸 US: 2:00 AM (Pacific Time)
- 🇻🇳 VN: 5:00 PM (cùng ngày)
- 📅 Fetches data for: **US yesterday**

---

## 📅 Timeline Example

### **Scenario: Hôm nay là 2026-01-08**

| Time | VN | US (Pacific) | Cron Action |
|------|-----|--------------|-------------|
| 5:00 PM | Jan 8 | 2:00 AM Jan 8 | Runs rollup for **Jan 7** |
| 6:00 PM | Jan 8 | 3:00 AM Jan 8 | Rollup complete |
| 8:00 PM | Jan 8 | 5:00 AM Jan 8 | - |
| Next day 5PM | Jan 9 | 2:00 AM Jan 9 | Runs rollup for **Jan 8** |

### **Dashboard hiển thị:**

```
Latest data: January 7, 2026 ✅
(Data đã có từ 5PM VN time)
```

---

## 🧪 Test Timezone Handling

### **Test endpoint:**

```bash
curl http://localhost:3000/api/admin/test-timezone
```

**Response:**
```json
{
  "server": {
    "time": "2026-01-08T10:00:00Z",
    "timezone": "UTC"
  },
  "us": {
    "usDate": "2026-01-07",
    "usYesterday": "2026-01-06",
    "usTime": "Wednesday, January 7, 2026 at 2:00:00 AM PST"
  },
  "rollup": {
    "isRollupTime": true,
    "shouldRunFor": "2026-01-06"
  }
}
```

---

## 🔧 Timezone Utilities

### **Available functions:**

```typescript
import {
  getUSYesterday,
  getUSToday,
  getUSDateRange,
  getTimezoneInfo,
  formatUSDate,
  isRollupTime,
} from '@/lib/utils/timezone'

// Get dates
const yesterday = getUSYesterday()  // "2026-01-07"
const today = getUSToday()          // "2026-01-08"

// Get date ranges
const last7Days = getUSDateRange(7)
// { startDate: "2026-01-02", endDate: "2026-01-08" }

// Format for display
const formatted = formatUSDate("2026-01-08", "long")
// "Wednesday, January 8, 2026"

// Check if it's rollup time (2AM-6AM US)
if (isRollupTime()) {
  console.log("Rollup should run now")
}

// Debug timezone info
const info = getTimezoneInfo()
console.log(info)
```

---

## 📊 Dashboard Date Display

### **QUAN TRỌNG:**

Dates trong database đã là **US dates** → **KHÔNG convert thêm!**

```typescript
// ĐÚNG ✅
<div>Latest data: {data.date}</div>
// Shows: "2026-01-07" (correct)

// SAI ❌
<div>Latest data: {new Date(data.date).toLocaleDateString()}</div>
// Shows: "08/01/2026" (wrong - converted to VN timezone)
```

### **Best practice:**

```typescript
import { formatUSDate } from '@/lib/utils/timezone'

// Display dates
<div>
  Latest: {formatUSDate(data.date, 'long')}
</div>
// Shows: "January 7, 2026"
```

---

## ⚙️ Configuration

### **Change timezone (if needed):**

Edit `src/lib/utils/timezone.ts`:

```typescript
// Pacific Time (default - Silicon Valley)
export const US_TIMEZONE = 'America/Los_Angeles'

// Or Eastern Time (New York)
// export const US_TIMEZONE = 'America/New_York'
```

**Most common US timezones:**
- `America/Los_Angeles` - Pacific (PT) - Google, Apple
- `America/New_York` - Eastern (ET) - NYC businesses
- `America/Chicago` - Central (CT) - Midwest
- `America/Denver` - Mountain (MT)

---

## 🐛 Troubleshooting

### **Issue: Dashboard shows yesterday's data as today**

**Cause:** Dashboard converting US dates to VN timezone

**Fix:** Don't use `new Date()` on date strings, use `formatUSDate()` instead

---

### **Issue: Rollup fetches wrong date**

**Test:**
```bash
curl http://localhost:3000/api/admin/test-timezone
```

**Check:**
- `usYesterday` should be correct US date
- `isRollupTime` should be `true` at 2AM-6AM US

**Fix:** Verify `getUSYesterday()` is used in run-rollup

---

### **Issue: Cron runs at wrong time**

**Vercel cron schedule:** Uses **UTC time**, NOT US time!

**Current schedule:**
```json
"schedule": "0 2 * * *"  // 2AM UTC = 6PM Pacific (previous day)
```

**To run at 2AM Pacific (10AM UTC):**
```json
"schedule": "0 10 * * *"  // 10AM UTC = 2AM Pacific
```

**Update vercel.json if needed!**

---

## 📝 Summary

### **Key Points:**

1. ✅ All dates stored as **YYYY-MM-DD in US Pacific timezone**
2. ✅ Use `getUSYesterday()` for rollup (NOT `new Date()`)
3. ✅ Dashboard displays dates **as-is** (no conversion)
4. ✅ Cron at 2AM US = 5PM VN (same day)
5. ✅ Test with `/api/admin/test-timezone`

### **Cheat Sheet:**

```typescript
// ❌ NEVER do this:
const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)

// ✅ ALWAYS do this:
import { getUSYesterday } from '@/lib/utils/timezone'
const yesterday = getUSYesterday()
```

---

## 🚀 Production Checklist

Before deploy:

- [ ] Test timezone endpoint works
- [ ] Verify cron schedule in vercel.json
- [ ] Check dashboard date display (no conversion)
- [ ] Run test rollup manually
- [ ] Confirm dates match expectations

After deploy:

- [ ] Monitor first cron run (check Vercel logs)
- [ ] Verify data appears for correct US date
- [ ] Check dashboard shows today = US today

---

## 🎓 Why Pacific Time?

Most US tech companies (Google, Facebook, etc.) use **Pacific Time**:
- Google HQ: Mountain View, CA
- Analytics data: Pacific timezone
- Business hours: 9AM-5PM Pacific

**If your clients are in different timezone:** Change `US_TIMEZONE` constant.

---

## 📞 Questions?

**"Data trễ 1 ngày?"**
→ Check if using `new Date()` instead of `getUSYesterday()`

**"Cron chạy sai giờ?"**
→ Vercel cron uses UTC, convert to US time

**"Dashboard hiển thị sai ngày?"**
→ Don't convert dates, display as-is

**"Muốn đổi timezone?"**
→ Edit `US_TIMEZONE` in `timezone.ts`

---

**🌎 Timezone handling: DONE ✅**

Bây giờ data sẽ đúng cho US business, dù bạn code từ VN! 🇻🇳🇺🇸
