

# Fix Horizontal Overflow in Mobile Hero Section

## Problem
The hero section content overflows horizontally on mobile, causing a horizontal scrollbar. The search bar with its category dropdown and button is too wide for small screens.

## Changes

### File: `src/components/home/HeroSection.tsx`

1. **Section overflow**: Add `overflow-x-hidden` to the section (currently only has `overflow-hidden` which should work, but we'll be explicit)

2. **Content container**: Change `px-6` to `px-4` on mobile to give more room for content:
   - Line 49: `px-6 md:px-4` becomes `px-4`

3. **Search bar wrapper**: Constrain width more aggressively on mobile:
   - Line 67: Change `max-w-xl` to `max-w-full sm:max-w-xl` so it never exceeds parent width

4. **Search bar internal layout**: The category dropdown with `whitespace-nowrap` is preventing shrinking. Fix:
   - Line 80: Hide the category section on very small screens using `hidden sm:flex` -- OR make the category text truncatable
   - Better approach: On mobile, hide category text and show only the chevron icon, keeping the row compact
   - Line 84: Change `whitespace-nowrap` to `whitespace-nowrap max-w-[60px] sm:max-w-none overflow-hidden text-ellipsis`

5. **Search bar button**: Already compact at `h-8 w-8`. No change needed.

6. **Stats container**: Change `max-w-xl` to `max-w-full sm:max-w-xl`:
   - Line 111: ensures stats never exceed parent width

### Specific Line Changes

**Line 49** - Container padding:
```
Before: px-6 md:px-4
After:  px-4
```

**Line 67** - Search bar wrapper:
```
Before: w-full max-w-xl mx-auto md:mx-0
After:  w-full max-w-full sm:max-w-xl mx-auto md:mx-0
```

**Line 80** - Category dropdown container:
```
Before: flex items-center border-l border-border px-2 sm:px-3
After:  hidden sm:flex items-center border-l border-border px-2 sm:px-3
```
This hides the category section on mobile (< 640px), which is the main cause of overflow. The search input + button alone fit comfortably.

**Line 111** - Stats wrapper:
```
Before: w-full max-w-xl mx-auto md:mx-0
After:  w-full max-w-full sm:max-w-xl mx-auto md:mx-0
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/HeroSection.tsx` | Fix container padding, hide category on mobile, constrain max-widths |
