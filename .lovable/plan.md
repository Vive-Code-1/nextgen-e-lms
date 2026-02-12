

# Hero Section Redesign - Search Bar, New Image, and Glass Counter Cards

## Summary
Redesign the hero section with a new banner image, colored headline text, a search bar with category dropdown replacing the CTA button, and 4 glass-effect counter cards overlapping the hero bottom.

---

## Changes

### 1. Hero Banner Image Replacement
- Copy the uploaded `Hero_Banner_Image.webp` to `src/assets/hero-banner.webp`
- Replace the Unsplash placeholder in `HeroSection.tsx` with an import of this local image
- Remove the `rounded-2xl shadow-2xl` styling since this image has a transparent/styled background

### 2. Headline Text Color Update
- The current headline is "Unlock Your Potential with Expert-Led Courses"
- Split the headline so that **"Potential with"** renders in `#FF4667` (coral-pink) while the rest stays white
- Update the Bengali headline similarly for the equivalent words
- Add `coral-pink` (`#FF4667`) as a custom color in `tailwind.config.ts`

### 3. Replace "Explore Courses" Button with Search Bar
- Remove the existing CTA button (`<Button asChild>` linking to `/courses`)
- Add a search bar component matching the reference design:
  - A rounded-full container with white background
  - Search icon (magnifying glass) on the left
  - Text input with placeholder "Search School, Online educational centers, etc"
  - A "Category" dropdown (using a Select or native dropdown) on the right side within the bar
  - A circular button with `#FF4667` background containing a right-arrow icon
- The search bar will be purely visual for now (no backend search functionality)

### 4. Hero Content Width to 80% Viewport
- Change the hero container from the default `container mx-auto` to `max-w-[80vw] mx-auto` so the content area spans 80% of the viewport width

### 5. Glass-Effect Counter Cards (Replacing Stats Section)
- Redesign the `StatsSection` to render 4 cards in a horizontal row that visually overlaps the bottom of the hero section
- Each card has:
  - A colored icon in a soft-tinted circle (matching the reference: pink, purple, blue, light-blue tints)
  - Bold counter number with "K" suffix
  - Label text below
- Cards use glassmorphism: `bg-white/70 backdrop-blur-md shadow-lg border border-white/30 rounded-2xl`
- Content:
  - 10K - Online Courses (with a courses/book icon)
  - 200K - Expert Tutors (with a people/tutor icon)
  - 6K - Certified Courses (with a certificate/award icon)
  - 60K - Online Students (with a graduation cap icon)
- Position the cards to overlap the hero: use negative margin-top (`-mt-16`) or absolute positioning within the hero section
- Update the `useCountUp` hook values accordingly (10000 -> "10K", etc.) or use static "K" formatting

---

## Files to Modify

### `tailwind.config.ts`
- Add `"coral-pink": "#FF4667"` to the custom colors

### `src/components/home/HeroSection.tsx` (Major rewrite)
- Import the new hero banner image from `src/assets/`
- Split headline into segments with colored span for "Potential with"
- Remove the CTA button
- Add the search bar with category dropdown and arrow button
- Adjust container width to 80vw
- Add a sub-tagline: "Trusted by over 15K Users worldwide since 2022" with rating display (optional)

### `src/components/home/StatsSection.tsx` (Major rewrite)
- Change from 3 vertical stat items to 4 horizontal glass cards
- Update values: 10K Online Courses, 200K Expert Tutors, 6K Certified Courses, 60K Online Students
- Apply glassmorphism styling
- Use negative margin to overlap the hero section

### `src/lib/translations.ts`
- Update hero headline to split format: e.g., `"hero.headline_1"`, `"hero.headline_highlight"`, `"hero.headline_2"`
- Update stats labels to match the new content
- Add search placeholder and category text translations

### `src/assets/hero-banner.webp` (New file)
- Copy from user upload

---

## Technical Notes

- The search bar is cosmetic initially -- it can be wired to actual search later when courses are in the database
- The counter cards will use the existing `useCountUp` hook but with updated target values (10, 200, 6, 60) and a "K" suffix
- The glass effect cards need `relative z-10` on the stats container and the hero section needs `relative` with appropriate padding-bottom to accommodate the overlap
- The hero background changes from Deep Indigo to a lighter/gradient background (white to soft pink gradient) to match the reference design's light aesthetic
- The `#FF4667` color is used for the arrow button background and the highlighted headline text

