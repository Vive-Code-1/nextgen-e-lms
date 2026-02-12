

# Hero Video Background and Floating Glass Navbar

## Summary
Two changes: (1) Replace the hero section's solid `#1E1B4B` background color with the uploaded video as a full-cover background video, and (2) Redesign the navbar to a floating, rounded pill-shape with a translucent glass effect matching the reference image.

---

## Changes

### 1. Hero Section: Video Background Instead of Solid Color

**Current state:** The hero section uses `bg-indigo-dark` (solid `#1E1B4B`) as background. The video is placed as a separate `HeroVideo` component below the stats cards.

**New approach:**
- Remove the `HeroVideo` component from `Index.tsx` (it will no longer be a standalone section)
- In `HeroSection.tsx`, replace `bg-indigo-dark` with a full-cover background video using the existing `hero-video.webm` asset
- The video will be positioned absolutely behind the hero content using `absolute inset-0 w-full h-full object-cover` with a dark overlay (`bg-black/50`) to keep text readable
- Hero text, search bar, and banner image remain on top of the video via `relative z-10`

### 2. Navbar: Floating Glass Pill Design

**Reference:** The uploaded image shows a floating navbar with rounded-full shape, translucent purple/violet glass effect, centered on the page with margin from edges.

**New approach:**
- Change the outer `<header>` from `sticky top-0` full-width to a floating container with padding from top and sides
- The inner navbar bar gets: `rounded-full`, translucent violet glass effect (`bg-white/10 backdrop-blur-xl border border-white/20`), max-width constraint, and auto margins
- Logo and nav link text colors become white/white-70 since the navbar floats over the dark video hero
- Login/Register buttons adapt to light-on-dark styling
- On scroll or on non-hero pages, the glass effect remains readable

---

## Files to Modify

### `src/components/Navbar.tsx`
- Restructure: outer `<header>` becomes `fixed top-0 left-0 right-0 z-50 px-4 pt-4`
- Inner container: `max-w-[80vw] mx-auto rounded-full bg-white/10 backdrop-blur-xl border border-white/20 px-6`
- Text colors: logo, nav links, and buttons switch to white/white-70 for contrast against the dark/video background
- Mobile menu stays the same (Sheet overlay)

### `src/components/home/HeroSection.tsx`
- Remove `bg-indigo-dark` from section
- Add background video element: `<video>` with `absolute inset-0 w-full h-full object-cover` playing the `hero-video.webm`
- Add dark overlay div: `absolute inset-0 bg-black/50` for text readability
- Wrap existing content in `relative z-10`
- Add top padding to account for the floating navbar (`pt-24` or similar)
- Import `heroVideo` from assets

### `src/pages/Index.tsx`
- Remove `HeroVideo` import and usage from the page layout (video is now the hero background)

### `src/index.css`
- Update `.glass` utility or add a new `.glass-nav` utility for the floating navbar: `bg-white/10 backdrop-blur-xl border border-white/20 rounded-full`

---

## Technical Notes

- The video background uses `autoPlay loop muted playsInline` for silent auto-playing across all browsers
- The dark overlay ensures white text remains readable regardless of video content
- The floating navbar needs extra top padding on the hero section content to avoid overlap
- The `HeroVideo.tsx` component file can be kept or deleted -- it will just be unused after removing from Index.tsx

