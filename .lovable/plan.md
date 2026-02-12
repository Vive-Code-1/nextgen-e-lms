

# Hero Stats Overlap, Bengali Font, and Category Carousel Section

## Summary
Three changes: (1) Move the stats cards to visually sit inside/overlap the hero section so they appear as part of the header with no white background gap, (2) Add Google Sans font for Bengali text, (3) Add a new auto-scrolling category carousel section before Popular Courses with 6 specific categories, and update the hero search bar's category dropdown to show the same 6 categories.

---

## Changes

### 1. Stats Cards Inside Hero (No White Background Gap)

**Problem:** The stats cards currently sit in their own `StatsSection` with a light background visible between the hero and the cards. The user wants the cards to overlap directly onto the hero's dark indigo background, with no white/light gap beneath them.

**Solution:**
- In `HeroSection.tsx`: increase bottom padding (`pb-32` or more) so the hero extends further down
- In `StatsSection.tsx`: remove any background styling and use a larger negative margin-top (`-mt-24`) so the cards sit fully within the hero's indigo zone. Remove `pb-8` so there's no extra padding below the cards
- The cards' glassmorphism (`bg-white/70 backdrop-blur-md`) will contrast beautifully against the dark hero background

### 2. Google Sans for Bengali Text

**Solution:**
- Add Google Sans (Product Sans alternative: "Google Sans" isn't publicly available via Google Fonts, so we'll use **"Noto Sans Bengali"** which is Google's recommended Bengali font) to `index.html`
- Alternatively, if the user specifically wants "Google Sans" style, we can use **"Hind Siliguri"** which is a clean Google Font for Bengali
- Update `src/index.css` body font-family to include the Bengali font as a fallback: `font-family: 'Inter', 'Hind Siliguri', sans-serif`
- This way Bengali characters automatically render in Hind Siliguri while English stays in Inter

### 3. Category Carousel Section (New Component)

**New file:** `src/components/home/CategorySection.tsx`

- Place between `StatsSection` and `PopularCourses` in `Index.tsx`
- Section header: "Browse Categories" / "ক্যাটাগরি ব্রাউজ করুন"
- 6 category cards in an auto-scrolling carousel using `embla-carousel-react` (already installed):
  1. Graphics Design / গ্রাফিক্স ডিজাইন
  2. Video Editing / ভিডিও এডিটিং
  3. Digital Marketing / ডিজিটাল মার্কেটিং
  4. SEO / এসইও
  5. Website Development / ওয়েবসাইট ডেভেলপমেন্ট
  6. Dropshipping / ড্রপশিপিং
- Each card: icon + category name, with hover effect
- Auto-scroll using embla's autoplay plugin or a `setInterval`-based scroll

### 4. Update Hero Category Dropdown

- Replace the hardcoded "Development, Data Science, Design, Mobile" options with the 6 actual categories
- Both EN and BN translations

---

## Files to Modify

### `index.html`
- Add Hind Siliguri font from Google Fonts CDN

### `src/index.css`
- Update body font-family to include `'Hind Siliguri'` as fallback for Bengali

### `src/components/home/HeroSection.tsx`
- Increase bottom padding to `pb-32` so hero extends behind stats cards
- Replace category dropdown items with the 6 actual categories (Graphics Design, Video Editing, Digital Marketing, SEO, Website Development, Dropshipping)

### `src/components/home/StatsSection.tsx`
- Increase negative margin-top to `-mt-24`
- Remove `pb-8` bottom padding
- Remove any background that creates a white gap

### `src/components/home/CategorySection.tsx` (New)
- Auto-scrolling carousel with 6 category cards
- Uses embla-carousel-react with autoplay via setInterval
- Each card has an icon (from Lucide), category name, and hover lift effect
- Light background section styling

### `src/pages/Index.tsx`
- Import and add `CategorySection` between `StatsSection` and `PopularCourses`

### `src/lib/translations.ts`
- Add translation keys for:
  - `"categories.title"` / `"categories.subtitle"`
  - All 6 category names in EN and BN
  - Update category dropdown labels

---

## Technical Notes

- Embla carousel autoplay: will use a `useEffect` with `setInterval` calling `api.scrollNext()` every 3 seconds, since the autoplay plugin isn't installed separately
- The carousel will loop infinitely with `loop: true` option
- Category cards will show 3-4 at a time on desktop, 2 on tablet, 1 on mobile using embla's `slidesToScroll` and CSS basis classes
- The stats section overlap is purely a CSS margin/padding adjustment -- no structural changes needed

