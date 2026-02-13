

# Category Dropdown Z-Index Fix and Course Filtering Fix

## Problem 1: Dropdown Hidden Behind Stats Cards
The category dropdown in the hero section appears behind the stats cards (6K, 5K cards). The dropdown container needs a higher z-index stacking context so it renders above the stats section below it.

## Problem 2: Category Search Not Filtering on Courses Page
When selecting a category and searching from the hero, the Courses page navigates correctly but doesn't filter courses properly. The `useEffect` that reads URL params needs to properly reset state when params change.

## Solution

### File: `src/components/home/HeroSection.tsx`
- Add `relative z-50` to the search bar wrapper div (the `animate-fade-in-up-delay-2` div) so the dropdown creates a stacking context above the StatsSection below it
- This ensures the dropdown menu with `z-[100]` renders above the stats cards

### File: `src/pages/Courses.tsx`
- Fix the `useEffect` to properly handle cases where the category param exists but also reset `selectedCategories` to empty array when no category param is present
- This ensures proper filtering when navigating from the hero search

## Technical Details

| File | Change |
|------|--------|
| `src/components/home/HeroSection.tsx` | Add `relative z-50` to search bar's parent div on line 67 |
| `src/pages/Courses.tsx` | Update `useEffect` (lines 56-63) to always reset state before applying params - set `selectedCategories` to `[]` first, then conditionally set category; set `searchText` to `""` first, then conditionally set search text |

