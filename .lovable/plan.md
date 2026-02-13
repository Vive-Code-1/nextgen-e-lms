
# NextGen LMS - Complete Dashboard System Upgrade (Tutor LMS Pro Style)

This is a large-scale upgrade to both the Student and Admin dashboards, making them fully dynamic with Supabase and adding new features. The work is organized into logical phases.

---

## Phase 1: Fix Config + New Database Tables

### Restore Edge Function Config
The `supabase/config.toml` lost its edge function settings. Restore `verify_jwt = false` for `process-payment` and `payment-callback`.

### New Database Tables (SQL Migration)

| Table | Purpose |
|-------|---------|
| `wishlist` | Student course wishlist (user_id, course_id) |
| `quiz_questions` | Questions for quizzes within lessons |
| `quiz_attempts` | Student quiz attempt results |

```text
wishlist:        id, user_id (FK auth.users), course_id (FK courses), created_at
quiz_questions:  id, lesson_id (FK lessons), question, options (jsonb), correct_answer, sort_order
quiz_attempts:   id, user_id, lesson_id, score, total, passed, answers (jsonb), created_at
```

All tables get RLS policies following existing patterns.

---

## Phase 2: Shared Layout Upgrade (Both Dashboards)

### Deep Indigo Sidebar
- Sidebar background: `bg-[#1E1B4B]` with white text
- Active link: Vivid Violet `bg-[#7C3AED]` pill
- Hover state: `hover:bg-white/10`

### Sticky Top Bar
- Full-width sticky header above main content
- Contains: "Welcome, [Name]" greeting, Notification Bell icon, Profile Avatar dropdown (with links to Profile, Settings, Logout)

### Breadcrumb Navigation
- Show current section path: Dashboard > My Courses, Dashboard > Assignments, etc.

### Mobile Responsiveness
- Sidebar collapses to bottom tab bar on mobile (existing pattern retained)
- Top bar adapts to smaller screens

---

## Phase 3: Student Dashboard Enhancements

### A. Dashboard Home (Enhanced)
- **Accurate Stats**: Query enrollments + lesson_progress to compute Active vs Completed course counts dynamically
- **"Pick Up Where You Left Off"**: Query the most recently accessed lesson (latest lesson_progress entry) and show course card + "Resume" button

### B. Enrolled Courses (Enhanced)
- Add status labels: "Active" (progress < 100%), "Completed" (100%)
- Golden Amber CTA: "Start Learning" (0%) or "Continue" (>0%)
- Grid view with progress bars (already exists, enhanced)

### C. Wishlist (New Tab)
- Show wishlist courses from new `wishlist` table
- "Remove" and "Enroll Now" buttons
- Link course cards to `/courses/:slug`

### D. Quiz Attempts (New Tab)
- Table: Course Name, Quiz Title, Total Marks, Earned Marks, Result (Pass/Fail badge), Date
- "View Details" expands to show per-question breakdown

### E. Purchase History (New Tab)
- Query `orders` table for current user
- Table: Order ID (short), Course Name (join), Date, Amount, Status badge, "Download Invoice" button (generates simple receipt)

### F. Reviews (Enhanced)
- Add Edit and Delete functionality for user's own reviews

### G. Settings/Profile (Enhanced)
- Add Bio field to profile
- Existing avatar upload, name, phone, password change kept

---

## Phase 4: Admin Dashboard Enhancements

### A. Admin Overview (Enhanced)
- **Analytics Cards**: Total Revenue, Total Enrollments, Total Instructors (from user_roles where role = 'instructor'), Total Students
- **Monthly Earnings Chart**: Bar chart using Recharts, query orders grouped by month
- **Recent Activity**: Show latest user signups from profiles table (ordered by created_at desc, limit 10)

### B. Course Manager (New Tab - replaces basic courses display)
- **Course List Table**: Thumbnail, Title, Instructor, Price, Category, Actions (Edit/Delete)
- **Course Builder Dialog**: 
  - Info Tab: Title, Slug, Description, Image URL, Instructor Name, Category
  - Curriculum Tab: Accordion of existing lessons for this course, add/edit/delete lessons inline (absorbs current AdminLessons functionality)
  - Settings Tab: Price, Original Price, Duration

### C. User Management (New Tab)
- **Students Tab**: Table of all users with role = 'student' - Name, Email, Enrolled Courses count, Join Date
- **Instructors Tab**: Table of users with role = 'instructor' - Name, Email, Courses assigned

### D. Orders Management (Enhanced)
- Add course name join to orders table display
- Add user name/email join
- Filter by status (All/Pending/Completed)
- Existing approve functionality kept

### E. Settings (Enhanced)
- Keep existing payment settings
- Add Commission Allocation setting (admin_share / instructor_share percentage stored in site_settings)

---

## Phase 5: File Structure

### New Files
| File | Purpose |
|------|---------|
| `src/components/dashboard/DashboardTopBar.tsx` | Shared sticky top bar |
| `src/components/dashboard/Wishlist.tsx` | Student wishlist tab |
| `src/components/dashboard/QuizAttempts.tsx` | Student quiz attempts tab |
| `src/components/dashboard/PurchaseHistory.tsx` | Student purchase history |
| `src/components/admin/AdminCourseManager.tsx` | Course builder with tabs |
| `src/components/admin/AdminUserManagement.tsx` | Students/Instructors lists |
| `src/components/admin/AdminAnalyticsChart.tsx` | Monthly earnings bar chart |

### Modified Files
| File | Changes |
|------|---------|
| `supabase/config.toml` | Restore edge function configs |
| `src/pages/StudentDashboard.tsx` | Deep indigo sidebar, top bar, new tabs (Wishlist, Quiz Attempts, Purchase History), breadcrumbs |
| `src/pages/AdminDashboard.tsx` | Deep indigo sidebar, top bar, new tabs (Course Manager, User Management), Recharts analytics, breadcrumbs |
| `src/components/dashboard/DashboardHome.tsx` | "Pick Up Where You Left Off" section, accurate active/completed stats |
| `src/components/dashboard/MyCourses.tsx` | Active/Completed status labels, Golden Amber CTAs |
| `src/components/dashboard/Reviews.tsx` | Add Edit/Delete for own reviews |

### SQL Migration
One migration file for `wishlist`, `quiz_questions`, and `quiz_attempts` tables with RLS.

---

## Design Tokens Applied Throughout

| Element | Color/Style |
|---------|-------------|
| Sidebar background | Deep Indigo `#1E1B4B` |
| Sidebar text | White |
| Active sidebar link | Vivid Violet `#7C3AED` rounded pill |
| Primary buttons | Vivid Violet `#7C3AED` |
| CTA buttons (Start Learning, Enroll) | Golden Amber `#FBBF24` |
| Success states | Emerald `#10B981` |
| Main content background | Light Violet `#F5F3FF` |
| Cards | White with subtle border |

---

## Important Notes

- All data is fetched dynamically from Supabase - no hardcoded/mock data
- Existing features (Lesson Player, Assignments, Announcements) are preserved and enhanced
- RLS policies follow existing security patterns (users see own data, admins see all)
- Recharts is already installed for the admin analytics chart
- The Courses page currently uses hardcoded data - this plan focuses on dashboards only; the Courses page can be made dynamic separately
