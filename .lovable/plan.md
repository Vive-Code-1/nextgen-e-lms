

# Fix Mobile Hero Padding, Search Category, Carousel Speeds

## 4 Issues to Fix

### 1. Mobile Hero Banner - Left Padding Too Large

The hero content container uses `max-w-[80vw] mx-auto px-4`. On mobile, `80vw` constrains the width too much and causes content to appear pushed right with excessive left space.

**Fix in `HeroSection.tsx`**: Change the container class to use full width on mobile and `80vw` only on larger screens:
- `max-w-[80vw]` becomes `w-full md:max-w-[80vw]`
- Add `px-6 md:px-4` for balanced mobile padding

### 2. Search Bar Category Dropdown Hidden on Mobile

Line 80: `<div className="hidden sm:flex ...">` hides the category selector on mobile screens.

**Fix in `HeroSection.tsx`**: Change `hidden sm:flex` to `flex` so the category dropdown is always visible, even on mobile.

### 3. Testimonial Carousel Too Fast

Currently `animation: "testimonial-scroll 35s linear infinite"` -- 35 seconds is too fast for reading.

**Fix in `TestimonialCarousel.tsx`**: Increase duration from `35s` to `60s` so cards scroll slower and users can read them.

### 4. Trusted By Marquee Too Slow on Mobile

Currently `animation: marquee 30s linear infinite` in CSS.

**Fix in `TrustedBy.tsx`**: Use inline style with responsive duration -- faster on mobile (15s) vs desktop (30s). Use a media query or conditional class.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/HeroSection.tsx` | Fix mobile padding (line 49), show category on mobile (line 80) |
| `src/components/home/TestimonialCarousel.tsx` | Slow down scroll from 35s to 60s (line 81) |
| `src/components/home/TrustedBy.tsx` | Speed up mobile marquee from 30s to 15s |
| `src/index.css` | Add mobile-specific marquee speed |

## Technical Details

### HeroSection.tsx Changes

```text
Line 49: "max-w-[80vw] mx-auto px-4" -> "w-full max-w-[80vw] mx-auto px-5 md:px-4"
Line 80: "hidden sm:flex" -> "flex"
```

### TestimonialCarousel.tsx Changes

```text
Line 81: animation duration "35s" -> "60s"
```

### TrustedBy / index.css Changes

Add a mobile-specific faster marquee:
```text
.animate-marquee {
  animation: marquee 30s linear infinite;
}
@media (max-width: 768px) {
  .animate-marquee {
    animation: marquee 15s linear infinite;
  }
}
```

