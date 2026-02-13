

# Fix Mobile Hero: Smaller Text, Compact Cards, Proper Fit

## Problem

On mobile, the hero content overflows the screen width. The headline text is too large (text-4xl), stats cards are clipped on the right, and the search bar doesn't fit within the viewport. The user wants all content to fit within the red-marked area (the visible screen).

## Changes

### File: `src/components/home/HeroSection.tsx`

1. **Reduce headline font size on mobile**: `text-4xl` to `text-2xl` (keep `md:text-5xl lg:text-6xl`)
2. **Reduce subheadline font size on mobile**: `text-lg` to `text-base` in both containerClassName and textClassName
3. **Reduce search bar size on mobile**: Smaller padding (`py-2` instead of `py-3`), smaller search icon (`h-4 w-4`), smaller submit button (`h-8 w-8`)
4. **Add `overflow-hidden`** to the main container to prevent any horizontal scroll
5. **Reduce spacing**: `space-y-6` to `space-y-4 md:space-y-6`, stats `mt-8` to `mt-4 md:mt-8`

### File: `src/components/home/StatsSection.tsx`

1. **Smaller stat cards on mobile**: Reduce padding from `p-2.5` to `p-2`, icon container from `p-1.5` to `p-1`, icon size from `h-4 w-4` to `h-3 w-3`
2. **Smaller stat text on mobile**: Value text from `text-base` to `text-sm md:text-base`, label from `text-[10px]` to `text-[9px] sm:text-[10px]`
3. **Tighter grid gap**: `gap-2` to `gap-1.5 sm:gap-2`

## Summary of Size Reductions

| Element | Before (mobile) | After (mobile) |
|---------|-----------------|----------------|
| Headline | text-4xl | text-2xl |
| Subheadline | text-lg | text-base |
| Search bar padding | py-3 | py-2 |
| Search button | h-10 w-10 | h-8 w-8 |
| Stat card padding | p-2.5 | p-2 |
| Stat icon | h-4 w-4 | h-3 w-3 |
| Stat value | text-base | text-sm |
| Vertical spacing | space-y-6 | space-y-4 |

