

# Lesson Player Redesign, YouTube Fix, and Announcements Upgrade

## Issue 1: Lesson Player - Progress Bar and Curriculum Sections

Redesign `LessonPlayer.tsx` to match the reference (image-66):

- **Top section**: Show course title, completion percentage with a progress bar, and "Last activity" date
- **Sidebar**: Group lessons by `topic` field as collapsible accordion sections (Section 1: "Html Introduction", Section 2: "Your First Webpage", etc.)
  - Each section is expandable/collapsible
  - Lessons inside show completion icon (green circle = done, empty circle = not done) and duration if available
  - Clicking a lesson opens it in the video player
- **Progress calculation**: `completedLessons / totalLessons * 100` -- updates dynamically when "Mark Complete" is clicked
- **Also update the `enrollments.progress` field** in Supabase when marking complete, so progress persists

## Issue 2: Curriculum Grouped by Topic

Lessons have a `topic` field in the DB. Group lessons by topic in the sidebar:
- Query returns lessons ordered by `sort_order`
- Group them by `topic` into sections
- Each section is a collapsible accordion panel
- The active lesson's section auto-expands

## Issue 3: YouTube Video Not Playing + Download Protection

**Root Cause**: The `video_url` stored in DB is a regular YouTube URL like `https://youtu.be/k6IAmFU8HOE?si=...` or `https://www.youtube.com/watch?v=LHIHpx5C9yo`. The iframe `src` needs the embed format: `https://www.youtube.com/embed/VIDEO_ID`.

**Fix**: Add a `getEmbedUrl(url)` helper function that:
- Extracts the video ID from `youtu.be/ID`, `youtube.com/watch?v=ID`, or already-embedded URLs
- Returns `https://www.youtube.com/embed/VIDEO_ID?rel=0&modestbranding=1`

**Download Protection**: Add `controlsList="nodownload"` and prevent right-click context menu on the video container. For YouTube embeds specifically, the embed URL will not show download options by default.

## Issue 4: Student Announcements - Beautiful Card Grid Design

Redesign `Announcements.tsx` to match the reference (image-69):

- **Header**: Icon + "Announcements" title + subtitle text
- **Pinned/Latest announcement**: Highlighted card at the top (larger, with a "New" badge and days ago indicator)
- **All announcements grid**: 3-column responsive card grid below
- Each card shows:
  - Announcement icon (orange/red circle)
  - Number badge (#1, #2, etc.)
  - Title in bold
  - Content preview (truncated with "..." and "Read More" link)
  - Date at bottom
  - Left border accent color
- Clicking "Read More" expands the full content in a dialog or inline

## Issue 5: Admin Announcements - Edit and Delete

Update `AdminAnnouncements.tsx`:
- Add an **Edit** button (pencil icon) alongside the existing Delete button
- Clicking Edit populates the title/content form with the announcement's data
- Track `editingId` state to switch between "Post" and "Update" modes
- On save in edit mode, use `supabase.from("announcements").update(...)` instead of insert

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/LessonPlayer.tsx` | Full redesign: progress bar, topic-grouped accordion sidebar, YouTube embed fix, download protection |
| `src/components/dashboard/Announcements.tsx` | Redesign to beautiful card grid with pinned announcement, numbering, read more |
| `src/components/admin/AdminAnnouncements.tsx` | Add edit functionality with editingId state |

## Technical Details

### YouTube Embed URL Converter
```text
Input: https://youtu.be/k6IAmFU8HOE?si=xyz
       https://www.youtube.com/watch?v=LHIHpx5C9yo
       https://youtube.com/embed/k6IAmFU8HOE
Output: https://www.youtube.com/embed/k6IAmFU8HOE?rel=0&modestbranding=1
```

### Progress Calculation
```text
progress = Math.round((completedCount / totalLessons) * 100)
Update enrollments.progress via supabase after each toggle
```

### Lesson Grouping Logic
```text
lessons grouped by topic field:
  topic "Html Introduction" -> [lesson1, lesson2, lesson3]
  topic "Your First Webpage" -> [lesson4, lesson5]
  null/empty topic -> "General" fallback
```

