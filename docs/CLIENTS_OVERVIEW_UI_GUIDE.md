# Clients Overview - UI/UX Guide

## Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                        HEADER (Neural Design)                       │
│               User Email | Profile Menu | Logout                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      SUMMARY STAT CARDS                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ ✓ Healthy        │  │ ⚠ Warnings       │  │ ⚠ Critical       │  │
│  │   5 Clients      │  │   2 Clients      │  │   1 Client       │  │
│  │ 100% operational │  │ Needs attention  │  │ Action required  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  FILTER: [ All Clients (8) ] [ Needs Attention (3) ] [ Critical (1) ] │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT CARDS (List)                         │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ [A] Acme Corp              Score: 78/100  ⚠ WARNING          →│ │
│  │                                                                │ │
│  │ CTR: 3.45%    Spend: $12,450    Conversions: 342             │ │
│  │                                                                │ │
│  │ ⚠ 1 High Alert                                                │ │
│  │                                                                │ │
│  │ RECENT ISSUES                                                 │ │
│  │ ├─ CTR declining (High)        Dashboard quality score down   │ │
│  │ └─ Cost per conversion up (Med) CPA increased 15% week-over-w│ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ [B] Beta Inc                Score: 45/100  🔴 CRITICAL       →│ │
│  │                                                                │ │
│  │ CTR: 1.23%    Spend: $5,200     Conversions: 52              │ │
│  │                                                                │ │
│  │ 🔴 2 Critical  ⚠ 1 High Alert                                │ │
│  │                                                                │ │
│  │ RECENT ISSUES                                                 │ │
│  │ ├─ Campaign paused unexpectedly (Critical)   Budget depleted │ │
│  │ ├─ Quality score < 4 (Critical)             Severe relevance│ │
│  │ └─ High CPA threshold exceeded (High)        CPA at $23.50   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ [C] Creative Solutions        Score: 92/100  ✓ HEALTHY       →│ │
│  │                                                                │ │
│  │ CTR: 4.12%    Spend: $28,900    Conversions: 1,205           │ │
│  │                                                                │ │
│  │ (No alerts)                                                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  [More clients below...]                                            │
│                                                                      │
│  Last updated: 2026-01-15 at 3:45 PM                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Header Section
- **Left**: Company logo/name
- **Right**: User email, profile dropdown, logout button
- **Style**: Neural design with cream background

### 2. Summary Stat Cards (3-column grid)
Each card shows:
- Icon (color-coded: green/gold/red)
- Label ("Healthy Clients", "Clients with Warnings", "Critical Issues")
- Count (number)
- Change indicator (all good / needs attention / action required)

Example:
```
┌─────────────────┐
│ ✓ Healthy       │
│   5             │
│ All good        │
└─────────────────┘
```

### 3. Filter Buttons
Three buttons in a row:
- "All Clients (8)" - shows all
- "Needs Attention (3)" - shows warning + critical
- "Critical (1)" - shows critical only

Active button: filled blue background
Inactive button: outline style

### 4. Client Card
Clickable card with full client summary:

**Structure:**
```
┌────────────────────────────────────────────────────┐
│ [Avatar] Name                    Score  Badge  →   │
│                                                    │
│ ┌────────────────────────────────────────────┐   │
│ │ CTR: X%     Spend: $X      Conversions: X  │   │
│ └────────────────────────────────────────────┘   │
│                                                    │
│ ⚠ X Critical  ⚠ X High                           │
│                                                    │
│ RECENT ISSUES                                      │
│ ├─ Issue 1 (Severity)         Description        │
│ ├─ Issue 2 (Severity)         Description        │
│ └─ Issue 3 (Severity)         Description        │
└────────────────────────────────────────────────────┘
```

**Colors:**
- HEALTHY: Green checkmark + "HEALTHY" badge
- WARNING: Gold exclamation + "WARNING" badge
- CRITICAL: Red alert circle + "CRITICAL" badge

**Metrics Grid** (3 columns):
- Column 1: CTR (percentage)
- Column 2: Spend (currency formatted)
- Column 3: Conversions (number formatted)

**Issue Severity Colors:**
- Critical: Red background with red left border
- High: Orange/gold background with gold left border
- Medium: Gold background with gold left border

---

## Interactive Behaviors

### Filter Buttons
```
User clicks "Critical" button
  ↓
Active state: filled blue background
Inactive states: outline only
  ↓
Filtered list updates instantly
Shows only clients with status === 'critical'
```

### Client Card Click
```
User hovers: Subtle shadow increase (hover effect)
  ↓
User clicks card
  ↓
Route to: /ads-analysis?clientId=XXXX-YYYY-ZZZZ
  ↓
Loads detailed dashboard for that client
```

### Empty State
```
If no clients match filter
  ↓
Show centered card with message:
  ✓ All Clear! ✨
  No [critical issues/issues needing attention]
```

### Loading State
```
Page first loads
  ↓
Centered text: "Loading..."
  ↓
Subtext: "Fetching clients overview..."
  ↓
Once loaded: Show stat cards + client list
```

### Error State
```
If API fails
  ↓
Show error card:
  ⚠ Error Loading Clients
  [Error message]
  [Try Again button]
```

---

## Responsive Adjustments

### Desktop (≥1024px)
- 3-4 client cards per row
- Full information display
- Hover effects active
- Tooltips show on hover

### Tablet (768-1024px)
- 2-3 client cards per row
- Slightly condensed spacing
- Hover effects work on long press
- Touch targets adequate (44px minimum)

### Mobile (<768px)
- 1 client card per row (full width)
- Vertical scrolling primary navigation
- No hover effects
- Touch targets 44px+ for accessibility
- Buttons stack vertically if needed
- Metrics possibly collapse to 2 columns

---

## Color Scheme (Neural Design)

```
Text Primary:        #2c2419 (Chocolate)
Text Secondary:      #2c2419 with 60% opacity
Background Primary:  #f5f1ed (Cream)
Background Hover:    rgba(44, 36, 25, 0.02)
Accent Color:        #d9a854 (Gold)
Status Green:        #2d6a4f (Sage)
Status Orange:       #d9a854 (Gold)
Status Red:          #c4704f (Coral)
Border:              rgba(44, 36, 25, 0.1)
```

---

## Typography

- **Page Title** (hidden): Font weight 900, size 24px
- **Stat Labels**: Weight 600, size 14px
- **Stat Values**: Weight 900, size 24px
- **Client Name**: Weight 900, size 18px
- **Metric Labels**: Weight 400, size 12px, opacity 60%
- **Metric Values**: Weight 900, size 16px
- **Issue Title**: Weight 600, size 14px
- **Issue Description**: Weight 400, size 12px, opacity 70%
- **Button Text**: Weight 500, size 14px

---

## Spacing/Padding

- **Page container**: 24px padding (mobile), 48px (desktop)
- **Stat cards**: 20px gap between
- **Card padding**: 24px outer
- **Metrics grid**: 12px gap between cells, 12px padding
- **Issues**: 8px padding each, 6px margin between
- **Avatar**: 40px × 40px

---

## Accessibility

- All buttons have proper contrast (WCAG AA)
- Color-blind friendly (icons + text for status)
- Keyboard navigation supported (Tab through buttons)
- Touch targets minimum 44×44px
- Alt text on all icons
- ARIA labels on stat cards
- Screen reader friendly (semantic HTML)

---

## Example Data

### Client Card: Acme Corp
```
Name: Acme Corp
ID: 550e8400-e29b-41d4-a716-446655440000
Health Score: 78/100
Status: WARNING (gold)
Avg CTR: 3.45%
Total Spend: $12,450.00
Total Conversions: 342
Critical Alerts: 0
High Alerts: 1
Recent Issues:
  1. "CTR declining" (high severity) - "Dashboard quality score down..."
  2. "Cost per conversion up" (medium severity) - "CPA increased 15% week-over-w..."
  3. "Budget allocation issue" (medium severity) - "Monthly budget depletion fas..."
```

### Client Card: Critical Inc
```
Name: Beta Inc
ID: 660e8400-e29b-41d4-a716-446655440001
Health Score: 45/100
Status: CRITICAL (red)
Avg CTR: 1.23%
Total Spend: $5,200.00
Total Conversions: 52
Critical Alerts: 2
High Alerts: 1
Recent Issues:
  1. "Campaign paused unexpectedly" (critical) - "Budget depleted for the mont..."
  2. "Quality score < 4" (critical) - "Severe relevance or landing page..."
  3. "High CPA threshold exceeded" (high) - "CPA at $23.50 vs target $19.00"
```

---

**This UI creates a focused, scannable interface for portfolio management at a glance.**

