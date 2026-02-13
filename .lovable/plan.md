

# My Courses Card Redesign

## Problem
Currently the grid uses `md:grid-cols-2`, making cards too wide and images not displaying properly. The reference shows a more compact card design.

## Changes

**File: `src/components/dashboard/MyCourses.tsx`**

1. Change grid from 2-column to 4-column responsive layout:
   - `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

2. Redesign each card to match reference (image-71):
   - Course thumbnail with proper aspect ratio (use `aspect-video` instead of fixed `h-40`)
   - "Active" / "Completed" badge overlay on image
   - Course title (bold, 2 lines max with truncation)
   - Instructor name with user icon
   - Progress section: label + percentage on left/right, progress bar below
   - Lesson count (e.g., "48/67 lessons completed") and duration if available
   - Golden amber CTA button ("Continue Learning" / "Start Learning")

3. Button styling: Use the brand Golden Amber (`bg-amber-400 hover:bg-amber-500 text-black`) to match the reference's yellow/gold button style.

## Technical Details

Grid class change:
```text
Before: "grid gap-4 md:grid-cols-2"
After:  "grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
```

Image change:
```text
Before: className="h-40 w-full object-cover"
After:  className="w-full aspect-video object-cover"
```

