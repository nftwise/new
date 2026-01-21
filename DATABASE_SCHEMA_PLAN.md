# 📊 DATABASE SCHEMA - THỐNG NHẤT ĐỊNH DẠng LƯU TRỮ

## BẢNG 1: CLIENTS (mở rộng)

| Trường | Kiểu | Bắt Buộc | Ví Dụ | Ghi Chú |
|---|---|---|---|---|
| id | UUID | ✅ | 550e8400-e29b | Primary Key |
| name | TEXT | ✅ | Dr DiGrado | Tên khách |
| slug | TEXT | ✅ | dr-digrado | URL-friendly |
| website_url | TEXT | ❌ | https://drdigrado.com | Link website |
| address | TEXT | ❌ | Newport Beach, CA | Địa chỉ |
| city | TEXT | ❌ | Newport Beach, CA | Thành phố (hiện có) |
| phone | TEXT | ❌ | (949) 408-0393 | SĐT liên hệ |
| contact_email | TEXT | ✅ | ncfc@sbcglobal.net | Email (hiện có) |
| contact_name | TEXT | ❌ | Mike Digrado | Tên người liên hệ (hiện có) |
| doctor_name | TEXT | ❌ | Dr. Mike Digrado | Tên bác sĩ |
| status | TEXT | ✅ | Working / Cancel / ? | Trạng thái |
| seo_rating | INTEGER | ❌ | 5 | Rating 1-5 (not ★) |
| ads_rating | INTEGER | ❌ | 4 | Rating 1-5 (not ★) |
| ads_budget_month | TEXT | ❌ | $3000 | VD: $3000 hoặc $2000/month |
| notes | TEXT | ❌ | Special notes | Ghi chú |
| industry | TEXT | ❌ | Chiropractic | Ngành (hiện có) |
| logo_url | TEXT | ❌ | https://... | Logo (hiện có) |
| primary_color | TEXT | ✅ | #0066CC | Màu (hiện có) |
| plan_type | TEXT | ✅ | premium | Loại gói (hiện có) |
| is_active | BOOLEAN | ✅ | true | Active (hiện có) |
| created_at | TIMESTAMP | ✅ | 2026-01-15 | (hiện có) |
| updated_at | TIMESTAMP | ✅ | 2026-01-19 | (hiện có) |

---

## BẢNG 2: SERVICE_CONFIGS (mở rộng)

| Trường | Kiểu | Bắt Buộc | Ví Dụ | Ghi Chú |
|---|---|---|---|---|
| id | UUID | ✅ | 550e8400-e29b | Primary Key |
| client_id | UUID | ✅ | (FK→clients.id) | Link khách |
| ga_property_id | TEXT | ✅ | 326814792 | GA Property ID |
| ga_view_id | TEXT | ❌ | 211669707 | GA View ID (hiện có) |
| ga_connected_email | TEXT | ❌ | analytics@client.com | Email GA auth (hiện có) |
| gads_customer_id | TEXT | ❌ | 123-456-7890 | Google Ads Customer ID |
| gads_manager_account_id | TEXT | ❌ | 789-012-3456 | Ads Manager ID (hiện có) |
| gsc_site_url | TEXT | ✅ | https://example.com | GSC Site URL |
| gsc_connected_email | TEXT | ❌ | seo@client.com | Email GSC auth (hiện có) |
| gsc_id | TEXT | ❌ | property-xxxxx | Google Search Console ID |
| gbp_location_id | TEXT | ❌ | accounts/xxx/locations/yyy | GBP Location ID (hiện có) |
| gbp_account_id | TEXT | ❌ | 123456789 | GBP Account ID (hiện có) |
| gbp_connected_email | TEXT | ❌ | gbp@client.com | Email GBP auth (hiện có) |
| gbp_id | TEXT | ❌ | locations/987654321 | GBP ID (rút gọn) |
| callrail_account_id | TEXT | ❌ | ACCxxx | CallRail Account ID (hiện có) |
| callrail_company_id | TEXT | ❌ | COMxxx | CallRail Company ID (hiện có) |
| created_at | TIMESTAMP | ✅ | 2026-01-15 | (hiện có) |
| updated_at | TIMESTAMP | ✅ | 2026-01-19 | (hiện có) |

---

## BẢNG 3: CLIENT_CREDENTIALS (NEW)

| Trường | Kiểu | Bắt Buộc | Ví Dụ | Ghi Chú |
|---|---|---|---|---|
| id | UUID | ✅ | 550e8400-e29b | Primary Key |
| client_id | UUID | ✅ | (FK→clients.id) | Link khách |
| platform | TEXT | ✅ | wordpress / cpanel / ... | Nền tảng |
| website_url | TEXT | ❌ | https://mychiropractice.com | URL login |
| username | TEXT | ✅ | admin | Username |
| password | TEXT (encrypted) | ✅ | [pgcrypto] | **MÃ HÓA** |
| login_path | TEXT | ❌ | /admin | Path login (VD: /wp-admin) |
| created_at | TIMESTAMP | ✅ | 2026-01-15 | Ngày tạo |
| updated_at | TIMESTAMP | ✅ | 2026-01-19 | Ngày cập nhật |
| last_accessed_by | TEXT | ❌ | nhân viên X | Ai xem cuối |
| last_accessed_at | TIMESTAMP | ❌ | 2026-01-19 12:30 | Lúc nào xem |

---

## BẢNG 4: CREDENTIAL_AUDIT_LOG (NEW)

| Trường | Kiểu | Mục Đích |
|---|---|---|
| id | UUID | Primary Key |
| credential_id | UUID | (FK→client_credentials.id) |
| action | TEXT | decrypt / created / updated / deleted |
| accessed_by | TEXT | Nhân viên nào |
| accessed_at | TIMESTAMP | Lúc nào |
| ip_address | TEXT | IP truy cập |
| notes | TEXT | Ghi chú |

---

## 📝 ĐỊNH DẠng CHUẨN

### **Rating (seo_rating, ads_rating):**
- INTEGER: 1, 2, 3, 4, 5
- **KHÔNG dùng:** ★★★★★ (khó query)

### **Budget (ads_budget_month):**
- TEXT: "$3000" hoặc "$2000/month"
- **KHÔNG dùng:** số cộng TEXT

### **Status:**
- Enum: Working / Cancel / ?
- **KHÔNG dùng:** Active/Inactive (dùng cho is_active)

### **ID Format:**
- **GA ID:** 326814792 (số)
- **Ads ID:** 123-456-7890 (TEXT với dấu gạch)
- **GSC ID:** property-xxxxx (TEXT)
- **GBP ID:** accounts/123/locations/456 (TEXT đầy đủ)
- **GBP ID (rút gọn):** locations/456 (TEXT)

### **Email:**
- Lowercase
- Valid format: @domain.com

### **URL:**
- Với https://
- VD: https://drdigrado.com (không trailing slash)

### **Password (trong client_credentials):**
- Mã hóa pgcrypto
- **KHÔNG lưu plain text**

---

## ✅ BƯỚC TIẾP THEO

1. ALTER TABLE clients + 11 trường
2. ALTER TABLE service_configs + 3 trường
3. CREATE TABLE client_credentials (NEW)
4. CREATE TABLE credential_audit_log (NEW)
5. CREATE FUNCTION decrypt_password()
6. CREATE FUNCTION log_credential_access()

👉 **Ready để làm?**
