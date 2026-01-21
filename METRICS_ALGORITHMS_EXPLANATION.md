# 📚 Giải Thích Chi Tiết: Metrics và Thuật Toán Campaign Health Analysis

---

## PHẦN 1: CÁC CHỈ SỐ (METRICS) CHỦ YẾU

### **NHÓM 1: CÁC CHỈ SỐ CƠ BẢN (Foundation Metrics)**

#### 1. **Ad Spend (Chi Phí Quảng Cáo)**
- **Định nghĩa**: Tổng số tiền đã chi trả cho quảng cáo trong khoảng thời gian (ngày, tuần, tháng)
- **Công thức**: `Ad Spend = Tổng chi phí từng campaign`
- **Ý nghĩa kinh tế**: 
  - Đại diện cho **khoản đầu tư marketing** bạn đang thực hiện
  - Cao → Bạn đang đẩy mạnh chiến dịch
  - Thấp → Chiến dịch yên tĩnh hoặc bị giới hạn budget
- **Đơn vị**: USD ($)
- **Kỳ vọng**: Phụ thuộc vào mục tiêu, không có target cố định
- **Sai ở đâu nếu**:
  - Cao nhưng conversions = 0 → Đang "ăn cơm chưa có cơm" (tốn tiền không có kết quả)

---

#### 2. **Impressions (Lượt Hiển Thị)**
- **Định nghĩa**: Bao nhiêu lần quảng cáo được hiển thị trên màn hình người dùng
- **Công thức**: `Impressions = Tổng lần Google hiển thị ad`
- **Ý nghĩa kinh tế**:
  - Là **tiền đề** để có conversions
  - Cao → Quảng cáo có visibility tốt, nhiều người thấy
  - Thấp → Quảng cáo "ẩn danh", ít người biết đến
- **Đơn vị**: Lần (count)
- **Kỳ vọng**: Tối thiểu 1000+ impressions/tuần (để đủ dữ liệu phân tích)
- **Sai ở đâu nếu**:
  - Thấp + spend cao → Bid quá thấp hoặc Quality Score thấp (hình phạt từ Google)

---

#### 3. **Clicks (Lượt Nhấp)**
- **Định nghĩa**: Bao nhiêu người nhấp vào quảng cáo để truy cập website
- **Công thức**: `Clicks = Tổng lần người dùng click ad`
- **Ý nghĩa kinh tế**:
  - Là **hành động chủ động** của người dùng → quan tâm đến offer
  - Cao → Ad appealing, targeting đúng
  - Thấp → Ad không hấp dẫn hoặc targeting sai
- **Đơn vị**: Lần (count)
- **Kỳ vọng**: Ít nhất 50+ clicks/tuần (để đủ dữ liệu)
- **Sai ở đâu nếu**:
  - Click cao nhưng không có conversions → Landing page có vấn đề (chất lượng kém, UX xấu)

---

#### 4. **Conversions (Chuyển Đổi)**
- **Định nghĩa**: Bao nhiêu người thực hiện hành động mục tiêu (mua hàng, gọi điện, submit form, booking)
- **Công thức**: `Conversions = Tổng lần conversion tracking ghi nhận`
- **Ý nghĩa kinh tế**:
  - **Thước đo thành công** → Chứng tỏ campaign có ROI
  - Cao → Chiến dịch đem lại kết quả thực tế
  - 0 → Tracking sai HOẶC landing page không tốt
- **Đơn vị**: Lần (count)
- **Kỳ vọng**: > 0 (bất cứ con số nào cũng tốt hơn 0)
- **Sai ở đâu nếu**:
  - = 0 + clicks > 0 → **Setup conversion tracking** (GA4, pixel, event tracking)

---

#### 5. **Conversion Value (Giá Trị Chuyển Đổi)**
- **Định nghĩa**: Tổng doanh thu/giá trị từ những conversions
- **Công thức**: `Conversion Value = Tổng $ từ mỗi conversion`
- **Ý nghĩa kinh tế**:
  - Đo **doanh số thực tế** từ quảng cáo
  - Có thể khác nhau (VD: mua hàng $100 vs booking tư vấn $50)
- **Đơn vị**: USD ($)
- **Kỳ vọng**: Càng cao càng tốt
- **Sai ở đâu nếu**:
  - = 0 + conversions > 0 → Chưa setup **dynamic conversion value tracking**

---

### **NHÓM 2: CÁC CHỈ SỐ HIỆU SUẤT (Performance Metrics)**

#### 6. **Click-Through Rate (CTR)**
- **Định nghĩa**: % người dùng thấy quảng cáo → click vào
- **Công thức**: `CTR = (Clicks / Impressions) × 100`
- **Ý nghĩa kinh tế**:
  - Đo **tính hấp dẫn** của ad creative (headline, description, image)
  - CTR 3% = 3 người trên 100 người thấy quảng cáo click vào
- **Đơn vị**: % (phần trăm)
- **Kỳ vọng**: 2-5% (tùy industry)
  - Chiropractor: thường 2-4%
  - E-commerce: 1-3%
  - B2B: 1-2%
- **Sai ở đâu nếu**:
  - CTR < 1% → Ad copy yếu (headline/description không convincing)
  - CTR > 5% → Ad quá hấp dẫn nhưng có thể misleading (vào landing page disappointed)

---

#### 7. **Cost Per Click (CPC)**
- **Định nghĩa**: Trung bình bạn trả bao nhiêu tiền cho 1 lượt click
- **Công thức**: `CPC = Ad Spend / Clicks`
- **Ý nghĩa kinh tế**:
  - Đo **hiệu quả bid strategy** và **chất lượng ads**
  - CPC cao → Google tính tiền nhiều (hoặc bạn bidding cao, hoặc QS thấp)
  - CPC thấp → Quality Score tốt hoặc bid strategy tối ưu
- **Đơn vị**: USD ($)
- **Kỳ vọng**: Càng thấp càng tốt (phụ thuộc industry)
- **Sai ở đâu nếu**:
  - CPC tăng đột ngột → Quality Score giảm (cần fix ads hoặc landing page)
  - CPC quá cao → Đang bidding "cắt cổ", cần giảm bid hoặc tối ưu QS

---

#### 8. **Cost Per Acquisition (CPA)**
- **Định nghĩa**: Trung bình bạn trả bao nhiêu tiền để có 1 khách hàng (1 conversion)
- **Công thức**: `CPA = Ad Spend / Conversions`
- **Ý nghĩa kinh tế**:
  - **Chỉ số quan trọng nhất** trong marketing
  - Quyết định campaign có lãi hay lỗ
- **Đơn vị**: USD ($)
- **Kỳ vọng**: Phải ≤ (Profit per customer)
  - VD: Nếu mỗi khách hàng mang lại $150 lợi nhuận → CPA phải ≤ $100 để có lợi
- **Sai ở đâu nếu**:
  - CPA > Target → Nguyên nhân:
    1. Landing page conversion rate thấp
    2. Bid quá cao
    3. Targeting sai (lấy traffic không qualified)
    4. Offer không phù hợp

---

#### 9. **Return on Ad Spend (ROAS)**
- **Định nghĩa**: Cứ chi $1 → bạn lấy được bao nhiêu $ doanh thu
- **Công thức**: `ROAS = Conversion Value / Ad Spend`
- **Ý nghĩa kinh tế**:
  - **Chỉ số ROI của quảng cáo**
  - ROAS 3:1 = $1 spend → $3 doanh thu (lãi $2)
- **Đơn vị**: Tỷ lệ (ratio) - thể hiện như "3:1"
- **Kỳ vọng**:
  - < 1:1 → Lỗ tiền, dừng campaign ngay
  - 1:1 → Hòa vốn, không lợi nhuận
  - 2:1 → Tạm ổn
  - 3:1+ → Tốt
  - 5:1+ → Xuất sắc, scale up
- **Sai ở đâu nếu**:
  - ROAS < 1:1 → Campaign không khả thi, cần tối ưu hoặc dừng

---

#### 10. **Conversion Rate (Conv Rate)**
- **Định nghĩa**: % lần người dùng click vào ads → thực hiện conversion
- **Công thức**: `Conv Rate = (Conversions / Clicks) × 100`
- **Ý nghĩa kinh tế**:
  - Đo **chất lượng landing page** và **call-to-action**
  - Conv Rate 2% = 2 người trên 100 người click sẽ convert
- **Đơn vị**: % (phần trăm)
- **Kỳ vọng**: 1-5% (tùy industry)
  - Service (chiropractor): 2-5%
  - E-commerce: 1-3%
  - B2B: 1-2%
- **Sai ở đâu nếu**:
  - Conv Rate < 1% → Landing page có vấn đề (UX xấu, form phức tạp, slow loading)

---

### **NHÓM 3: CÁC CHỈ SỐ CHẤT LƯỢNG (Quality Metrics)**

#### 11. **Quality Score (QS)**
- **Định nghĩa**: Điểm Google đánh giá chất lượng của keywords + ads + landing page
- **Thành phần** (mỗi thành phần 33%):
  1. **Expected CTR**: Lịch sử tỷ lệ click dự kiến (kỳ vọng từ dữ liệu lịch sử)
  2. **Ad Relevance**: Ad copy có liên quan đến keyword không
  3. **Landing Page Experience**: Landing page có tốt không (speed, relevance, UX)
- **Công thức**: `QS = (CTR Score × 0.33) + (Relevance Score × 0.33) + (LP Score × 0.33)`
- **Phạm vi**: 1-10 (1 = tệ nhất, 10 = tốt nhất)
- **Ý nghĩa kinh tế**:
  - QS cao → Google "tin tưởng" bạn → CPC thấp, impressions cao
  - QS thấp → Google "không tin" → CPC cao, impressions thấp
- **Kỳ vọng**: ≥ 7/10
- **Sai ở đâu nếu**:
  - QS < 5 → Cần sửa ngay (tác động lớn đến CPC)
  - Cách sửa:
    - Viết lại ad copy để match keyword
    - Cải thiện landing page (speed, relevance)
    - Loại bỏ keywords không liên quan

---

#### 12. **Impression Share (IS)**
- **Định nghĩa**: % lần quảng cáo được hiển thị khi đủ điều kiện
- **Công thức**: `IS = (Actual Impressions / Eligible Impressions) × 100`
- **Ý nghĩa kinh tế**:
  - IS 80% = Bạn hiển thị ads 80% lần mà có thể (mất 20% cơ hội)
- **Đơn vị**: % (phần trăm)
- **Kỳ vọng**: > 90% (càng cao càng tốt)
- **Sai ở đâu nếu**:
  - IS < 50% → Đang mất rất nhiều cơ hội (tìm nguyên nhân)
  - Nguyên nhân phổ biến:
    1. Budget cạn (spending hết tiền mỗi ngày)
    2. Bid quá thấp (thua competitors)
    3. Quality Score thấp (Google giới hạn)

---

#### 13. **Search Lost Impression Share - Budget (SL-IS Budget)**
- **Định nghĩa**: % impression bị mất vì **budget hết** trước cuối ngày
- **Công thức**: `SL-IS Budget = Lost Impressions due to Budget / Eligible Impressions × 100`
- **Ý nghĩa kinh tế**:
  - SL-IS Budget 20% = Mất 20% cơ hội vì budget cạn
  - Chứng tỏ campaign "đói tiền"
- **Đơn vị**: % (phần trăm)
- **Kỳ vọng**: < 5%
- **Sai ở đâu nếu**:
  - > 10% → Budget quá thấp, cần tăng daily budget

---

#### 14. **Search Lost Impression Share - Rank (SL-IS Rank)**
- **Định nghĩa**: % impression bị mất vì **bid không đủ cao** (thua competitors)
- **Công thức**: `SL-IS Rank = Lost Impressions due to Rank / Eligible Impressions × 100`
- **Ý nghĩa kinh tế**:
  - SL-IS Rank 30% = Thua competitors 30% lần (mất 30% cơ hội)
- **Đơn vị**: % (phần trăm)
- **Kỳ vọng**: < 10%
- **Sai ở đâu nếu**:
  - > 20% → Bid quá thấp so với competitors, cần tăng bid

---

### **NHÓM 4: CÁC CHỈ SỐ TỔNG HỢP (Summary Metrics)**

#### 15. **Health Score (Điểm Sức Khỏe Tài Khoản)**
- **Định nghĩa**: Điểm tổng hợp (0-100) đánh giá mức độ khỏe mạnh của toàn bộ tài khoản
- **Thành phần** (4 yếu tố):
  1. **Quality Score Rating** (25%): Điểm chất lượng trung bình
  2. **Performance Rating** (25%): Hiệu suất (CTR, CPA trends)
  3. **Budget Efficiency Rating** (25%): Hiệu quả chi tiêu (ROAS)
  4. **Conversion Rating** (25%): Tỷ lệ chuyển đổi
- **Công thức**: `Health Score = (QS × 0.25) + (Performance × 0.25) + (Efficiency × 0.25) + (Conversion × 0.25)`
- **Phạm vi**: 0-100
- **Ý nghĩa kinh tế**:
  - 80-100 ✅ Tuyệt vời → Account sành điều
  - 60-79 ⚠️ Tốt → Có cơ hội cải thiện
  - 40-59 ❌ Trung bình → Cần tối ưu nhiều
  - < 40 🔴 Yếu → Cần restructure
- **Kỳ vọng**: > 75

---

---

## PHẦN 2: THUẬT TOÁN PHÁT HIỆN VẤN ĐỀ (Diagnostic Algorithm)

### **LOGIC FLOW: Cách Hệ Thống Tìm Ra Vấn Đề**

Hệ thống MetricsDiagnostics sử dụng **7 bước kiểm tra tuần tự** để tìm ra chính xác vấn đề:

---

#### **BƯỚC 1: Kiểm Tra Conversion Tracking Setup**
```
IF Conversions = 0 AND Spend > 0:
    ├─ Severity: CRITICAL
    ├─ Problem: "Conversion tracking không được setup đúng"
    └─ Fixes:
        ├─ Verify GA4 implementation
        ├─ Check conversion pixel
        └─ Test conversion tracking in test mode
```
- **Lý do**: Nếu không có conversions, không thể đánh giá được campaign hiệu quả hay không
- **Nguyên nhân gốc**: Google không được báo cáo conversions từ website

---

#### **BƯỚC 2: Kiểm Tra Chất Lượng Landing Page**
```
IF Conversions > 0 AND Conv Rate < 1%:
    ├─ Severity: HIGH
    ├─ Problem: "Landing page conversion rate rất thấp"
    └─ Fixes:
        ├─ A/B test landing page layout
        ├─ Improve page load speed
        ├─ Reduce form fields
        ├─ Test mobile experience
        └─ Improve CTA clarity
```
- **Lý do**: Conversion rate < 1% = 99% người click nhưng không convert → Landing page có vấn đề
- **Nguyên nhân gốc**: UX xấu, form phức tạp, CTA không rõ, hoặc offer không phù hợp

---

#### **BƯỚC 3: Kiểm Tra Hiệu Quả Chi Tiêu (CPA vs Target)**
```
IF CPA > (Target CPA × 1.2):
    ├─ Severity: HIGH
    ├─ Problem: "CPA cao hơn target 20%"
    └─ Fixes:
        ├─ Check CTR - if low improve ad copy
        └─ Check conv rate - if low optimize landing
```
- **Lý do**: CPA cao = bạn đang trả quá nhiều tiền cho mỗi khách hàng → campaign không lãi
- **Nguyên nhân gốc**: Hoặc ad không hấp dẫn (CTR thấp), hoặc landing page weak

---

#### **BƯỚC 4: Kiểm Tra Tính Hấp Dẫn Quảng Cáo (CTR)**
```
IF CTR < 1%:
    ├─ Severity: HIGH
    ├─ Problem: "Click-through rate thấp"
    └─ Fixes:
        ├─ Rewrite ad copy (headlines, descriptions)
        ├─ Add ad extensions (sitelinks, callouts, etc)
        ├─ Review keyword relevance
        └─ Test new ad variations
```
- **Lý do**: CTR < 1% = Ad copy không convincing, người dùng không muốn click
- **Nguyên nhân gốc**: Headline/description weak, targeting sai, hoặc bị outbid bởi competitors

---

#### **BƯỚC 5: Kiểm Tra Reach (Impressions)**
```
IF Impressions < 1000 AND Spend > 0:
    ├─ Severity: MEDIUM
    ├─ Problem: "Impressions thấp - reach problem"
    └─ Fixes:
        ├─ Check Quality Score (if < 5 improve ads)
        ├─ Check Impression Share (if < 50% increase budget/bid)
        └─ Check bid strategy
```
- **Lý do**: Low impressions = ít người thấy quảng cáo → mất cơ hội
- **Nguyên nhân gốc**: Quality Score thấp, budget cạn, hoặc bid quá thấp

---

#### **BƯỚC 6: Kiểm Tra Chất Lượng (Quality Score)**
```
IF Quality Score < 5:
    ├─ Severity: HIGH
    ├─ Problem: "Quality Score thấp"
    └─ Fixes:
        ├─ Improve ad copy relevance to keywords
        ├─ Optimize landing page experience
        ├─ Ensure landing page matches ad intent
        └─ Remove low-quality keywords
```
- **Lý do**: QS thấp = Google hình phạt, dẫn đến CPC cao và impressions thấp
- **Nguyên nhân gốc**: Ad copy không match keyword, hoặc landing page yếu

---

#### **BƯỚC 7: Kiểm Tra Lợi Nhuận (ROAS)**
```
IF ROAS < 1 AND Conversions > 0:
    ├─ Severity: CRITICAL
    ├─ Problem: "ROAS < 1:1 → Losing money!"
    └─ Fixes:
        ├─ Reduce bid significantly
        ├─ Pause underperforming keywords
        ├─ Review product margin
        └─ Refine audience targeting

ELSE IF ROAS < 2 AND Conversions > 0:
    ├─ Severity: HIGH
    ├─ Problem: "ROAS 2:1 → Below target"
    └─ Fixes:
        ├─ Review bid strategy
        ├─ Optimize conversion rate
        └─ Test cheaper traffic sources
```
- **Lý do**: ROAS < 1:1 = bạn lỗ tiền, cần dừng hoặc tối ưu ngay
- **Nguyên nhân gốc**: Bid quá cao, targeting sai, hoặc product margin thấp

---

### **THUẬT TOÁN: Xác Định Độ SEVERITY (Mức Độ Nghiêm Trọng)**

```
IF Critical Issues > 0:
    Status = 🚨 CRITICAL
    Color = Red (var(--coral))
    Message = "CRITICAL: X issue(s) requiring immediate attention"

ELSE IF High Priority Issues > 0:
    Status = ⚠️ WARNING
    Color = Orange (var(--accent))
    Message = "WARNING: X optimization opportunity(ies)"

ELSE:
    Status = ✅ HEALTHY
    Color = Green (var(--sage))
    Message = "HEALTHY: Campaign is performing well"
```

---

---

## PHẦN 3: DECISION TREE - CÁCH ĐỌC VÀ HIỂU VẤN ĐỀ

### **Flowchart: "Tôi Đang Sai Ở Đâu?"**

```
┌─────────────────────────────────────────────┐
│        START: Campaign Analysis             │
└────────────────┬────────────────────────────┘
                 │
         ┌───────▼────────┐
         │ Conversions=0? │
         └───┬────────┬───┘
             │        │
         YES│        │NO
            ▼        ▼
       ┌────────┐  ┌──────────────────┐
       │ ERROR  │  │ Conv Rate < 1%?  │
       │Setup   │  └───┬──────────┬───┘
       │Tracking│      │          │
       └────────┘   YES│         │NO
                       ▼         ▼
                    ┌────────┐ ┌────────────┐
                    │ FIX    │ │ CPA > Tgt? │
                    │Landing │ └───┬────┬──┘
                    │Page    │     │    │
                    └────────┘  YES│   │NO
                                   ▼   ▼
                                ┌───────────┐
                                │ FIX CTR   │
                                │or Landing │
                                └─────┬─────┘
                                      │
                        ┌─────────────▼──────────────┐
                        │ Impressions Too Low?       │
                        └─────┬──────────────────┬───┘
                             │                  │
                         YES │                 │NO
                             ▼                 ▼
                        ┌──────────┐    ┌────────────┐
                        │ FIX QS   │    │ ROAS < 3:1?│
                        │or Budget │    └───┬────┬───┘
                        └──────────┘        │    │
                                        YES│   │NO
                                           ▼   ▼
                                        ┌──────────┐
                                        │ OPTIMIZE │
                                        │Bid/Margin│
                                        └──────┬───┘
                                               │
                                              ▼
                                        ┌──────────────┐
                                        │  ✅ HEALTHY  │
                                        └──────────────┘
```

---

---

## PHẦN 4: MÔ TẢ CHI TIẾT 8 METRICS CHÍNH

### **Danh sách 8 Metrics cần theo dõi hàng tháng**

| # | Metric | Công Thức | Target | Alert If | Hành Động |
|---|--------|-----------|--------|----------|-----------|
| 1 | **ROAS** | Conv Value / Spend | > 3:1 | < 2:1 | Giảm bid hoặc dừng campaign |
| 2 | **CPA** | Spend / Conv | = Target | +20% từ target | Review landing page |
| 3 | **CTR** | Clicks / Impr × 100 | 2-5% | < 1% | Viết lại ad copy |
| 4 | **QS** | Scored by Google | 7-10 | < 5 | Cải thiện ads + landing page |
| 5 | **Conv Rate** | Conv / Clicks × 100 | > 2% | < 1% | A/B test landing page |
| 6 | **Impression Share** | Actual / Eligible × 100 | > 80% | < 50% | Tăng budget |
| 7 | **Conversions** | Count | > 0 | = 0 | Check tracking setup |
| 8 | **Avg CPC** | Spend / Clicks | Minimize | Rising | Improve Quality Score |

---

---

## PHẦN 5: CÁC CÔNG THỨC (FORMULAS)

### **Group A: Metrics Cơ Bản (Không tính toán)**
```
Ad Spend = Tổng $ chi trả (lấy từ Google Ads API)
Impressions = Tổng lần hiển thị (lấy từ Google Ads API)
Clicks = Tổng lần click (lấy từ Google Ads API)
Conversions = Tổng conversions (lấy từ GA4 hoặc conversion pixel)
Conversion Value = Tổng $ từ conversions (lấy từ GA4)
```

### **Group B: Metrics Tính Toán (Ratios)**
```
CTR (%) = (Clicks ÷ Impressions) × 100

CPC ($) = Ad Spend ÷ Clicks

CPA ($) = Ad Spend ÷ Conversions

ROAS (ratio) = Conversion Value ÷ Ad Spend
  Cách đọc: ROAS 3.5 = 3.5:1 (cứ $1 spend → $3.5 revenue)

Conv Rate (%) = (Conversions ÷ Clicks) × 100

Impression Share (%) = (Actual Impressions ÷ Eligible Impressions) × 100

Search Lost IS Budget (%) = 
  (Lost Impressions due to Budget ÷ Eligible Impressions) × 100

Search Lost IS Rank (%) = 
  (Lost Impressions due to Rank ÷ Eligible Impressions) × 100
```

### **Group C: Quality Score (Composite)**
```
Quality Score (1-10) = Google's assessment based on:
  - 33% Expected CTR (historical click patterns)
  - 33% Ad Relevance (keyword-ad match)
  - 33% Landing Page Experience (speed, relevance, UX)
```

### **Group D: Health Score (Weighted Average)**
```
Health Score (0-100) = 
  (Quality Score × 0.25) +
  (Performance Rating × 0.25) +
  (Budget Efficiency × 0.25) +
  (Conversion Rating × 0.25)

Nơi:
  Quality Score Rating = Điểm trung bình QS
  Performance Rating = Đánh giá từ CTR, CPA trends
  Budget Efficiency = Đánh giá từ ROAS, CPA
  Conversion Rating = Đánh giá từ Conv Rate, Conv Count
```

---

---

## PHẦN 6: CÁCH SỬA TỪNG VẤN ĐỀ

### **Issue #1: Conversions = 0**
```
Triệu chứng: 
  - Spend > 0, Clicks > 0, nhưng Conversions = 0

Nguyên nhân:
  1. GA4 không được cài đặt đúng
  2. Conversion event không được setup
  3. Conversion pixel không được cài
  4. UTM parameters sai

Cách sửa:
  1. Vào GA4 → Verify conversion events
  2. Kiểm tra Google Ads pixel trên website
  3. Chạy test conversion (bấn nút test)
  4. Verify UTM parameters trong URL
  5. Đợi 24-48 giờ để GA4 thu thập dữ liệu
```

---

### **Issue #2: Conversion Rate < 1%**
```
Triệu chứng:
  - Conv Rate 0.5% = 200 clicks nhưng chỉ 1 conversion

Nguyên nhân:
  1. Landing page UX xấu (layout confusing)
  2. Form quá phức tạp (quá nhiều fields)
  3. Page load speed chậm
  4. Offer không match keyword
  5. CTA (button) không rõ ràng

Cách sửa (theo thứ tự):
  1. A/B Test Landing Page:
     - Test A: Current page
     - Test B: Simpler layout, fewer form fields
  2. Optimize for Mobile:
     - 60-70% traffic từ mobile
     - Mobile page phải nhanh và dễ dùng
  3. Improve Page Speed:
     - Nén images, minimize code
     - Target: < 3 seconds load time
  4. Match Offer to Keyword:
     - Keyword "free consultation" → Landing page phải nói "free"
     - Keyword "price" → Landing page phải có pricing info
  5. Improve CTA:
     - Button text: "Book Now", "Call Today", "Get Free Quote"
     - Button màu sắc: contrast cao (dễ thấy)
```

---

### **Issue #3: CPA Cao Hơn Target**
```
Triệu chứng:
  - Target CPA $100 nhưng actual CPA $150

Nguyên nhân:
  1. CTR thấp → phải chi nhiều tiền để có conversions
  2. Conv Rate thấp → phải có nhiều clicks nhưng ít convert
  3. Bid quá cao → trả giá cao cho mỗi click

Cách sửa:
  - Nếu CTR thấp (< 1%):
    1. Rewrite ad copy
    2. Test new headlines
    3. Add ad extensions
  - Nếu Conv Rate thấp (< 1%):
    1. Optimize landing page (xem Issue #2)
  - Nếu cả 2 bình thường:
    1. Giảm bid 10-20%
    2. Refine audience targeting
```

---

### **Issue #4: CTR Thấp (< 1%)**
```
Triệu chứng:
  - 1000 impressions chỉ có 5 clicks

Nguyên nhân:
  1. Ad copy weak (headline không attract)
  2. Keyword targeting sai
  3. Bị outbid bởi competitors (vị trí thấp)
  4. Ad extensions thiếu

Cách sửa:
  1. Improve Ad Copy:
     - Headline: Benefit-focused ("Save $50 on your first visit")
     - Description: Specific details, proof, urgency
  2. Add Ad Extensions:
     - Sitelinks (links to key pages)
     - Callout extensions (key selling points)
     - Structured snippets (features)
  3. Review Keywords:
     - Remove irrelevant keywords
     - Add more specific long-tail keywords
  4. Increase Bid:
     - Higher position → better CTR
     - Test increasing CPC bid 20-30%
```

---

### **Issue #5: Quality Score Thấp (< 5)**
```
Triệu chứng:
  - QS 3-4 → CPC cao, impressions thấp

Nguyên nhân:
  1. Ad copy không match keyword
  2. Landing page không liên quan
  3. Landing page chậm hoặc mobile-incompatible
  4. Historical CTR thấp

Cách sửa (3 thành phần):
  1. Improve Expected CTR:
     - Rewrite ad copy để convincing hơn
     - Adjust bid để lấy vị trí cao hơn
     - Loại bỏ keywords với historical low CTR
  
  2. Improve Ad Relevance:
     - Keyword = "orthopedic surgeon"
     - Ad Headline phải mention "orthopedic"
     - Ad Description phải mention specialty
  
  3. Improve Landing Page:
     - Page phải load nhanh (< 3 sec)
     - Page title phải match keyword
     - Page content phải relevant
     - Mobile version phải tốt
     - No intrusive ads/popups
```

---

### **Issue #6: Impression Share Thấp (< 50%)**
```
Triệu chứng:
  - IS 40% = Mất 60% cơ hội

Nguyên nhân:
  1. Budget không đủ
  2. Bid quá thấp
  3. Quality Score thấp

Cách sửa (theo thứ tự):
  1. Check SL-IS Budget:
     - Nếu > 10% → Budget cạn
     - Fix: Tăng daily budget 20-50%
  
  2. Check SL-IS Rank:
     - Nếu > 20% → Bid quá thấp
     - Fix: Tăng bid 15-25%
  
  3. Check Quality Score:
     - Nếu < 5 → Google giới hạn
     - Fix: Improve ads + landing page
```

---

### **Issue #7: ROAS Thấp**
```
Triệu chứng:
  ROAS < 1:1 (lỗ tiền)
  ROAS 1-2 (tạm ổn nhưng thấp)

Nguyên nhân:
  1. Bid quá cao
  2. Conversion value thấp
  3. Targeting sai
  4. Product margin thấp

Cách sửa:
  - ROAS < 1:1:
    1. Dừng campaign ngay
    2. Hoặc giảm bid 50%
    3. Tối ưu landing page
  
  - ROAS 1-2:
    1. Giảm bid 10-20%
    2. Refine audience
    3. A/B test landing page
    4. Nếu vẫn thấp → evaluate nếu product có profit
```

---

---

## PHẦN 7: MONITORING SCHEDULE

### **Hàng Ngày (Daily)**
```
08:00 AM: Check
  - Ad spend vs daily budget (có phải campaign đang chạy không)
  - Any errors in Google Ads (ads disapproved không)
  - Top performing keywords (focus chi tiêu vào đó)

04:00 PM: Check
  - Conversions (có xuất hiện không)
  - Conversion tracking status
  - Any unusual spikes/drops in metrics
```

### **Hàng Tuần (Weekly)**
```
Monday Morning: Full Analysis
  - CTR trend (tăng hay giảm)
  - CPA trend (so với 4 tuần trước)
  - Quality Score (có thay đổi không)
  - Impression Share (đủ reach không)
  
Action Items:
  - Pause underperforming keywords
  - Increase bid for top performers
  - Test new ad variations
```

### **Hàng Tháng (Monthly)**
```
First Monday: Comprehensive Review
  - ROAS vs target
  - CPA vs target
  - Conv Rate trend
  - Health Score
  
Strategy Review:
  - Should we scale (tăng budget)?
  - Should we pause underperforming?
  - Should we test new keywords?
  - Should we A/B test landing page?
```

---

---

## PHẦN 8: KEYWORDS & TERMINOLOGY

| Thuật ngữ | Ý nghĩa | Ví dụ |
|-----------|---------|-------|
| **Impression** | Lần hiển thị quảng cáo | 1000 impressions = quảng cáo hiển thị 1000 lần |
| **Click** | Lần nhấp vào quảng cáo | 50 clicks = 50 người click vào |
| **Conversion** | Hành động mục tiêu hoàn thành | 5 conversions = 5 cuộc gọi/booking |
| **Attribution** | Gán credit cho conversion | Last-click, first-click, multi-touch |
| **Quality Score** | Điểm chất lượng từ Google | 1-10, mỗi keywords có riêng |
| **Bid** | Giá tối đa bạn sẵn sàng trả | $5/click = willing to pay up to $5 |
| **Budget** | Tổng tiền/ngày hoặc/tháng | Daily budget $100 = max $100/day |
| **Negative Keywords** | Từ khóa loại trừ | Adding "free" → avoid free-seekers |
| **A/B Testing** | So sánh 2 version | Version A vs B để xem cái nào tốt hơn |
| **Landing Page** | Trang người dùng quỳ vào | Website page sau khi click ads |

---

**Đây là bộ metrics và thuật toán hoàn chỉnh để phân tích campaign Google Ads!**

