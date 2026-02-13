
# Fix Three Issues: Mobile Category Dropdown, Broken Section Titles, Instructor Image Upload

## Issue 1: Show Category Dropdown on Mobile (Compact)

The category dropdown was hidden on mobile (`hidden sm:flex`) to prevent overflow. We'll bring it back in a compact form that fits within the search bar.

### File: `src/components/home/HeroSection.tsx`

- Change the category dropdown container from `hidden sm:flex` back to `flex`
- Make the category text very compact on mobile: show only a short truncated label (max 3-4 chars) using `max-w-[50px] sm:max-w-none overflow-hidden text-ellipsis`
- Reduce padding on mobile: `px-1 sm:px-2`

## Issue 2: Fix Section Titles Breaking on Mobile

The `ScrollFloat` component renders each character as an `inline-block` span, which prevents normal word wrapping. On narrow screens, long words like "Categories" break mid-word. The fix is to reduce font size on mobile for these sections so text fits, and also apply `word-break: break-word` as fallback.

### Files to modify:

**`src/components/home/CategorySection.tsx`**
- Change title font from `text-3xl md:text-4xl` to `text-2xl md:text-4xl` on both h2 and ScrollFloat textClassName

**`src/components/home/FeaturedInstructors.tsx`**
- Change title font from `text-3xl md:text-4xl` to `text-2xl md:text-4xl` on both h2 and ScrollFloat textClassName

**`src/components/home/TestimonialCarousel.tsx`**
- Change title font from `text-3xl md:text-4xl` to `text-2xl md:text-4xl` on both h2 and ScrollFloat textClassName

## Issue 3: Instructor Image Upload in Admin Panel

Currently the courses table only has `instructor_name` -- no `instructor_image` column. We need to:

### Database Migration
- Add `instructor_image text` column to the `courses` table

### File: `src/components/admin/CourseWizard.tsx`
- Add state: `const [instructorImage, setInstructorImage] = useState(course?.instructor_image || "")`
- Add an image upload field next to the Instructor Name input (upload to `course-thumbnails` bucket with path `instructor-images/[timestamp]-[filename]`)
- Include `instructor_image` in the save payload

### File: `src/pages/Courses.tsx`
- Fetch `instructor_image` from the courses query
- In the course card, if `instructor_image` exists, show the image instead of the letter avatar fallback

### File: `src/integrations/supabase/types.ts`
- Will be auto-updated after migration

## Technical Details

| Change | File(s) | Type |
|--------|---------|------|
| Compact mobile category dropdown | HeroSection.tsx | CSS |
| Smaller section titles on mobile | CategorySection, FeaturedInstructors, TestimonialCarousel | CSS |
| Add `instructor_image` column | Migration | SQL |
| Instructor image upload UI | CourseWizard.tsx | React |
| Display instructor image on cards | Courses.tsx | React |
