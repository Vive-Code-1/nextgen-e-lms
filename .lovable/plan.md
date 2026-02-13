

# Fix Course Not Found and Empty Trending Courses

## Issue 1: "Course Not Found" on Enroll Now

**Root Cause**: The `Checkout.tsx` page (line 13-22) uses a **hardcoded** `coursePrices` object to look up course info by slug. The "Google Adsense Loading Courses" (slug: `google-adsense-loading-courses`) is NOT in that hardcoded list. So when you click "Enroll Now", the checkout page can't find the course and shows "Course Not Found".

**Fix**: Replace the hardcoded `coursePrices` lookup with a dynamic Supabase query that fetches the course by slug. This ensures any new course (real or dummy) will work automatically with checkout.

### File: `src/pages/Checkout.tsx`
- Remove the hardcoded `coursePrices` object
- Add a `useEffect` that fetches the course from the `courses` table by slug (using `.maybeSingle()`)
- Use the fetched course data (title, price/discount_price, image_url) for checkout display
- Show a loading state while fetching

---

## Issue 2: Trending Courses Section Empty (Cards Invisible)

**Root Cause**: The `useScrollReveal` hook runs its `useEffect` only once (empty dependency array `[]`). On first mount, `courses` is an empty array, so `PopularCourses` returns `null` and the `ref` never attaches to a DOM element. When courses load and the component re-renders with actual cards, the `useEffect` does NOT re-run, so the IntersectionObserver never observes the element. The grid stays at `opacity-0` forever.

**Fix**: Update `PopularCourses.tsx` to not use the scroll reveal animation on the grid container, OR make the scroll reveal hook re-run when courses load. The simplest fix is to remove the conditional opacity from the grid and always show it.

### File: `src/components/home/PopularCourses.tsx`
- Remove the `useScrollReveal` dependency from the grid's visibility
- Always render the grid with `opacity-100` (the cards are already inside SpotlightCard which provides interaction effects)
- Keep the scroll reveal for the title/subtitle only

---

## Technical Details

### Checkout Dynamic Fetch (Checkout.tsx)

```text
Before: const course = slug ? coursePrices[slug] : null;  // hardcoded lookup
After:  Fetch from supabase: courses table by slug, get title, price, discount_price, has_discount, is_free, image_url
```

### Grid Visibility Fix (PopularCourses.tsx)

```text
Before: className={`grid ... ${isVisible ? "opacity-100" : "opacity-0"}`}
After:  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
```

The `useScrollReveal` hook and `ref` can be removed from PopularCourses since the animation doesn't work correctly with async data loading.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Checkout.tsx` | Replace hardcoded coursePrices with dynamic Supabase fetch |
| `src/components/home/PopularCourses.tsx` | Remove scroll reveal opacity from grid, always show courses |

