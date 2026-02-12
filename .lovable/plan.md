

# Animation Speed, Stats Layout, Trending Courses Grid, and Category Filtering Fixes

## Summary
Four changes: (1) Slow down ScrollFloat and ScrollReveal animations for smoother scroll experience, (2) Make stats cards fit within the marked area (search bar width), (3) Change Trending Courses to 4-column grid with 8 courses and "View All Courses" button, (4) Add category filtering on the Courses page linked from homepage categories.

---

## 1. Smoother Text Animations

**Files:** `src/components/ui/ScrollFloat.tsx`, `src/components/ui/ScrollReveal.tsx`

Current issue: Animations complete too quickly because the scroll trigger range (`scrollStart` to `scrollEnd`) is too narrow.

Changes:
- **ScrollFloat**: Change default `scrollStart` from `"center bottom+=50%"` to `"top bottom"` and `scrollEnd` from `"bottom bottom-=40%"` to `"center center"` -- this spreads the animation over a much longer scroll distance, making it feel smooth
- **ScrollReveal**: Change `rotationEnd` and `wordAnimationEnd` defaults, and widen the scroll trigger start from `"top bottom-=20%"` to `"top bottom"` and end to `"center center+=10%"` -- same effect, longer scroll range for gradual reveal

This makes the animations unfold gradually as the user scrolls rather than snapping in quickly.

## 2. Stats Cards Within Marked Area

**File:** `src/components/home/StatsSection.tsx`

The reference image shows all 4 stats cards should fit within the same width as the search bar. Currently the grid spans wider.

Changes:
- Change `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` to just `grid-cols-2 sm:grid-cols-4` so all 4 cards appear in a single row on small screens too
- Reduce gap from `gap-4` to `gap-2` for tighter spacing
- Further reduce card padding and text sizes to ensure they fit within the `max-w-xl` search bar width

**File:** `src/components/home/HeroSection.tsx`
- Wrap the StatsSection `<div>` with `max-w-xl` to constrain it to the same width as the search bar above it

## 3. Trending Courses: 4 Columns, 8 Courses, View All Button

**File:** `src/components/home/PopularCourses.tsx`

Changes:
- Add 2 more courses to the array (total 8) -- add a second course for 2 categories (e.g., "Advanced Graphics Design" and "Full Stack Web Development")
- Change grid from `lg:grid-cols-3` to `lg:grid-cols-4` for 4 cards per row (2 rows of 4)
- Add a "View All Courses" button below the grid that links to `/courses` using `react-router-dom`'s `Link` component
- Add translation keys for the button text and new course titles

## 4. Category Click Filters Courses Page

**File:** `src/components/home/CategorySection.tsx`
- Wrap each category card with a `Link` to `/courses?category=CategoryName`
- Use the category label (e.g., "Graphics Design") as the query parameter value

**File:** `src/pages/Courses.tsx`
- Read `category` from URL search params using `useSearchParams`
- Update `filterCategories` to match the 6 homepage categories: Graphics Design, Video Editing, Digital Marketing, SEO, Website Development, Dropshipping
- Add state for selected categories (initialized from URL param if present)
- Filter the displayed courses based on selected categories
- Update the courses data to include courses from all 6 categories
- When a category checkbox is checked/unchecked, update the filtered results
- When no category is selected, show all courses

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/ScrollFloat.tsx` | Widen default scroll range (scrollStart/scrollEnd) |
| `src/components/ui/ScrollReveal.tsx` | Widen default scroll range for word animation |
| `src/components/home/StatsSection.tsx` | Tighter grid (grid-cols-2 sm:grid-cols-4), smaller gap |
| `src/components/home/HeroSection.tsx` | Add max-w-xl wrapper around StatsSection |
| `src/components/home/PopularCourses.tsx` | 4-col grid, 8 courses, "View All Courses" link button |
| `src/components/home/CategorySection.tsx` | Link each category to /courses?category=Name |
| `src/pages/Courses.tsx` | Read URL params, state-based filtering, updated categories |
| `src/lib/translations.ts` | Add keys for new courses and "View All" button |

### Scroll Animation Defaults (Before/After)

**ScrollFloat:**
- scrollStart: `"center bottom+=50%"` -> `"top bottom"`
- scrollEnd: `"bottom bottom-=40%"` -> `"center center"`

**ScrollReveal:**
- word trigger start: `"top bottom-=20%"` -> `"top bottom"`
- word trigger end: `"bottom bottom"` -> `"center center+=10%"`

### Courses Page Filter Logic
- URL: `/courses?category=Graphics%20Design`
- On mount: parse `searchParams.get("category")` and pre-select that filter
- Checkbox state: `selectedCategories: string[]`
- Display: `courses.filter(c => selectedCategories.length === 0 || selectedCategories.includes(c.category))`

