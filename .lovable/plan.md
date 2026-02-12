

# Hero Section Layout Fixes

## Summary
Three changes: (1) Make hero section full viewport height (100vh) and remove Browse Categories from visible hero area, (2) Move stats cards right below the search bar with glass effect and updated values with countdown animation, (3) Fix category dropdown to open upward instead of downward.

---

## Changes

### 1. Hero Section Full Viewport Height

**File:** `src/components/home/HeroSection.tsx`

- Change the `<section>` to `min-h-screen` (100vh) so the hero fills the entire viewport
- Remove `pb-12` and adjust padding so content is vertically centered
- The Browse Categories section (next section after hero) will naturally start below the fold

### 2. Stats Cards Below Search Bar with Glass Effect and Updated Values

**File:** `src/components/home/HeroSection.tsx`
- Move the `<StatsSection embedded />` from its current position (below the grid) to directly below the search bar `div`, inside the left text column
- This positions the 4 cards right under the search bar as shown in the reference image

**File:** `src/components/home/StatsSection.tsx`
- Change card styling from `bg-white/70` to glass effect matching the navbar: `bg-white/10 backdrop-blur-xl border border-white/20`
- Update text colors to white (`text-white` for numbers, `text-white/70` for labels) since they sit on dark background
- Update stat values:
  - Online Courses: 10 stays as `10` but display as `10K`
  - Expert Tutors: change from `200` to `20` and display as `20+` (not `20K`)
  - Certified Courses: `6` stays as `6K`
  - Online Students: change from `60` to `5` and display as `5K`
- The `useCountUp` hook already provides countdown animation -- values will count up from 0

### 3. Category Dropdown Opens Upward

**File:** `src/components/home/HeroSection.tsx`
- Change the dropdown positioning from `top-full mt-2` to `bottom-full mb-2`
- This makes the category list appear above the search bar instead of below where it overlaps with the stats cards

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/HeroSection.tsx` | Add `min-h-screen`, move StatsSection below search bar, dropdown opens upward |
| `src/components/home/StatsSection.tsx` | Glass effect styling, updated stat values (20+, 5K), white text colors |

### Stats Value Changes
- Online Courses: `10` -> `10` (display: `10K`) -- no change
- Expert Tutors: `200` -> `20` (display: `20+` instead of `200K`)
- Certified Courses: `6` -> `6` (display: `6K`) -- no change
- Online Students: `60` -> `5` (display: `5K`)

### Dropdown Direction
Current: `absolute top-full right-0 mt-2` (opens downward)
New: `absolute bottom-full right-0 mb-2` (opens upward)

