
# Fix Reviews, Assignments & Dynamic Testimonials

## Issue 1: Image Upload Fails with RLS Error in Add New Review

**Root Cause**: The `avatars` storage bucket RLS policy requires uploads to be in `{user_id}/` folder (e.g., `abc123/review-1234.jpg`), but the code uploads to `review-${Date.now()}.${ext}` at the root level.

**Fix in `AdminReviews.tsx`**:
- Change upload path from `review-${Date.now()}.${ext}` to `${user.id}/review-${Date.now()}.${ext}`
- This matches the RLS policy: `(auth.uid())::text = (storage.foldername(name))[1]`

## Issue 2: Add Edit Button to Reviews

**Changes in `AdminReviews.tsx`**:
- Add an "Edit" button (pencil icon) to each review card
- When clicked, open the same dialog pre-filled with the review's data (name, course, rating, comment, image)
- Track `editingReviewId` state to differentiate between add and edit modes
- On save in edit mode, use `supabase.from("reviews").update(...)` instead of insert
- Also update the profile name/avatar if changed

## Issue 3: Dynamic Reviews on Home Page Testimonials

**Changes in `TestimonialCarousel.tsx`**:
- Fetch approved reviews from Supabase on mount
- Combine the static demo testimonials with dynamic DB reviews
- Each dynamic review shows: profile avatar, profile name, course title, rating, and comment
- Both static and dynamic reviews scroll together in the same infinite carousel

## Issue 4: Admin Assignments - Redesign to Match Reference

**Database Migration**: Add columns to `assignments` table:
- `total_marks` (integer, default 0)
- `instructions` (text, nullable)
- `status` (text, default 'published' -- values: published, draft)

**Rewrite `AdminAssignments.tsx`** to match the reference screenshots:
- Header with "Assignments" title and "Add Assignment" button (green pill)
- Status filter dropdown and search bar
- Table layout with columns: Assignment Name (with course subtitle), Total Marks, Total Submissions count, Status (Published/Draft badge), Edit and Delete actions
- "Add Assignment" opens a dialog with: Course (dropdown), Assignment Title, Description, Instructions, Last Date (date picker), Status (Published/Draft dropdown)
- Edit button opens the same dialog pre-filled
- Delete button removes the assignment

## Issue 5: Student Assignments - Card-Based Design

**Rewrite `src/components/dashboard/Assignments.tsx`**:
- Currently shows assignments in a list; the reference image shows a 4-column card grid
- Each card shows: assignment title, course name, description, and submission status
- Cards with no content appear as empty placeholders (matching the reference with bordered empty cards)
- Only show cards for assignments that exist (no empty placeholder cards)
- Clean card design with: title bold at top, course name in accent color below, description text, and "Submit Assignment" button at bottom

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/AdminReviews.tsx` | Fix upload path, add edit functionality |
| `src/components/home/TestimonialCarousel.tsx` | Fetch and merge dynamic approved reviews from DB |
| `src/components/admin/AdminAssignments.tsx` | Full redesign: table layout, dialog form, status/search filters, edit/delete |
| `src/components/dashboard/Assignments.tsx` | Redesign to responsive card grid layout |
| SQL Migration | Add `total_marks`, `instructions`, `status` columns to `assignments` table |
| `src/integrations/supabase/types.ts` | Update types for new assignment columns |

## Database Migration Details

```text
ALTER TABLE assignments ADD COLUMN total_marks integer NOT NULL DEFAULT 0;
ALTER TABLE assignments ADD COLUMN instructions text;
ALTER TABLE assignments ADD COLUMN status text NOT NULL DEFAULT 'published';
```

No new RLS policies needed -- existing admin ALL policy covers these columns.
