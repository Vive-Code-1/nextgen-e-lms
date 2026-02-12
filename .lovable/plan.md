

# Fully Functional Student Dashboard

This is a comprehensive overhaul of the Student Dashboard with new database tables, storage, and multiple functional tabs.

## New Database Tables Required

### 1. `lessons` - Course content
- `id` (uuid, PK)
- `course_id` (uuid, FK -> courses)
- `title` (text)
- `video_url` (text, nullable) - embedded video link
- `notes` (text, nullable) - prompts/notes shown below the lesson
- `sort_order` (integer, default 0)
- `created_at` (timestamptz)

### 2. `lesson_progress` - Track which lessons a student completed
- `id` (uuid, PK)
- `user_id` (uuid)
- `lesson_id` (uuid, FK -> lessons)
- `completed` (boolean, default false)
- `completed_at` (timestamptz, nullable)

### 3. `announcements` - Admin announcements
- `id` (uuid, PK)
- `title` (text)
- `content` (text)
- `created_by` (uuid)
- `created_at` (timestamptz)

### 4. `reviews` - Student reviews (admin-approved)
- `id` (uuid, PK)
- `user_id` (uuid)
- `course_id` (uuid, FK -> courses)
- `rating` (integer, 1-5)
- `comment` (text)
- `approved` (boolean, default false)
- `created_at` (timestamptz)

### 5. `assignments` - Admin-created assignments
- `id` (uuid, PK)
- `course_id` (uuid, FK -> courses)
- `title` (text)
- `description` (text)
- `due_date` (timestamptz, nullable)
- `created_by` (uuid)
- `created_at` (timestamptz)

### 6. `assignment_submissions` - Student submissions
- `id` (uuid, PK)
- `assignment_id` (uuid, FK -> assignments)
- `user_id` (uuid)
- `content` (text) - submission text/link
- `submitted_at` (timestamptz)
- `status` (text, default 'pending') - pending/approved/rejected
- `marks` (integer, nullable)
- `feedback` (text, nullable) - admin feedback

### Storage
- Create `avatars` bucket (public) for profile picture uploads

## RLS Policies

- **lessons**: Public read (enrolled students), admin ALL
- **lesson_progress**: Users read/insert/update own, admin read all
- **announcements**: Public read, admin ALL
- **reviews**: Users insert own, read approved ones, admin ALL
- **assignments**: Students read (enrolled courses), admin ALL
- **assignment_submissions**: Users read/insert own, admin ALL

## Frontend: Student Dashboard Tabs

The `StudentDashboard.tsx` will be refactored into a tab-based layout with a working sidebar:

### Tab 1: Dashboard (Home)
- Welcome message, stats cards (total courses, running, completed, certificates)
- Course support banner, quick links, FAQ -- similar to current but with real data

### Tab 2: My Courses
- List of enrolled courses with:
  - Course image, title, instructor/mentor name
  - Progress bar (% of lessons completed)
  - "Continue Learning" button that navigates to the course lesson player

### Tab 3: Course Lesson Player (sub-view within My Courses)
- When a student clicks a course, show:
  - Lesson list sidebar (checkable)
  - Main area: video embed or lesson content
  - Below the lesson: Notes/Prompts field (read-only, set by admin)
  - Mark as complete button

### Tab 4: Announcements
- List of all announcements from admin
- Title, content, date -- read-only for students

### Tab 5: Assignments
- List of assignments for enrolled courses
- Each assignment shows: title, description, due date, status
- "Submit" button opens a form to submit text/link
- Shows marks and feedback after admin review

### Tab 6: Reviews
- Two sections:
  - **Course Review**: Select a course, give rating (stars) + comment, submit
  - **Facebook Page Link**: Button/link to the Facebook page for external review
- Shows "Pending approval" status after submission

### Tab 7: Profile
- Edit full name, phone, address
- Change password (using Supabase auth.updateUser)
- Upload avatar (using Supabase Storage `avatars` bucket)
- Display current profile info

## Admin Dashboard Updates

Add management tabs in `AdminDashboard.tsx` for:

### Announcements Management
- Create/edit/delete announcements

### Assignments Management
- Create assignments per course
- View submissions, approve/reject, give marks + feedback

### Reviews Management
- View all reviews, approve/reject for public display

### Lessons Management
- Add/edit/delete lessons per course with video URL and notes

## Files to Create/Modify

### New Files:
1. `src/components/dashboard/DashboardHome.tsx` - Stats & welcome
2. `src/components/dashboard/MyCourses.tsx` - Enrolled courses list
3. `src/components/dashboard/LessonPlayer.tsx` - Video + notes player
4. `src/components/dashboard/Announcements.tsx` - Read announcements
5. `src/components/dashboard/Assignments.tsx` - View & submit assignments
6. `src/components/dashboard/Reviews.tsx` - Submit reviews
7. `src/components/dashboard/Profile.tsx` - Edit profile & avatar

### Modified Files:
1. `src/pages/StudentDashboard.tsx` - Refactor to use tab components with working sidebar navigation
2. `src/pages/AdminDashboard.tsx` - Add announcements, assignments, reviews, lessons management tabs

### Database Migration:
- 1 migration with all 6 new tables, RLS policies, and storage bucket

## Technical Notes

- Avatar uploads use Supabase Storage with a public `avatars` bucket
- Password change uses `supabase.auth.updateUser({ password })` from the client
- Lesson progress calculates course completion percentage
- Reviews require `approved = true` to show on the public course details page
- Assignment marks are shown only after admin sets status to 'approved'
- All new tables use RLS with appropriate policies for student vs admin access

