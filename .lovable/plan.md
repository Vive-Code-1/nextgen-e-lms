

# Fix SEO Course, Add Dummy Courses, and Align Category Display

## Problem Analysis

After checking the database:

1. **SEO course not showing**: The "Google Adsense Loading Courses" has `is_public: false` in the database. It needs to be set to `true` to appear on the site.

2. **Trending Courses area empty / Dummy courses**: The user wants 6 dummy courses inserted into the database alongside their 2 real courses (total 8 in the Trending section). These can be deleted later from the admin panel.

3. **Category names mismatch**: The Courses page sidebar dynamically shows raw DB category names (Design, Video, Marketing, etc.), but Browse Categories on homepage shows friendly names (Graphics Design, Video Editing, Digital Marketing, etc.). The sidebar should display the same friendly category names.

---

## Changes

### 1. Database: Set SEO course to public

Run a SQL migration to update:
```text
UPDATE courses SET is_public = true WHERE id = '6af9e862-...' (the SEO course)
```

### 2. Database: Insert 6 dummy courses

Insert 6 dummy courses with different categories, proper images (using placeholder), `is_public: true`, and realistic titles. Categories will cover: Design, Video, Marketing, SEO, Development, Business -- to fill the grid.

### 3. Category Display Name Mapping (Courses.tsx)

Add a mapping object to translate DB category values to user-friendly display names:

```text
DB Value -> Display Name
"Design" -> "Graphics Design"
"Video" -> "Video Editing"  
"Marketing" -> "Digital Marketing"
"SEO" -> "SEO"
"Development" -> "Website Development"
"Business" -> "Dropshipping"
"Website Development" -> "Website Development"
```

Use this mapping in the sidebar filter labels so they match Browse Categories, while still filtering by the actual DB value.

---

## Files to Modify

| File | Changes |
|------|---------|
| Supabase migration | Set SEO course `is_public = true`; insert 6 dummy courses |
| `src/pages/Courses.tsx` | Add `categoryDisplayNames` mapping for sidebar filter labels |

## Technical Details

### Category Display Name Mapping (Courses.tsx)

```text
const categoryDisplayNames: Record<string, string> = {
  "Design": "Graphics Design",
  "Video": "Video Editing",
  "Marketing": "Digital Marketing",
  "SEO": "SEO",
  "Development": "Website Development",
  "Website Development": "Website Development",
  "Business": "Dropshipping",
};

// In sidebar filter:
<span>{categoryDisplayNames[cat] || cat}</span>
```

### Dummy Courses (6 entries)

Each dummy course will have:
- Unique slug
- A category from the 6 available
- `is_public: true`
- `is_free: false` with sample pricing
- Beginner/Intermediate level
- Placeholder image URL (`/placeholder.svg`)
- Realistic course titles (e.g., "UI/UX Design Fundamentals", "YouTube Content Creation Masterclass", etc.)

