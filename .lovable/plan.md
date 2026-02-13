

# 5 Fixes - Carousel, SpotlightCard, FAQ Layout, Scroll-to-Top, Contact Page

## 1. Fix Infinite Testimonial Carousel (Not Moving)

The current Embla autoplay with `delay: 0` and custom friction doesn't produce visible continuous movement. The fix is to use a **CSS animation approach** instead -- duplicate the testimonial items and use `@keyframes` to translate the entire strip continuously from 0% to -50%, creating a true infinite marquee loop.

**File:** `src/components/home/TestimonialCarousel.tsx`
- Remove Embla carousel entirely
- Use a CSS `@keyframes scroll` animation on the flex container
- Duplicate testimonials array (already done) for seamless loop
- Keep the left/right gradient blur overlays
- Add `animation: scroll 30s linear infinite` on the track
- Pause animation on hover with `hover:animation-play-state: paused`

## 2. SpotlightCard on Trending Courses Cards

Wrap each `CourseCard` in the `PopularCourses.tsx` with the existing `SpotlightCard` component, assigning category-based spotlight colors.

**File:** `src/components/home/PopularCourses.tsx`
- Import `SpotlightCard`
- Wrap each `<CourseCard>` with `<SpotlightCard>` inside the grid
- Assign colors based on category:
  - Graphics Design: Violet `rgba(124, 58, 237, 0.15)`
  - Video Editing: Coral Pink `rgba(255, 70, 103, 0.15)`
  - Digital Marketing: Amber `rgba(251, 191, 36, 0.15)`
  - SEO: Emerald `rgba(16, 185, 129, 0.15)`
  - Web Dev: Indigo `rgba(30, 27, 75, 0.15)`
  - Dropshipping: Cyan `rgba(6, 182, 212, 0.15)`

## 3. FAQ Layout - 3 Left, 3 Right (Two Columns)

**File:** `src/components/home/ShareKnowledge.tsx`
- Split `faqKeys` into two arrays: left (items 0-2) and right (items 3-5)
- Replace single-column `max-w-3xl` layout with a `grid md:grid-cols-2 gap-6` layout
- Each column gets its own independent `Accordion` with 3 items
- On mobile, columns stack vertically

## 4. Scroll to Top on Navigation

**New File:** `src/components/ScrollToTop.tsx`
- Uses `useLocation` and `useNavigationType` from react-router-dom
- On pathname change (non-POP navigation), calls `window.scrollTo({ top: 0, behavior: "instant" })`

**File:** `src/App.tsx`
- Import and add `<ScrollToTop />` inside `<BrowserRouter>` before `<Routes>`

## 5. Contact Page Redesign

**File:** `src/pages/Contact.tsx`
- Remove the separate info cards section and the "Get in Touch" two-column section
- Combine into ONE section with two columns:
  - **Left side**: 3 stacked cards (Address, Phone, Email) with icons, styled with gradient borders and the brand dark background (`bg-deep-indigo` or `bg-card`), plus social media links at the bottom
  - **Right side**: Contact form card with Name, Email, Phone, Subject (2x2 grid), Message textarea, and Send button
- Both sides are equal height, sitting side by side on desktop, stacking on mobile
- Keep the gradient page header at the top

## Files Summary

| File | Action |
|------|--------|
| `src/components/home/TestimonialCarousel.tsx` | Modify - Replace Embla with CSS marquee animation |
| `src/components/home/PopularCourses.tsx` | Modify - Wrap cards with SpotlightCard |
| `src/components/home/ShareKnowledge.tsx` | Modify - Two-column FAQ grid layout |
| `src/components/ScrollToTop.tsx` | Create - Scroll restoration component |
| `src/App.tsx` | Modify - Add ScrollToTop component |
| `src/pages/Contact.tsx` | Modify - Redesign with two-column layout |

