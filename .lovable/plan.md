

# Homepage Fixes - 4 Changes

## 1. Fix Double Dollar Sign in Course Prices

**Problem:** Course prices in `PopularCourses.tsx` are stored as `"$49.99"` (already include `$`), but the template prepends another currency symbol: `{currency}{course.price}` = `$$49.99`.

**Fix:** Remove the `$` from the price data and store only the numeric value. Then display `{currency}{numericPrice}`. When language is Bengali, show `৳` instead.

**File:** `src/components/home/PopularCourses.tsx`
- Change price values from `"$49.99"` to `"49.99"` (remove $ from all 8 courses)
- Line 101: `{currency}{course.price}` will then correctly show `$49.99` or `৳49.99`

---

## 2. Testimonial Carousel (Infinite Loop with Blur Edges)

**New Section:** Add a Testimonial carousel after the Featured Instructors section. It will have:
- Auto-scrolling infinite loop (using Embla carousel with autoplay)
- Left and right gradient blur/fade edges
- Each testimonial card: user avatar, name, role, star rating, and review text
- Smooth continuous scrolling animation
- Uses the site's brand palette (Violet, Amber accents)

**New File:** `src/components/home/TestimonialCarousel.tsx`

**Modified File:** `src/pages/Index.tsx` -- Insert `<TestimonialCarousel />` between `<FeaturedInstructors />` and `<TrustedBy />`

---

## 3. Replace "Share Knowledge" Section with FAQ

**Current:** The "Want to Share Your Knowledge?" section has a title, description, and CTA button.

**Replace with:** A fully styled FAQ section using the existing shadcn Accordion component. Questions will cover common topics like enrollment, certificates, payment, refunds, etc.

**Modified File:** `src/components/home/ShareKnowledge.tsx` -- Replace entire content with FAQ accordion
**Modified File:** `src/lib/translations.ts` -- Add FAQ translation keys for both EN and BN

The section will keep the gradient background but contain an accordion-style FAQ with 5-6 common questions.

---

## 4. SpotlightCard Effect on "Why Choose Us" Cards

**Effect:** Each card gets a mouse-tracking radial gradient spotlight that follows the cursor. When the mouse hovers over a card, a colored glow appears and follows the pointer.

**Implementation:** Create a `SpotlightCard` wrapper component that:
- Tracks mouse position via `onMouseMove`
- Renders a radial gradient overlay at the cursor position
- Uses brand colors for the spotlight glow:
  - Certified Courses card: Vivid Violet (`rgba(124, 58, 237, 0.25)`)
  - 24/7 Support card: Golden Amber (`rgba(251, 191, 36, 0.25)`)
  - Expert Mentors card: Emerald Green (`rgba(16, 185, 129, 0.25)`)

**New File:** `src/components/ui/SpotlightCard.tsx`

**Modified File:** `src/components/home/WhyChooseUs.tsx` -- Wrap each feature card with `<SpotlightCard>`

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/home/PopularCourses.tsx` | Modify - fix price data |
| `src/components/home/TestimonialCarousel.tsx` | Create - infinite testimonial carousel |
| `src/components/ui/SpotlightCard.tsx` | Create - mouse-tracking spotlight effect |
| `src/components/home/WhyChooseUs.tsx` | Modify - wrap cards with SpotlightCard |
| `src/components/home/ShareKnowledge.tsx` | Modify - replace with FAQ section |
| `src/lib/translations.ts` | Modify - add FAQ translation keys |
| `src/pages/Index.tsx` | Modify - add TestimonialCarousel |

No new dependencies needed -- Embla Carousel and GSAP are already installed.

