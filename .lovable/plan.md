

# Hero Stats Compact, Bigger Image, Trending Courses, Featured Instructors, Trusted By Section

## Summary
Six changes: (1) Make stats cards more compact to fit within the marked area below the search bar, (2) Enlarge the right-side hero banner image, (3) Update PopularCourses to show dummy courses from all 6 categories, (4) Add new sections from reference images (Master the Skills, etc.), (5) Add Featured Instructor carousel section, (6) Add "Trusted By 500+ Leading Universities And Companies" auto-scrolling marquee section using the uploaded SVG logos.

---

## Changes

### 1. Compact Stats Cards

**File:** `src/components/home/StatsSection.tsx`

- Reduce icon size from `h-6 w-6` to `h-5 w-5`, icon container padding from `p-3` to `p-2`
- Reduce card padding from `p-5` to `p-3`
- Reduce number font size from `text-2xl md:text-3xl` to `text-xl md:text-2xl`
- Reduce label text from `text-sm` to `text-xs`
- Reduce gap from `gap-4` to `gap-3`
- This ensures all 4 cards fit neatly within the search bar width area

### 2. Bigger Hero Banner Image

**File:** `src/components/home/HeroSection.tsx`

- Change image from `w-3/4 max-w-sm` to `w-full max-w-lg` to make the banner image larger on the right side

### 3. Trending Courses from All 6 Categories

**File:** `src/components/home/PopularCourses.tsx`

- Rename section title to "Trending Courses"
- Replace the 4-course array with 6 courses -- one per category: Graphics Design, Video Editing, Digital Marketing, SEO, Website Development, Dropshipping
- Each course gets a category badge matching the 6 categories defined in CategorySection
- Use Unsplash images for thumbnails
- Change grid to `lg:grid-cols-3` (2 rows x 3 columns) to fit 6 courses
- Change section background from `gradient-section` to a light background (white/light gray) so cards are readable without white-on-dark issues
- Add translation keys for new course titles and category labels

### 4. New Sections from Reference Images

Based on the uploaded reference image (image-17.png), add these new sections to the home page:

**New File:** `src/components/home/MasterSkills.tsx`
- "Master the Skills to Drive Your Career" section
- Image on left, text on right with description and a CTA button
- Light background section

**New File:** `src/components/home/ShareKnowledge.tsx`  
- "Want to Share Your Knowledge? Join as Instructor" section
- CTA banner at the bottom before footer with a gradient background
- Button to become an instructor

**File:** `src/pages/Index.tsx`
- Add MasterSkills after PopularCourses
- Add FeaturedInstructors after MasterSkills
- Add TrustedBy after FeaturedInstructors
- Add ShareKnowledge before Footer

### 5. Featured Instructor Carousel

**New File:** `src/components/home/FeaturedInstructors.tsx`

- Section title: "Featured Instructor" with subtitle
- Carousel using embla-carousel-react (already installed)
- Each instructor card shows: gray background photo area, course count badge (e.g., "15 Courses"), verified badge (green checkmark), heart icon, name, role, student count
- 4 visible cards at a time on desktop, with dot navigation below
- Dummy data: 6-8 instructors with Unsplash portrait photos
- Cards have white background, rounded corners, subtle shadow

### 6. Trusted By - Auto Infinite Scroll Marquee

**New File:** `src/components/home/TrustedBy.tsx`

- Section title: "500+ Leading Universities And Companies"
- Copy the 6 uploaded SVG files (22.svg through 27.svg) to `src/assets/logos/`
- CSS-only infinite horizontal scroll marquee animation
- Logos duplicated to create seamless loop
- Uses `@keyframes marquee` with `translateX(0)` to `translateX(-50%)` animation
- Light background section

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/home/StatsSection.tsx` | Compact sizing (icons, text, padding) |
| `src/components/home/HeroSection.tsx` | Enlarge banner image |
| `src/components/home/PopularCourses.tsx` | 6 courses from all categories, rename to Trending, light bg |
| `src/components/home/MasterSkills.tsx` | NEW - Skills CTA section |
| `src/components/home/FeaturedInstructors.tsx` | NEW - Instructor carousel with embla |
| `src/components/home/TrustedBy.tsx` | NEW - Logo marquee with uploaded SVGs |
| `src/components/home/ShareKnowledge.tsx` | NEW - Join as instructor CTA |
| `src/pages/Index.tsx` | Add new sections in order |
| `src/lib/translations.ts` | Add translation keys for new sections |
| `src/assets/logos/` | Copy 6 SVG logo files |

### Home Page Section Order
1. Navbar
2. HeroSection (full viewport with video, search bar, compact stats)
3. CategorySection (6-card grid)
4. PopularCourses (renamed "Trending Courses", 6 courses)
5. MasterSkills ("Master the Skills...")
6. FeaturedInstructors (carousel)
7. TrustedBy (marquee logos)
8. WhyChooseUs
9. ShareKnowledge (Join as instructor CTA)
10. Footer

### Marquee Animation (CSS)
```text
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```
Logos are rendered twice side-by-side in a flex container; the container animates continuously leftward, creating an infinite scroll effect.

### Featured Instructor Data
- 6 instructors with Unsplash portrait images
- Fields: name, role, courses count, students count, verified boolean
- Carousel shows 4 at a time on desktop, 2 on tablet, 1 on mobile

