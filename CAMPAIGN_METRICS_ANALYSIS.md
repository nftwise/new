# 📊 Phân Tích Ngữ Nghĩa: Metrics Ảnh Hưởng Đến Chiến Dịch Google Ads

## Tổng Quan
Để hiểu **tôi đang sai ở đâu** trong chiến dịch, cần phân tích metrics từ **3 góc độ chính**:
1. **Góc độ Chi Phí** - Tiền đang đi đâu, có hiệu quả không
2. **Góc độ Hiệu Suất** - Quảng cáo có thu hút người dùng không
3. **Góc độ Chuyển Đổi** - Có chuyển hóa thành khách hàng thực tế không

---

## I. METRICS CORE (5 Metrics Chính)

### 1️⃣ Ad Spend (Chi Phí Quảng Cáo)
- **Định nghĩa**: Tổng tiền bạn đã chi cho quảng cáo
- **Đọc được gì**: 
  - ✅ Xu hướng tăng → Chiến dịch đang mở rộng
  - ❌ Không thay đổi → Quảng cáo bị tạm dừng
  - ⚠️ Tăng đột ngột → Đã điều chỉnh bid hoặc targeting

### 2️⃣ Impressions (Lượt Hiển Thị)
- **Định nghĩa**: Bao nhiêu lần quảng cáo được hiển thị
- **Đọc được gì**:
  - ✅ Cao & ổn định → Visibility tốt
  - ⚠️ Thấp → Impression share thấp, mất cơ hội
  - ❌ Giảm mạnh → Quality score giảm hoặc bid thấp

### 3️⃣ Clicks (Lượt Nhấp)
- **Định nghĩa**: Bao nhiêu người nhấp vào quảng cáo
- **Đọc được gì**:
  - ✅ Cao → Quảng cáo hấp dẫn, targeting tốt
  - ⚠️ Thấp → CTR thấp (ad copy yếu)
  - ❌ Không có clicks → Chiến dịch tạm dừng hoặc impressions = 0

### 4️⃣ Conversions (Chuyển Đổi)
- **Định nghĩa**: Bao nhiêu người click → thực hiện hành động (mua, gọi, booking)
- **Đọc được gì**:
  - ✅ Cao & ổn định → Chiến dịch hoạt động tốt
  - ⚠️ 0 conversions → Tracking sai HOẶC landing page có vấn đề
  - ❌ Giảm mạnh → Landing page thay đổi

### 5️⃣ Conversion Value (Giá Trị Chuyển Đổi)
- **Định nghĩa**: Tổng doanh thu từ những conversions
- **Đọc được gì**:
  - ✅ Cao → Bán sản phẩm có giá trị cao
  - ⚠️ Thấp → Chuyển đổi sang sản phẩm giá thấp
  - ❌ Không có → Chưa setup conversion value tracking

---

## II. METRICS TÍNH TOÁN (Efficiency Ratios)

### 📈 CTR = Clicks / Impressions × 100
- **Ý nghĩa**: % người dùng thấy quảng cáo → click vào
- **Mục tiêu**: 2-5% (tùy industry)
- **Sai ở đâu**: CTR thấp + CPA cao → Ad copy không phù hợp

### 💰 CPC = Ad Spend / Clicks
- **Ý nghĩa**: Trung bình trả bao nhiêu tiền cho mỗi click
- **Sai ở đâu**: CPC cao → Tăng Quality Score, giảm bid

### 🎯 CPA = Ad Spend / Conversions
- **Ý nghĩa**: Trung bình trả bao nhiêu để có 1 khách hàng
- **Sai ở đâu**: CPA cao → Landing page weak, bid quá cao, targeting sai

### 💹 ROAS = Conversion Value / Ad Spend
- **Ý nghĩa**: Cứ $1 chi phí → bạn lấy được bao nhiêu $ doanh thu
- **Mục tiêu**: 3:1 trở lên
- **Sai ở đâu**: ROAS < 1:1 → Lỗ tiền, dừng ngay

### 📊 Conv Rate = Conversions / Clicks × 100
- **Ý nghĩa**: % click → conversion
- **Sai ở đâu**: Conv Rate < 1% → Landing page có vấn đề

---

## III. METRICS CHẤT LƯỢNG (Quality & Reach)

### ⭐ Quality Score (1-10)
- **Thành phần**: 33% CTR + 33% Ad Relevance + 33% Landing Page
- **Sai ở đâu**: QS thấp → Ad copy không match keyword, landing page yếu

### 📍 Impression Share (IS)
- **Ý nghĩa**: % hiển thị khi đủ điều kiện
- **Mục tiêu**: > 90%
- **Sai ở đâu**: IS < 50% → Budget cạn, bid thấp, hoặc QS thấp

### 💔 Search Lost IS - Budget
- **Ý nghĩa**: % impression bị mất vì budget cạn
- **Sai ở đâu**: > 10% → Tăng daily budget

### 🏆 Search Lost IS - Rank
- **Ý nghĩa**: % impression bị mất vì bid không đủ cao
- **Sai ở đâu**: > 20% → Tăng bid hoặc tối ưu Quality Score

---

## IV. DECISION TREE - "TÔI ĐANG SAI Ở ĐÂU?"

```
1. CONVERSIONS = 0?
   → FIX: Setup conversion tracking (GA4, pixel, verification)

2. CONVERSION RATE < 1%?
   → FIX: A/B test landing page, improve UX, reduce friction

3. CPA > TARGET?
   → FIX: Check CTR (if low → improve ad copy)
   → FIX: Check conversion rate (if low → optimize landing)

4. CTR < 1%?
   → FIX: Rewrite ad copy, improve ad extensions, review keywords

5. IMPRESSIONS too low?
   → FIX: Check Quality Score (if < 5 → improve relevance)
   → FIX: Check Impression Share (if < 50% → increase budget/bid)
   → FIX: Check Budget IS (if > 10% → increase daily budget)

6. ROAS < 3:1?
   → FIX: Reduce bid, refine targeting, or review product margin
```

---

## V. 8 METRICS MỀN CÓ NỀN THEO DÕI

| Metric | Target | Alert If | Action |
|--------|--------|----------|--------|
| ROAS | > 3:1 | < 2:1 | Reduce budget or optimize |
| CPA | = Target | +20% | Review landing page |
| CTR | Industry avg | -30% | Refresh ad copy |
| Quality Score | > 7 | < 5 | Rewrite ads |
| Conv Rate | > 2% | < 1% | A/B test landing |
| Impression Share | > 80% | < 50% | Increase budget |
| Budget IS | < 5% | > 10% | Increase daily budget |
| Conversions | > 0 | = 0 | Check tracking |
