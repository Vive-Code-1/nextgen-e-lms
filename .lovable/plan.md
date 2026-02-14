

# Footer Layout, Section Reorder, ShinyText, and BlurText Effects

## 1. Footer: Mobile Support Section Side-by-Side

Currently the footer uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`. On mobile (below `sm`), all 4 sections stack vertically. The user wants Quick Links and Support to sit side-by-side on mobile.

**File: `src/components/Footer.tsx`**
- Wrap Quick Links and Support in a single grid cell on mobile using a nested `grid grid-cols-2` layout
- This makes them appear side-by-side even on small screens, reducing footer height

**Change**: Replace the current flat 4-column grid with a structure where Brand is full-width, Quick Links + Support share a row, and Newsletter is full-width on mobile.

## 2. Reorder: WhyChooseUs Above TrustedBy

**File: `src/pages/Index.tsx`**

Swap the order of `<WhyChooseUs />` and `<TrustedBy />`:

```
Before: ... TestimonialCarousel -> TrustedBy -> WhyChooseUs -> ShareKnowledge
After:  ... TestimonialCarousel -> WhyChooseUs -> TrustedBy -> ShareKnowledge
```

## 3. ShinyText Effect on "Potential with"

The user provided a ShinyText component that uses `motion/react` (framer-motion). This package is **not currently installed** and needs to be added.

**New dependency**: `motion` (the modern framer-motion package, importable as `motion/react`)

**New files**:
- `src/components/ui/ShinyText.tsx` -- the ShinyText component (converted from user's code)
- `src/components/ui/ShinyText.css` -- minimal CSS (`.shiny-text { display: inline-block; }`)

**File: `src/components/home/HeroSection.tsx`**
- Import ShinyText
- Change the hero headline so that only "Potential with" (from `hero.headline_highlight`) uses ShinyText with the specified props (speed=2, color="#b5b5b5", shineColor="#7F3AEE", spread=120, direction="left")
- The rest of the headline remains as plain text

Note: For Bengali translation, the highlight text is different ("দক্ষতা বৃদ্ধি"), so ShinyText will apply to whatever the translation returns for `hero.headline_highlight`.

## 4. Replace ScrollFloat with BlurText on 6 Section Titles

Replace the current `ScrollFloat` animation on these 6 section titles with the user-provided `BlurText` component:

1. **Browse Categories** (`src/components/home/CategorySection.tsx`) -- line 24
2. **Trending Courses** (`src/components/home/PopularCourses.tsx`) -- line 106
3. **Featured Instructors** (`src/components/home/FeaturedInstructors.tsx`) -- line 109
4. **What Our Students Say** (`src/components/home/TestimonialCarousel.tsx`) -- line 70
5. **Why Choose Us** (`src/components/home/WhyChooseUs.tsx`) -- line 41
6. **Frequently Asked Questions** (`src/components/home/ShareKnowledge.tsx`) -- line 49

**New file**: `src/components/ui/BlurText.tsx` -- the BlurText component (converted from user's code)

**In each of the 6 files**:
- Replace `ScrollFloat` import with `BlurText` import
- Replace `<ScrollFloat textClassName="...">Title Text</ScrollFloat>` with `<BlurText text={t("key")} delay={200} animateBy="words" direction="top" className="..." />`
- BlurText renders as a `<p>` tag, so adjust the wrapping `<h2>` accordingly

## Technical Details

### New Dependency
- `motion` (framer-motion v11+, exports from `motion/react`)

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/ui/ShinyText.tsx` | Shiny text animation component |
| `src/components/ui/ShinyText.css` | ShinyText styles |
| `src/components/ui/BlurText.tsx` | Blur reveal text animation component |

### Files to Modify
| File | Change |
|------|--------|
| `src/components/Footer.tsx` | Mobile grid layout for Quick Links + Support side-by-side |
| `src/pages/Index.tsx` | Swap WhyChooseUs and TrustedBy order |
| `src/components/home/HeroSection.tsx` | Add ShinyText to "Potential with" |
| `src/components/home/CategorySection.tsx` | ScrollFloat to BlurText |
| `src/components/home/PopularCourses.tsx` | ScrollFloat to BlurText |
| `src/components/home/FeaturedInstructors.tsx` | ScrollFloat to BlurText |
| `src/components/home/TestimonialCarousel.tsx` | ScrollFloat to BlurText |
| `src/components/home/WhyChooseUs.tsx` | ScrollFloat to BlurText |
| `src/components/home/ShareKnowledge.tsx` | ScrollFloat to BlurText |

