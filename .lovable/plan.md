

# Fix Mobile Hero - Center Align All Content

## Problem

On mobile, the hero content is pushed to the right and overflows. The `max-w-[80vw]` constraint combined with left-aligned text causes unbalanced layout. Text, search bar, and stats cards are all clipped on the right side.

## Solution

Make the hero section fully responsive on mobile with centered content and proper padding.

### File: `src/components/home/HeroSection.tsx`

**Container (line 49):** Remove `max-w-[80vw]` on mobile, use full width with generous padding:
- Change to `w-full md:max-w-[80vw] mx-auto px-6 md:px-4`

**Text alignment (line 52):** Center text on mobile, left-align on desktop:
- Change `space-y-6` to `space-y-6 text-center md:text-left items-center md:items-start flex flex-col`

**Headline (line 53):** Center on mobile
- Already inherits `text-center md:text-left` from parent

**Subheadline (line 58-64):** Center on mobile
- Add `mx-auto md:mx-0` to constrain width and center

**Search bar container (line 68):** Center on mobile
- Add `mx-auto md:mx-0` to the `max-w-xl` wrapper

**Stats container (line 111):** Center on mobile
- Add `mx-auto md:mx-0`

**Search bar overflow fix:** The search bar with category + button overflows on small screens. Make the search bar stack better by reducing internal padding on mobile and allowing the input to shrink.

### File: `src/components/home/StatsSection.tsx`

No changes needed -- the grid already handles mobile with `grid-cols-2`.

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/HeroSection.tsx` | Center-align mobile content, fix container width, prevent overflow |

