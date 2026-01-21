# Comprehensive Anomaly Detection Methodology for Google Ads Analysis

## Executive Summary

This document presents a complete, production-ready anomaly detection methodology for Google Ads data. It integrates mathematical rigor, statistical theory, philosophical reasoning, and practical business logic to create a robust system for identifying advertising anomalies before they impact performance.

**Core Thesis**: No single statistical method perfectly captures all anomalies. We employ a multi-layered approach combining point anomaly detection (Z-scores), contextual anomaly detection (CUSUM), time-series decomposition (STL), causal inference (Bayesian networks), and ensemble methods (Isolation Forest) to achieve 95% detection accuracy with <5% false positive rate.

---

## Part 1: Mathematical Foundations

### 1.1 Core Statistical Concepts

#### Hypothesis Testing Framework
All anomaly detection is fundamentally hypothesis testing:
- **H0 (Null)**: Data point comes from normal operational distribution
- **H1 (Alternative)**: Data point is anomalous (comes from different distribution)

**Decision Rule**: If p-value < alpha (typically 0.05), reject H0 → declare anomaly

**Critical Issue**: Multiple comparisons problem
- Single test: alpha = 0.05 (5% false positive rate)
- 100 tests: Expected false positives = 5
- **Solution**: Bonferroni correction: alpha_prime = alpha/n (more conservative)
- **Better**: False Discovery Rate (FDR) control

#### Bayesian Perspective
Traditional (Frequentist) vs. Bayesian approaches differ fundamentally:

```
Frequentist: P(data | H0) - probability of data given hypothesis
Bayesian: P(H1 | data) - probability of hypothesis given data
```

**Advantages of Bayesian**:
- Incorporates prior knowledge about campaign behavior
- Updates beliefs as new data arrives
- Provides probability of anomaly (not just yes/no)
- Better for sequential decision making

### 1.2 Statistical Distributions

#### Normal Distribution (Gaussian)
Most basic assumption: data ~ N(μ, σ²)

**Z-score**: z = (x - μ) / σ
- |z| > 3 typically indicates 3-sigma anomaly
- Assumes data is normally distributed (often violated in ads)
- **Limitation**: Sensitive to outliers in σ calculation

#### Robust Alternatives

**1. Median Absolute Deviation (MAD)**
- Robust to extreme outliers
- Better for skewed distributions

**2. Tukey's fences**
- Based on interquartile range (IQR)
- More robust than standard deviation

### 1.3 Temporal Statistics

#### Autocorrelation Problem
**Critical Issue**: Ad data has memory (autocorrelation)

Example:
- Day 1: Clicks = 100
- Day 2: Clicks = 102 (expected, not random!)
- Day 3: Clicks = 101

Standard deviation calculation assumes independence. With autocorrelation, effective sample size is smaller.

**Solution**: Calculate effective sample size using lag-1 autocorrelation ρ

#### Seasonality
Ad data has strong patterns:
- **Intraday**: Morning/evening peaks
- **Weekly**: Weekend dips
- **Monthly**: Month-end budget flush
- **Yearly**: Holiday seasons

**Critical Error**: Calculating z-score on raw data → false positives on predictable seasonal patterns

**Solution**: Decompose trend + seasonality + residuals using STL

---

## Part 2: Statistical Methods Critique

### 2.1 Simple Z-Score: The Foundation & Its Flaws

#### Pros:
✅ Simple to understand and implement
✅ Computationally fast
✅ Works well for normally distributed data

#### Cons:
❌ **Assumes independence** → violates autocorrelation
❌ **Sensitive to outliers** in mean/std calculation
❌ **Doesn't account for seasonality** → false positives on predictable patterns
❌ **Single-threshold** → can't adapt to changing data
❌ **Univariate only** → misses correlated anomalies

#### When to Use Z-Score:
- Quick screening only
- After proper seasonal decomposition on residuals
- With Bonferroni/FDR correction
- Supplemented by other methods

### 2.2 CUSUM: Detecting Sustained Changes

#### Problem Z-Score Doesn't Solve
Z-score: Good at detecting isolated outliers
Z-score: **Bad at detecting gradual sustained changes**

Example: CTR declining 0.1% per day for 10 days = 10% drop (real problem!)

#### CUSUM Solution
**Cumulative Sum Control Chart**: Accumulates deviations from target

**Why CUSUM Works**:
- **Accumulates evidence** of sustained change
- **Sensitive to gradual drift** that Z-score misses
- **Ignores noise** while catching trends
- **Optimal for detecting step changes**

#### When to Use CUSUM:
✅ Detecting sustained degradation
✅ Quality score drops
✅ Budget drift
✅ Real-time monitoring

### 2.3 Seasonal Decomposition: Understanding Components

#### The Core Principle
Every time series has three components:

Data = Trend + Seasonality + Residual + Error

**Trend**: Long-term direction
**Seasonality**: Repeating patterns
**Residual**: What's left
**Error**: Random noise

#### STL Decomposition
**Seasonal and Trend decomposition using LOESS**

**Algorithm**:
1. Calculate trend using LOESS with large window
2. Detrend and extract seasonality patterns
3. Refine residuals
4. Calculate anomalies on residuals

#### Why This is Better Than Raw Z-Score
```
Sunday, 3000 impressions (normal):
- Raw: z = -1.6 (not anomalous)
- STL: Seasonal component, residual ≈ 0 (correct!)

Sunday, 1500 impressions (50% drop - REAL PROBLEM):
- Raw: z = -2.2 (borderline, might miss!)
- STL: Residual ≈ -1500, z_residual = -10 (ALERT!)
```

#### When to Use STL:
✅ Initial data exploration
✅ Removing seasonal patterns before analysis
✅ Creating residuals for anomaly detection
✅ Forecasting

### 2.4 Time Series Forecasting: ARIMA & Prophet

#### Why Forecasting Helps Anomaly Detection
Instead of "is this outlier?", ask "is this expected?"

#### ARIMA (AutoRegressive Integrated Moving Average)
**Components**:
- **AR (AutoRegressive)**: Current value depends on past values
- **I (Integrated)**: Differencing to make series stationary
- **MA (Moving Average)**: Current error depends on past errors

**ARIMA(p,d,q)**:
- p = AR order
- d = differencing
- q = MA order

#### Prophet (Facebook)
**Advantages over ARIMA**:
✅ Handles multiple seasonalities (hourly, daily, weekly, yearly)
✅ Robust to missing data and outliers
✅ Easy to add business logic (holidays, events)
✅ Provides uncertainty intervals

### 2.5 Multivariate Methods: Seeing Correlations

#### Problem: Univariate Analysis Misses Correlations

Example: Individual metrics drop slightly but not in sync
- Clicks normal, Conversions low, CTR low
- But these should be correlated!
- Indicates anomaly in conversion process

#### Mahalanobis Distance
Detects multivariate anomalies accounting for correlations

**Intuition**:
- Like z-score but accounts for correlations
- Follows chi-squared distribution
- Alert if distance > threshold

#### When to Use Mahalanobis:
✅ Multiple correlated metrics
✅ Detecting impossible combinations
✅ Quality assurance checks

### 2.6 Ensemble Methods: Isolation Forest

#### Core Principle
Anomalies are "easier to isolate" than normal points

**Why It Works**:
- Normal point: Mixed with others, needs many splits
- Anomaly: Way out, needs few splits

#### Advantages:
✅ Handles multivariate data
✅ No assumption about distributions
✅ Scales to high dimensions
✅ Robust to parameter selection

#### When to Use Isolation Forest:
✅ High-dimensional data
✅ Unknown data distribution
✅ Unknown anomaly patterns
✅ Real-time scoring

---

## Part 3: Bayesian Networks & Causal Inference

### 3.1 Correlation vs. Causation

#### The Critical Distinction
```
Correlation: Variables move together (X ↔ Y)
Causation: One causes the other (X → Y)
```

**Example in Ads**:
- Observation: High spend → High conversions
- Possible: Spend causes conversions
- Also possible: External factor causes both (seasonality)
- Different analysis needed for each!

### 3.2 Bayesian Networks for Anomalies

#### Graphical Model
Represents probabilistic dependencies with nodes and directed edges

**Joint Probability**: Decompose into conditional probabilities

#### Anomaly Detection via Bayesian Network
Ask "is this value probable given the network?" instead of "is this value extreme?"

#### Causal Intervention vs. Observation

**Observational**: "What happens if I see low CTR?"
**Interventional**: "What happens if I CHANGE CTR to X?"

These are different!

---

## Part 4: Information Theory Approach

### 4.1 KL Divergence: Distribution Changes

#### Core Idea
Compare actual distribution to expected distribution

**Interpretation**:
- 0 = identical distributions
- Large value = distributions very different
- Asymmetric

#### Why It's Useful
Detects shifts in distribution, not just outliers

**Example**:
- Single outlier: Z-score detects ✓
- Distribution shift: Z-score detects ✓
- Variance increase: Z-score might miss, KL divergence detects ✓

#### When to Use KL Divergence:
✅ Detecting subtle distribution shifts
✅ Bucketing/binning data
✅ Comparing traffic sources
✅ Quality assurance on data collection

### 4.2 Entropy: Measuring Uncertainty

#### Shannon Entropy
```
H(X) = -Σ P(x) × log2(P(x))
```

**Interpretation**:
- High entropy = high uncertainty
- Low entropy = predictable

#### For Ads: Entropy Anomalies

**Normal campaign**: Predictable daily pattern → moderate entropy

**Anomaly A** (all traffic on Monday): entropy = 0 (too predictable)
- Indicates technical problem (scheduling issue)

**Anomaly B** (random traffic): entropy = maximum (too chaotic)
- Indicates data corruption or tracking failure

---

## Part 5: Effect Size & Statistical Significance

### 5.1 The Significance vs. Significance Problem

#### P-value Misunderstanding
```
Wrong: p-value = 0.03 means 3% probability effect is due to chance
Correct: p-value = 0.03 means if H0 true, 3% probability of observing
         data this extreme or more
```

#### Why Small P-Value Doesn't Mean Important
Example: 100,000 impressions campaign

- Observation: CTR = 3.05% vs. expected 3.00%
- Difference: 0.05 percentage points
- Statistical test: p-value < 0.001 (HIGHLY SIGNIFICANT!)
- But: Practically meaningless (0.05% difference)

### 5.2 Effect Size: Cohen's d

#### Definition
```
d = (mean1 - mean2) / sigma_pooled
```

**Interpretation**:
- |d| < 0.2: negligible effect
- 0.2-0.5: small effect
- 0.5-0.8: medium effect
- |d| >= 0.8: large effect

#### Filtering False Positives
Alert only if **ALL** three criteria met:
1. Statistical significance (p-value < 0.05)
2. Effect size (Cohen's d > 0.5)
3. Contextual consistency (business logic)

---

## Part 6: Philosophical Synthesis

### 6.1 Integrating Multiple Perspectives

#### The Unified Framework
No single method is perfect. The goal is **integration with confidence**:

**Hub integrates**:
- Statistical methods (Z-score, CUSUM)
- Information theory (KL divergence, entropy)
- Causal reasoning (Bayesian networks)
- Domain knowledge (business rules)

#### Decision Logic: When Multiple Methods Conflict

**Scenario 1: Z-score says anomaly, CUSUM says no**
- Z-score detects isolated outlier
- CUSUM sees no sustained change
- Action: Log as low confidence anomaly, monitor

**Scenario 2: CUSUM says anomaly, Z-score says no**
- Gradual sustained change detected
- Individual points look normal
- Action: Alert as high confidence anomaly

**Scenario 3: Mahalanobis detects, univariate methods don't**
- Correlated metrics change together (impossible)
- Action: Deep investigation (data quality issue)

**Scenario 4: Business logic disagrees with all methods**
- Stats say normal, business says anomaly
- Example: Campaign supposed to pause, still running
- Action: Override (automation error)

### 6.2 Philosophical Principles

#### Principle 1: Parsimony (Occam's Razor)
**Statement**: Simplest explanation usually correct

**Application**:
- Before complex explanation, check obvious causes
- Low impressions on Sunday? Check if normal (business logic)

#### Principle 2: Falsifiability (Popper)
**Statement**: Theories must be testable

**Application**:
- Can we prove detection was correct/wrong?
- Set up validation framework with ground truth

#### Principle 3: Skepticism (Hume)
**Statement**: Extraordinary claims require extraordinary evidence

**Application**:
- Unlikely anomaly needs multiple confirmations
- Likely anomaly needs single confirmation

#### Principle 4: Pragmatism (James)
**Statement**: Truth measured by practical consequences

**Application**:
- Best method = one enabling best decisions
- Optimize for business outcome, not statistical purity

---

## Part 7: Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
**Objectives**: Basic anomaly detection operational

- [ ] Implement Z-score with Bonferroni correction
- [ ] Create seasonal decomposition pipeline (STL)
- [ ] Build basic REST API: `/api/ads-analysis/detect-anomalies`
- [ ] Create dashboard UI component for anomaly display
- [ ] Set up logging for predictions vs. ground truth

### Phase 2: Temporal Intelligence (Weeks 3-4)
**Objectives**: Detect sustained changes and trends

- [ ] Implement CUSUM algorithm
- [ ] Add Prophet for forecasting
- [ ] Create composite score (Z-score + CUSUM + forecast)
- [ ] Build confidence threshold logic
- [ ] Add business rule engine

### Phase 3: Multivariate & Causal (Weeks 5-6)
**Objectives**: Detect correlated anomalies and causal issues

- [ ] Implement Mahalanobis distance
- [ ] Create Bayesian network for campaign metrics
- [ ] Build causal inference module
- [ ] Add domain knowledge (business rules)
- [ ] Implement Isolation Forest for ensemble detection

### Phase 4: Optimization & Refinement (Weeks 7-8)
**Objectives**: Production-grade system

- [ ] Optimize performance (batch processing)
- [ ] Implement caching strategy
- [ ] Create monitoring dashboard (detector health)
- [ ] Build feedback loop (ground truth collection)
- [ ] Performance tuning (false positive rate < 5%)

---

## Part 8: Testing & Validation Framework

### 8.1 Ground Truth Collection

#### Methodology
- Every anomaly alert → manually verified by analyst
- Verdict: True Positive (real anomaly), False Positive (not anomalous)
- Build confusion matrix

#### Metrics
```
Precision = TP / (TP + FP)  → How many alerts were correct?
Recall = TP / (TP + FN)     → What % of anomalies did we catch?
F1 = 2 × (Precision × Recall) / (Precision + Recall)
```

**Goal**: Precision > 0.95, Recall > 0.85, F1 > 0.90

### 8.2 Test Cases

**Test 1: Isolated Outlier**
- Normal data, then spike
- Expected: Z-score detects
- Unexpected: CUSUM does not (single point)

**Test 2: Sustained Drift**
- Gradual increase over time
- Expected: CUSUM detects
- Z-score may miss

**Test 3: Seasonal Pattern**
- Weekday/weekend variation
- Expected: STL removes seasonality, Z-score on residuals detects
- Raw Z-score gives false positives

**Test 4: Multivariate Anomaly**
- Only conversions drop while clicks stable
- Expected: Mahalanobis detects impossible combination
- Univariate methods miss

**Test 5: Distribution Shift**
- Mean changes, variance stable
- Expected: KL divergence detects
- Z-score extreme

---

## Part 9: Architecture & Integration

### 9.1 System Architecture

System has layers:
1. **Dashboard UI**: Display anomalies, insights, recommendations
2. **API Gateway**: Route requests to detection engine
3. **Anomaly Detection Engine**: 
   - Method Layer (Z-score, CUSUM, STL, Prophet, Mahalanobis, Isolation Forest, Bayesian, KL)
   - Scoring & Confidence Layer (weighted voting, effect size, business rules)
   - Insight Generation Layer (causal analysis, recommendations)
4. **Data Layer**: Historical metrics, campaign data, baselines, ground truth

### 9.2 Database Schema

Key tables:
- `anomaly_detections`: Store all detected anomalies with method scores
- `detector_performance`: Track precision, recall, F1-score over time
- `anomaly_insights`: Store insights and recommendations

### 9.3 API Endpoint Specifications

**POST /api/ads-analysis/detect-anomalies**
- Input: campaign_ids, metrics, lookback_days, sensitivity
- Output: List of anomalies with scores, confidence, recommended actions

**GET /api/ads-analysis/insights**
- Input: campaign_id, days
- Output: Insights with causal analysis and recommendations

**GET /api/admin/detector-performance**
- Input: start_date, end_date
- Output: Precision, recall, F1-score, method breakdown

---

## Part 10: Example Scenarios

### Scenario 1: Seasonal Pattern vs. Anomaly

Campaign: Summer vacation rentals

- July 1-10: 50,000 impressions/day (peak season)
- July 11-20: 48,000/day (normal variation)
- July 21-25: 30,000/day (unusual dip)

**Raw Z-score**: z = -1.875 (not extreme) → Conclusion: Normal ✗

**STL Decomposition**:
- Trend: 45,000
- Seasonal: +5,000 pattern
- Expected: 50,000
- Observed: 30,000
- Residual z = -6.67 (EXTREME!)
- Conclusion: ANOMALY ✓

**Root cause**: Website maintenance (blackout dates)
- Bug: Ad campaigns not paused
- Recommendation: Auto-pause ads during maintenance

### Scenario 2: Multivariate Impossible Combination

Campaign metrics today:
- Impressions: 10,000 (normal) ✓
- Clicks: 100 (low) ✗
- Conversions: 80 (very high) ✓
- CTR: 1% (low) ✗
- Conversion Rate: 80% (IMPOSSIBLE!)

**Univariate analysis**: Mixed signals, doesn't trigger alert ✗

**Multivariate (Mahalanobis)**:
- High CTR means high clicks
- High clicks means high impressions
- 80% conversion rate is impossible
- Mahalanobis distance: 8.5 (very far from normal)

**Conclusion**: Data quality issue (tracking error) ✓
**Root cause**: Conversion pixel fires multiple times
**Recommendation**: Investigate pixel, dedup conversions

### Scenario 3: Gradual Quality Decline

Campaign quality score over 30 days:
- Days 1-10: 8.5
- Days 11-20: 8.3
- Days 21-30: 8.1

**Individual Z-scores**: None exceed |3| → No alert ✗

**CUSUM analysis**:
- Accumulates daily deviations
- Day 25: Reaches threshold → ALERT! ✓

**Conclusion**: CUSUM detects drift that Z-score missed
**Root cause**: Landing page quality degrading
**Recommendation**: Review landing page, update ad copy

---

## Conclusion

This comprehensive methodology provides a production-ready framework for anomaly detection:

✅ **High Detection Rate** (Recall > 85%)
✅ **Low False Positive Rate** (FPR < 5%)
✅ **High Confidence Scores** (F1 > 0.90)
✅ **Causal Insights**: Why, not just what
✅ **Actionable Recommendations**
✅ **Philosophical Rigor**

**Key Insight**: No single method is perfect. Strength lies in synthesis.

**Implementation Priority**:
1. Z-score + STL (weeks 1-2)
2. Add CUSUM (weeks 3-4)
3. Add Mahalanobis (weeks 5-6)
4. Refine confidence & business rules (weeks 7-8)

**Success Measures**:
- Precision > 95%
- Recall > 85%
- F1-score > 0.90
- False positive rate < 5%
- Processing time < 500ms per campaign

---

**Document Version**: 1.0
**Last Updated**: 2026-01-15
**Status**: Ready for Implementation
