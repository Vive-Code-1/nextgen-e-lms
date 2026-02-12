

# ChromaGrid Effect যোগ করা - Courses Grid ও Instructors Section

## কি করা হবে

ReactBits এর ChromaGrid কম্পোনেন্ট তোমার সাইটের ৩টি জায়গায় যোগ করা হবে। এটি একটি interactive spotlight effect -- মাউস যেখানে যাবে সেখানে কার্ডগুলো রঙিন দেখাবে, বাকিগুলো grayscale/dimmed থাকবে।

## যেখানে যোগ হবে

1. **Homepage Trending Courses** (`PopularCourses.tsx`) - 8টি কোর্স কার্ড
2. **All Courses Page** (`Courses.tsx`) - ফিল্টার সহ কোর্স গ্রিড
3. **Featured Instructors** (`FeaturedInstructors.tsx`) - ইন্সট্রাক্টর কার্ড

## কালার থিম

তোমার সাইটের ব্র্যান্ড কালার ব্যবহার করা হবে:
- **Vivid Violet (#7C3AED)** - Primary cards
- **Golden Amber (#FBBF24)** - CTA/accent cards  
- **Emerald Green (#10B981)** - Success/verified cards
- **Coral Pink (#FF4667)** - Highlight cards
- **Deep Indigo (#1E1B4B)** - Dark gradient base

প্রতিটি কার্ডের gradient ও border color ভিন্ন হবে যাতে বৈচিত্র্য থাকে।

---

## Technical Details

### Step 1: Create `ChromaGrid` Component

**New file: `src/components/ui/ChromaGrid.tsx`**

ReactBits এর ChromaGrid component adapt করা হবে:
- GSAP (already installed) ব্যবহার করে spotlight tracking
- `--x`, `--y` CSS variables দিয়ে mouse position track
- Radial gradient mask দিয়ে grayscale/brightness dimming
- Card-level spotlight (hover glow) effect
- Props: `items`, `radius`, `damping`, `fadeOut`, `className`
- `ChromaItem` interface: `image`, `title`, `subtitle`, `borderColor`, `gradient`, `url` etc.
- Children render prop pattern যোগ করা হবে যাতে existing card designs রাখা যায়

### Step 2: Create `ChromaGridWrapper` Component

**New file: `src/components/ui/ChromaGridWrapper.tsx`**

একটি wrapper component যা existing card components কে ChromaGrid এর spotlight effect দেবে কিন্তু card design পরিবর্তন না করে:
- শুধু grayscale/brightness overlay layers যোগ করবে
- Existing grid layout ও card components অক্ষুণ্ণ থাকবে
- Mouse tracking logic ChromaGrid থেকে নেওয়া

### Step 3: Update `PopularCourses.tsx`

- Course card grid কে `ChromaGridWrapper` দিয়ে wrap করা
- প্রতিটি course card এর জন্য brand-themed gradient assign:
  - Graphics Design -> Violet gradient
  - Video Editing -> Coral Pink gradient  
  - Digital Marketing -> Amber gradient
  - SEO -> Emerald gradient
  - Web Dev -> Indigo gradient
  - Dropshipping -> Violet/Pink mixed

### Step 4: Update `Courses.tsx`

- All Courses page এর grid section এ ChromaGridWrapper যোগ
- Filter sidebar অপরিবর্তিত থাকবে
- শুধু course card grid area তে spotlight effect

### Step 5: Update `FeaturedInstructors.tsx`

- Carousel এর পরিবর্তে ChromaGrid ব্যবহার (carousel এর ভেতরে spotlight effect ভালো কাজ করে না)
- Instructor cards গুলো ChromaGrid items হিসেবে render হবে
- প্রতিটি instructor এর জন্য আলাদা gradient color

### Files Summary

| File | Action |
|------|--------|
| `src/components/ui/ChromaGrid.tsx` | Create - Core ChromaGrid component |
| `src/components/ui/ChromaGridWrapper.tsx` | Create - Wrapper for existing grids |
| `src/components/home/PopularCourses.tsx` | Modify - Add ChromaGridWrapper |
| `src/pages/Courses.tsx` | Modify - Add ChromaGridWrapper |
| `src/components/home/FeaturedInstructors.tsx` | Modify - Replace carousel with ChromaGrid |

No new dependencies needed (GSAP already installed).

