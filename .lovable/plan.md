

# Dashboard Improvements: Show All Course Progress, Remove Wishlist and Quiz Attempts

## Changes Overview

### 1. Show All In-Progress Courses on Dashboard Home (not just one)

Currently, the "Pick Up Where You Left Off" section only shows the single most recent course. The fix is to change `resumeInfo` from a single object to an **array** of all enrolled courses with progress, so every course the student has started appears.

### 2. Remove Wishlist from Student Dashboard Sidebar

Remove the Wishlist entry from `sidebarLinks` and its `case` in `renderContent()`. Also remove the `Wishlist` import.

### 3. Remove Quiz Attempts from Student Dashboard Sidebar

Same as above -- remove the Quiz Attempts entry from `sidebarLinks`, its `case`, and the import.

### 4. Remove Wishlist Button from Course Details Page

Remove the Wishlist button from the course details sidebar (line 271 in `CourseDetails.tsx`).

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/DashboardHome.tsx` | Change "Pick Up Where You Left Off" from single course to a list of all enrolled courses with progress |
| `src/pages/StudentDashboard.tsx` | Remove Wishlist and Quiz Attempts from sidebar links, remove their cases and imports |
| `src/pages/CourseDetails.tsx` | Remove Wishlist button from sidebar |

## Technical Details

### DashboardHome.tsx - Multiple Resume Cards

Replace single `resumeInfo` state with an array `resumeList: ResumeInfo[]`. For each enrolled course that has at least one lesson_progress entry, calculate its progress percentage and add it to the list. Display all of them in a scrollable list or grid.

```text
Before: resumeInfo: ResumeInfo | null  (single course, fetched via lesson_progress ORDER BY completed_at LIMIT 1)
After:  resumeList: ResumeInfo[]      (all enrolled courses with progress > 0, newest first)
```

The fetch logic changes:
- For each enrolled course, calculate completion percentage from lessons + lesson_progress
- Include courses where user has started at least 1 lesson (progress > 0%)
- Sort by most recently accessed (latest completed_at)
- Render each as a card in the "Pick Up Where You Left Off" section

### StudentDashboard.tsx - Remove Sidebar Items

```text
Remove from sidebarLinks:
  { icon: Heart, label: "Wishlist", id: "wishlist" }
  { icon: FileText, label: "Quiz Attempts", id: "quiz-attempts" }

Remove from renderContent switch:
  case "wishlist": return <Wishlist />;
  case "quiz-attempts": return <QuizAttempts />;

Remove imports:
  import Wishlist from "@/components/dashboard/Wishlist";
  import QuizAttempts from "@/components/dashboard/QuizAttempts";
```

### CourseDetails.tsx - Remove Wishlist Button

Remove the Wishlist button from the course sidebar, keeping only the Share button (which can take full width).

