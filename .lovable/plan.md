

# Advanced Course Builder - Multi-Step Wizard (Tutor LMS Pro Style)

Replace the current simple dialog-based course form with a full multi-step wizard matching the Tutor LMS Pro screenshots.

---

## Database Changes (SQL Migration)

Add new columns to the `courses` table and create a `course_faqs` table:

### New columns on `courses`

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `level` | text | 'beginner' | Beginner, Intermediate, Advanced |
| `language` | text | 'Bengali' | Course language |
| `max_students` | integer | 0 | 0 = unlimited |
| `is_public` | boolean | true | Public or Private |
| `short_description` | text | null | Brief summary |
| `what_will_learn` | jsonb | '[]' | Array of learning outcomes |
| `requirements` | jsonb | '[]' | Array of requirement strings |
| `is_featured` | boolean | false | Featured course flag |
| `video_url` | text | null | Intro/overview video (YouTube, Vimeo, mp4) |
| `is_free` | boolean | false | Free course toggle |
| `has_discount` | boolean | false | Discount toggle |
| `discount_price` | numeric | null | Discounted price |
| `expiry_period` | text | 'lifetime' | lifetime or limited |
| `expiry_months` | integer | null | Number of months if limited |

### New table: `course_faqs`

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid PK | Primary key |
| `course_id` | uuid FK courses | Parent course |
| `question` | text | FAQ question |
| `answer` | text | FAQ answer |
| `is_enabled` | boolean | Show/hide toggle |
| `sort_order` | integer | Display order |
| `created_at` | timestamptz | Creation time |

RLS: Admins can CRUD, public can read where `is_enabled = true`.

### New storage bucket: `course-thumbnails`
Public bucket for course thumbnail image uploads (JPEG, PNG, GIF, WebP, up to 2MB).

---

## UI: Multi-Step Course Builder

Replace the current tabbed dialog with a **5-step wizard** inside a full-width dialog:

### Step Progress Bar
A horizontal stepper at the top showing:
1. Course Information (numbered circle, green check when done)
2. Course Media
3. Curriculum
4. Additional Information (FAQs)
5. Pricing

Connected by lines, current step highlighted, completed steps show green checkmarks -- matching the reference screenshots.

### Step 1: Course Information
- **Course Title** (required, text input)
- **Course Category** (required, dropdown: Graphics Design, Video Editing, Digital Marketing, SEO, Website Development, Dropshipping)
- **Course Level** (required, dropdown: Beginner, Intermediate, Advanced)
- **Language** (required, dropdown: Bengali, English, Hindi)
- **Max Number of Students** (number input, 0 = unlimited)
- **Public / Private Course** (dropdown: Public, Private)
- **Short Description** (required, textarea)
- **Course Description** (textarea, uses existing `description` field)
- **What will students learn?** (dynamic list with "Add New Item" button and per-item delete)
- **Requirements** (dynamic list with "Add New Item" button and per-item delete)
- **Check this for featured course** (toggle switch)
- **Next** button

### Step 2: Course Media
- Intro text: "Intro Course overview provider type. (.mp4, YouTube, Vimeo etc.)"
- **Course Thumbnail** (file upload to `course-thumbnails` bucket, accepts JPEG/PNG/GIF/WebP up to 2MB, with preview)
- **Course Video** (text input for external URL -- YouTube, Vimeo link)
- **Prev** and **Next** buttons

### Step 3: Curriculum
- Works only for editing (course must be saved first)
- **Add New Topic** button (topics are groups -- stored as lessons with a `topic_name` field, or we use the existing lessons table with a `topic` text column added)
- Topics displayed as collapsible accordion sections
- Inside each topic: "Add Lesson" button, lesson rows with edit/delete icons
- Lessons managed inline (title, video URL, notes)
- **Prev** and **Next** buttons

Since topics are a grouping concept, we add a `topic` text column to the `lessons` table. Lessons with the same `topic` value are grouped together.

### Step 4: Additional Information (FAQs)
- **Add New** button
- List of FAQs as collapsible items (question as header)
- Each FAQ: Question (text), Answer (textarea), Enable/Disable toggle
- Edit and delete per FAQ
- **Prev** and **Next** buttons

### Step 5: Pricing
- **Check if this is a free course** (checkbox -- if checked, price fields disabled and course becomes free)
- **Course Price (Tk)** (number input)
- **Check if this course has discount** (checkbox)
- **Discount Price (Tk)** (number input, shows "This course has X% Discount" calculated text)
- **Expiry Period** (radio: Lifetime / Limited Time)
- **Number of months** (if Limited Time selected)
- Note: "After purchase, students can access the course until your selected time."
- **Prev** and **Submit Course** button

### Free Course Logic
- When `is_free = true`, the course price is treated as 0
- Free courses can be enrolled without payment (frontend enrollment button directly creates enrollment)
- Paid courses go through existing checkout flow

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/admin/CourseWizard.tsx` | The multi-step wizard component (~400 lines) |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/AdminCourseManager.tsx` | Replace dialog content with `CourseWizard`, pass course data and callbacks |
| `src/integrations/supabase/types.ts` | Auto-updated after migration |
| SQL Migration | Add columns to `courses`, `topic` to `lessons`, create `course_faqs` table, create `course-thumbnails` bucket |

---

## Technical Details

### Slug Auto-Generation
When the user types the title, auto-generate the slug (kebab-case) unless manually edited.

### Dynamic Lists (What will learn / Requirements)
```text
State: string[]
"Add New Item" -> push empty string
Each item: text input + delete button
On save: stored as JSONB array in courses table
```

### Thumbnail Upload Flow
```text
1. User selects file (validated: JPEG/PNG/GIF/WebP, max 2MB)
2. Upload to Supabase Storage bucket "course-thumbnails"
3. Get public URL
4. Store URL in courses.image_url
5. Show preview in the form
```

### Step Validation
- Step 1: Title and Category required before Next
- Step 2: No required fields (optional media)
- Step 3: No validation (curriculum optional)
- Step 4: No validation (FAQs optional)
- Step 5: If not free, price required

### Course Save Flow
- New course: Save on "Submit Course" at Step 5 (inserts into `courses`)
- After first save, curriculum (Step 3) and FAQs (Step 4) become functional since they need `course_id`
- Edit mode: Course already exists, all steps functional immediately

