

# Fix Reviews Name Bug and Make Courses Dynamic

## Issue 1: Review Names All Change to Same Name

**Root Cause**: When admin adds a review via "Add New Review", line 140-144 updates `profiles.full_name` for `user.id` (the admin's own profile). Since all admin-created reviews use `user_id = admin's ID`, every review shows the admin's profile name -- changing one changes all.

**Fix**: Add `student_name` and `student_image` columns to the `reviews` table. Store per-review name/image there instead of modifying the `profiles` table. Display these fields in the review cards and testimonial carousel.

### Database Migration

```text
ALTER TABLE reviews ADD COLUMN student_name text;
ALTER TABLE reviews ADD COLUMN student_image text;
```

### Changes to AdminReviews.tsx
- On "Add New Review": save `student_name` and `student_image` directly into the `reviews` row instead of updating `profiles`
- On "Edit Review": update the review's own `student_name`/`student_image` columns
- Display: show `r.student_name` first, fall back to `r.profile?.full_name`
- Same for avatar: show `r.student_image` first, fall back to `r.profile?.avatar_url`

### Changes to TestimonialCarousel.tsx
- When mapping dynamic reviews, use `r.student_name || profile.full_name` and `r.student_image || profile.avatar_url`

---

## Issue 2: Courses Not Showing on Frontend

**Root Cause**: Both `PopularCourses.tsx` (homepage) and `Courses.tsx` (courses page) use entirely **hardcoded static arrays**. The `CourseDetails.tsx` page also uses a hardcoded `courseData` object. None of them fetch from the `courses` table in Supabase.

### Changes to PopularCourses.tsx (Homepage)
- Remove the hardcoded `courses` array
- Fetch courses from Supabase: `supabase.from("courses").select("*").eq("is_public", true).order("created_at", { ascending: false }).limit(8)`
- Render course cards dynamically with real data (title, image_url, price, category, slug, is_free)
- Link each card to `/courses/{slug}`

### Changes to Courses.tsx (Courses Page)
- Remove the hardcoded `courses` array and `courseImages`
- Fetch all public courses from Supabase on mount
- Apply category/search filters on the fetched data
- Render course cards with real DB fields (title, image_url, price, original_price, category, level, slug, instructor_name, duration, is_free)
- Category sidebar filters work against the DB `category` field
- Search filters against `title`

### Changes to CourseDetails.tsx (Course Detail Page)
- Remove all hardcoded `courseData`, `extraCourses`, `allCourses`
- Fetch course by slug: `supabase.from("courses").select("*").eq("slug", slug).single()`
- Fetch lessons grouped by topic for curriculum section
- Fetch course FAQs for FAQ section
- Fetch approved reviews for the reviews count
- Render all sections dynamically (description, what_will_learn, requirements, curriculum, FAQs, pricing)
- Handle free courses (show "Free" instead of price, "Enroll Free" button)

---

## Files to Modify

| File | Changes |
|------|---------|
| SQL Migration | Add `student_name` and `student_image` columns to `reviews` |
| `src/integrations/supabase/types.ts` | Update types for new review columns |
| `src/components/admin/AdminReviews.tsx` | Store name/image per review, not on profile |
| `src/components/home/TestimonialCarousel.tsx` | Use `student_name`/`student_image` fields |
| `src/components/home/PopularCourses.tsx` | Fetch courses from Supabase dynamically |
| `src/pages/Courses.tsx` | Fetch courses from Supabase, dynamic filtering |
| `src/pages/CourseDetails.tsx` | Fetch single course + lessons + FAQs + reviews from Supabase |

---

## Technical Notes

### Review Display Priority
```text
Name: review.student_name > profile.full_name > "Student"
Image: review.student_image > profile.avatar_url > initials fallback
```

### Course Card Data Mapping
```text
DB field -> UI element
title -> Card title
image_url -> Card image (fallback to placeholder)
category -> Category badge
price / discount_price -> Price display
is_free -> "Free" badge
slug -> Link to /courses/{slug}
instructor_name -> Instructor name
duration -> Duration label
level -> Level label
```

### Free Course Handling
- If `is_free = true`: show "Free" instead of price
- Course details page: show "Enroll Free" button that creates enrollment directly
- Courses page: "Free" filter option works against `is_free` column

