

# Fix Course Display, Category Matching, and Hero Background

## Problem Analysis

After investigating the database and code, I found these root causes:

### Issue 1: Grey Background on Hero Load
The hero section uses a video background (`hero-video.webm`). Before the video loads, the background is just the default grey/transparent. The fix is to add a dark background color (`bg-[#1a1a2e]` or similar dark color matching the video) so even before the video loads, the hero looks correct. This also applies to any other sections with delayed rendering.

### Issue 2 and 3: Courses Not Showing (ROOT CAUSE FOUND)
The **category names in the database don't match the filter categories** in the frontend code:

| DB Category | Frontend Filter |
|---|---|
| "Design" | "Graphics Design" |
| "Video" | "Video Editing" |
| "Marketing" | "Digital Marketing" |
| "SEO" | "SEO" (matches) |
| "Development" | "Website Development" |
| "Business" | "Dropshipping" |

So when the user selects "SEO" in the filter, it looks for courses where `category === "SEO"`, but the SEO course ("Google Adsense Loading Courses") has `is_public: false` in the database. Other categories simply don't match at all.

Additionally, the **level comparison is case-sensitive**: the filter uses lowercase ("beginner", "intermediate", "advanced") but the DB has mixed case ("Beginner", "Intermediate").

### Fix Strategy

**Option A**: Update filter categories to match DB values
**Option B**: Make filters dynamic -- fetch distinct categories from DB

I'll go with **Option B** (dynamic) plus fix the case-sensitivity, as it's more robust and future-proof.

---

## Changes

### File: `src/components/home/HeroSection.tsx`
- Add `bg-[#1a1a2e]` (dark navy) to the section element so the background is dark immediately while the video loads

### File: `src/pages/Courses.tsx`
- **Remove hardcoded `filterCategories` array**
- Fetch distinct categories dynamically from the courses data after loading
- Fix level comparison to be **case-insensitive** (`c.level.toLowerCase()`)
- Also update `CategorySection` filterValues to match actual DB categories

### File: `src/components/home/CategorySection.tsx`
- Update the `filterValue` in each category to match the actual DB values:
  - "Graphics Design" -> "Design"
  - "Video Editing" -> "Video"
  - "Digital Marketing" -> "Marketing"
  - "Website Development" -> "Development"
  - "Dropshipping" -> "Business"
  - "SEO" stays "SEO"

### File: `src/components/home/HeroSection.tsx` (search bar categories)
- Update the category dropdown values to match DB values (same mapping as above)

### File: `src/components/home/PopularCourses.tsx`
- Add the same DB category values to the `spotlightColors` map so spotlight effects work with real categories

---

## Technical Details

### Dynamic Category Filter (Courses.tsx)
```text
Before: const filterCategories = ["Graphics Design", "Video Editing", ...] (hardcoded, mismatched)
After:  Extract unique categories from fetched courses data dynamically
```

### Case-Insensitive Level Matching
```text
Before: selectedLevels.includes(c.level)
After:  selectedLevels.includes(c.level.toLowerCase())
```

### Category Mapping for CategorySection and Hero Search
```text
filterValue: "Design" (was "Graphics Design")
filterValue: "Video" (was "Video Editing")
filterValue: "Marketing" (was "Digital Marketing")
filterValue: "Development" (was "Website Development")
filterValue: "Business" (was "Dropshipping")
filterValue: "SEO" (unchanged)
```

### Hero Background Fix
```text
Before: <section className="relative overflow-hidden min-h-screen flex flex-col">
After:  <section className="relative overflow-hidden min-h-screen flex flex-col bg-[#1a1a2e]">
```

### SpotlightColors Update (PopularCourses)
```text
Add entries for "Design", "Video", "Marketing", "Development", "Business"
alongside existing entries (keep both for backward compatibility)
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/HeroSection.tsx` | Add dark bg color; update category dropdown values |
| `src/components/home/CategorySection.tsx` | Update filterValue to match DB categories |
| `src/pages/Courses.tsx` | Dynamic categories from DB; case-insensitive level filter |
| `src/components/home/PopularCourses.tsx` | Add DB category values to spotlightColors map |

