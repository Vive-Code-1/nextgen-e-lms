

# Fix 5 Admin Dashboard Issues

## Issue 1: Add FAQ Button Not Working

**Root Cause**: In `CourseWizard.tsx` line 555, the FAQ form visibility condition is:
```
(editingFaqId !== null || faqForm.question || (!editingFaqId && faqs.length === 0))
```
When clicking "Add FAQ", `editingFaqId` is set to `null` and `faqForm.question` is cleared to `""`. If FAQs already exist (`faqs.length > 0`), all three conditions are false, so the form never appears.

**Fix**: Add a `showFaqForm` boolean state. Set it to `true` when "Add FAQ" is clicked, `false` when saving or canceling. Use this state to control form visibility instead of the current fragile condition.

---

## Issue 2: "Title is Required" Error on Update Course

**Root Cause**: In `CourseWizard.tsx`, the `saveCourse` function (line 170) checks `!title.trim()`. The title state is populated via a `useEffect` that depends on `[course]`. However, the issue is that when `AdminCourseManager` passes the course object, the component may re-render and reset state before the effect fires. Additionally, the toast message is misleading when it could be the slug that's empty.

**Fix**: 
- Populate initial state values directly from the `course` prop using default values in `useState` calls or by initializing in the same render cycle (using a lazy initializer or checking `course` directly).
- Use a ref or initialization flag to ensure data is loaded on first render.
- Improve the validation error message to be specific about which field is missing.

---

## Issue 3: Remove Lessons Management Tab

**Changes**:
- Remove `AdminLessons` import and the `{ icon: ClipboardList, label: "Lessons", id: "lessons" }` entry from `sidebarLinks` in `AdminDashboard.tsx`.
- Remove the `{activeTab === "lessons" && <AdminLessons />}` render line.
- The `AdminLessons.tsx` file can be deleted since lessons are now managed inside the CourseWizard's Curriculum step.

---

## Issue 4: Reviews Management - Show Reviews + Approve/Add New

**Root Cause**: The `AdminReviews` component fetches reviews with a join on `profiles:user_id(full_name, email)`. This join syntax may fail silently, returning empty results. Also, the reviews RLS policy shows "Read approved reviews" uses `((approved = true) OR (auth.uid() = user_id))` -- but the admin has a separate ALL policy that should override this.

**Fix - AdminReviews.tsx** (complete rewrite):
- Fix the query to properly join profiles and courses
- Show all reviews (pending + approved) with Approve/Reject buttons
- Add "Add New Review" dialog with:
  - Student name (text input)
  - Student image URL or upload (to avatars bucket)
  - Course selection (dropdown from courses table)
  - Rating (star picker)
  - Comment (textarea)
  - Auto-set `approved: true` for admin-created reviews
- Reviews created here will dynamically appear on home page testimonials and course detail pages

---

## Issue 5: User Management - Card Layout for Students

**Changes to `AdminUserManagement.tsx`**:
- Replace the students table with a responsive **card grid** layout (3 columns on desktop, 2 on tablet, 1 on mobile)
- Each card shows:
  - Avatar image (from `profiles.avatar_url`, fallback to initials)
  - Full name
  - Email
  - Join date
  - Enrolled courses count
- Add a search bar to filter students by name/email
- Keep instructors tab as a table (simpler data)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/CourseWizard.tsx` | Fix FAQ form visibility with `showFaqForm` state; fix title initialization for edit mode |
| `src/pages/AdminDashboard.tsx` | Remove Lessons sidebar link and tab rendering |
| `src/components/admin/AdminReviews.tsx` | Full rewrite: fix query, add approve/reject, add "Add New Review" dialog |
| `src/components/admin/AdminUserManagement.tsx` | Replace students table with card grid + search |

## Files to Delete

| File | Reason |
|------|--------|
| `src/components/admin/AdminLessons.tsx` | Lessons now managed inside CourseWizard Curriculum step |

## No Database Changes Required
All tables (`reviews`, `profiles`, `courses`, `course_faqs`) already have the needed columns and RLS policies.

