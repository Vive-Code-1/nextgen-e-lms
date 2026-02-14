

# Add Monthly, Weekly & Daily Earnings Tabs to Admin Analytics Chart

## Overview
Replace the current single "Monthly Earnings" chart with a tabbed interface showing three views: **Monthly**, **Weekly**, and **Daily** earnings.

## Changes

### File: `src/components/admin/AdminAnalyticsChart.tsx` (full rewrite)

- Add a tab selector (Monthly / Weekly / Daily) using styled buttons at the top of the chart card
- Fetch all completed orders once, then compute data for the selected view:

  **Monthly** (existing logic): Last 6 months, grouped by month  
  **Weekly**: Last 8 weeks, grouped by week (e.g., "Jun 2-8", "Jun 9-15")  
  **Daily**: Last 14 days, grouped by day (e.g., "Jun 14", "Jun 15")

- The XAxis label (`dataKey`) changes based on the active tab ("month", "week", or "day")
- Bar color stays the same purple (`hsl(263, 84%, 58%)`)
- Tooltip continues showing `৳` prefix

### Technical Details

```text
State:
  - activeView: "monthly" | "weekly" | "daily" (default: "monthly")
  - orders: fetched once on mount from supabase orders table
  - chartData: computed via useMemo based on activeView + orders

Tab UI:
  Three buttons styled with active/inactive states using existing
  Tailwind classes (bg-primary text-white vs bg-muted text-muted-foreground)

Data Grouping Logic:
  - Monthly: same as current (6 months, toLocaleDateString month+year)
  - Weekly: iterate last 8 weeks, bucket orders by week start date
  - Daily: iterate last 14 days, bucket orders by date string
```

### No other files need changes
The chart component is self-contained and already imported in `AdminDashboard.tsx`.
