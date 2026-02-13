
# Fix Mobile Hero: Fit All Content in Viewport Without Scrolling

## Problem

The hero section uses `min-h-screen` which forces it to fill the entire viewport height, but the top padding (`pt-28`) and spacing push stats cards below the fold. Content doesn't fit in one screen on mobile.

## Changes

### File: `src/components/home/HeroSection.tsx`

1. **Section height**: Change `min-h-screen` to `min-h-[100dvh]` so it uses dynamic viewport height (accounts for mobile browser chrome)
2. **Reduce top/bottom padding on mobile**: Change `pt-28 pb-8` to `pt-20 pb-4 md:pt-32 md:pb-12` -- the navbar is ~64px, so `pt-20` (80px) gives just enough clearance
3. **Reduce grid gap on mobile**: Change `gap-12` to `gap-6 md:gap-12`
4. **Reduce vertical spacing**: Change `space-y-4 md:space-y-6` to `space-y-3 md:space-y-6`
5. **Reduce stats margin**: Change `mt-4 md:mt-8` to `mt-2 md:mt-8`
6. **Subheadline**: Add `text-sm md:text-base` to make it even smaller on mobile

### File: `src/components/home/StatsSection.tsx`

Stats are already in a 2-column grid on mobile (`grid-cols-2`) and already compact. No changes needed.

## Summary

| Element | Before | After |
|---------|--------|-------|
| Section height | `min-h-screen` | `min-h-[100dvh]` |
| Top padding (mobile) | `pt-28` | `pt-20` |
| Bottom padding (mobile) | `pb-8` | `pb-4` |
| Grid gap (mobile) | `gap-12` | `gap-6` |
| Content spacing (mobile) | `space-y-4` | `space-y-3` |
| Stats margin (mobile) | `mt-4` | `mt-2` |
| Subheadline size (mobile) | `text-base` | `text-sm` |

These changes recover approximately 80-100px of vertical space on mobile, which should be enough to fit all content (headline, subheadline, search bar, and 2x2 stats grid) within the viewport without scrolling.
