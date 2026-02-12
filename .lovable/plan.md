

# 7 Changes: Hero Layout, Category Dropdown, Scroll Navbar, About/Contact/Courses Pages, Category Grid

## Summary
Seven changes across the site: (1) shrink hero banner image and ensure stats cards remain visible within hero area, (2) fix category dropdown in search bar, (3) navbar background changes to white on scroll, (4) full About Us page based on DreamsLMS reference, (5) full Contact Us page, (6) full Courses page with grid + filters, (7) replace category carousel with a simple 6-card grid.

---

## 1. Hero Banner Image Smaller + Stats Cards Inside Hero

**File:** `src/components/home/HeroSection.tsx`, `src/components/home/StatsSection.tsx`, `src/pages/Index.tsx`

- Reduce the hero banner image size (e.g., `max-w-sm` or `w-3/4` instead of `w-full`)
- Move the `StatsSection` component INSIDE the `HeroSection` so the stats cards render within the hero's video background area (before the closing `</section>`)
- Remove `StatsSection` from `Index.tsx` as a separate component
- The stats cards will sit at the bottom of the hero, still with their glassmorphism effect, fully within the dark video background

## 2. Fix Category Dropdown in Search Bar

**File:** `src/components/home/HeroSection.tsx`

The category dropdown code exists but it's clipped by `overflow-hidden` on the search bar container. Fix:
- Remove `overflow-hidden` from the search bar's white container
- Use `overflow-visible` or restructure so the dropdown can appear outside the search bar bounds
- The dropdown itself is already implemented with the 6 categories

## 3. Navbar Background Changes on Scroll

**File:** `src/components/Navbar.tsx`

- Add a scroll listener using `useState` + `useEffect` to detect when user scrolls past the hero section
- When scrolled past ~100px: change navbar background from `bg-white/10 backdrop-blur-xl border-white/20` to `bg-white shadow-md border-gray-200`
- Change text colors from white to dark (`text-foreground`) when on white background
- This ensures readability on both hero (dark) and content (light) sections

## 4. About Us Page (DreamsLMS-inspired)

**File:** `src/pages/About.tsx`

Full page rebuild with sections from the reference:
- Page header banner: "About Us" with breadcrumb (Home > About Us) on gradient background
- About section: image on left, "Empowering Learning, Inspiring Growth" text on right with "Learn from anywhere" and "Expert Mentors" features
- Skills section: "Master the Skills to Drive your Career" with 3 cards (Flexible Learning, Lifetime Access, Expert Instruction)
- Stats counter section (reuse existing stats data)
- Instructors section: 3 instructor cards with avatar, name, role, quote, star rating
- FAQ accordion section with 5 questions

## 5. Contact Us Page (DreamsLMS-inspired)

**File:** `src/pages/Contact.tsx`

Full page rebuild:
- Page header banner: "Contact Us" with breadcrumb on gradient background
- 3 info cards: Address, Phone, Email
- Two-column section: left side "Get in touch with us today" text, right side contact form (Name, Email, Phone, Subject, Message, Send Enquiry button)

## 6. Courses Page (DreamsLMS-inspired Grid)

**File:** `src/pages/Courses.tsx`

Full page rebuild:
- Page header banner: "Course Grid" with breadcrumb
- Left sidebar with filter accordion panels: Categories, Instructors, Price, Level, Reviews (using checkboxes)
- Right content area: grid of 9 course cards (3 columns x 3 rows)
- Each course card: image, instructor avatar + name, category badge, title, rating + reviews, price, "View Course" button
- Sorting options: Newly Published, Trending, Top Rated, Free
- Pagination at bottom
- Use placeholder/Unsplash images for course thumbnails

## 7. Category Section: Grid Instead of Carousel

**File:** `src/components/home/CategorySection.tsx`

- Remove embla-carousel dependency and autoplay logic
- Replace with a simple CSS grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`
- Keep the same 6 category cards with icons and hover effects
- Much simpler code

---

## Files to Modify/Create

| File | Action |
|------|--------|
| `src/components/home/HeroSection.tsx` | Shrink banner image, embed StatsSection, fix category dropdown overflow |
| `src/components/home/StatsSection.tsx` | Minor adjustments for embedding inside hero |
| `src/pages/Index.tsx` | Remove standalone StatsSection import |
| `src/components/Navbar.tsx` | Add scroll-based background color toggle |
| `src/pages/About.tsx` | Full rebuild with DreamsLMS-inspired sections |
| `src/pages/Contact.tsx` | Full rebuild with contact form and info cards |
| `src/pages/Courses.tsx` | Full rebuild with course grid, filters, pagination |
| `src/components/home/CategorySection.tsx` | Replace carousel with simple grid |
| `src/lib/translations.ts` | Add translation keys for new page content |

---

## Technical Notes

- Scroll detection for navbar: `window.addEventListener('scroll', ...)` with a threshold of ~80px, using `useState(false)` for `isScrolled`
- Category dropdown fix: the parent div with `rounded-full overflow-hidden` clips the absolutely-positioned dropdown. Solution is to move the dropdown portal outside the overflow container or remove `overflow-hidden`
- Course grid page uses static data (no database) with hardcoded course objects similar to the existing `PopularCourses` component
- FAQ accordion on About page will use the existing `@radix-ui/react-accordion` component
- Contact form is frontend-only (no backend submission)
- All new translation keys will be added for both EN and BN

