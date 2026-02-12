

# Add ScrollFloat and ScrollReveal Text Animations (from React Bits)

## Summary
Install GSAP and create two reusable animation components (`ScrollFloat` and `ScrollReveal`) from the React Bits library. Then apply them to specific section headings and subtitle/description texts across the homepage.

---

## Step 1: Install GSAP dependency

Install `gsap` package -- required by both ScrollFloat and ScrollReveal components.

## Step 2: Create ScrollFloat component

**New file:** `src/components/ui/ScrollFloat.tsx`

A component that splits text into individual characters and animates them with a floating-in effect on scroll using GSAP ScrollTrigger. Based on the React Bits source code with TypeScript + Tailwind variant.

Props: `children` (string), `containerClassName`, `textClassName`, `animationDuration`, `ease`, `scrollStart`, `scrollEnd`, `stagger`

## Step 3: Create ScrollReveal component

**New file:** `src/components/ui/ScrollReveal.tsx`

A component that splits text into words and reveals them with opacity + blur animation on scroll using GSAP ScrollTrigger. Based on the React Bits source code with TypeScript + Tailwind variant.

Props: `children` (string), `containerClassName`, `textClassName`, `enableBlur`, `baseOpacity`, `baseRotation`, `blurStrength`, `rotationEnd`, `wordAnimationEnd`

## Step 4: Apply ScrollFloat to section headings

Wrap these section title texts with the `ScrollFloat` component (replacing the plain `<h2>` text content):

| Component | Text (translation key) |
|-----------|----------------------|
| `CategorySection.tsx` | "Browse Categories" (`categories.title`) |
| `PopularCourses.tsx` | "Trending Courses" (`courses.title`) |
| `FeaturedInstructors.tsx` | "Featured Instructor" (`instructors.title`) |
| `WhyChooseUs.tsx` | "Why Choose Us" (`why.title`) |
| `ShareKnowledge.tsx` | "Want to Share Your Knowledge? Join as Instructor" (`share.title`) |

Each heading `<h2>` will keep its existing className styling but render its text content through `<ScrollFloat>` instead of plain text.

## Step 5: Apply ScrollReveal to subtitle/description texts

Wrap these description/subtitle texts with the `ScrollReveal` component:

| Component | Text (translation key) |
|-----------|----------------------|
| `HeroSection.tsx` | Hero subheadline (`hero.subheadline`) |
| `CategorySection.tsx` | Category subtitle (`categories.subtitle`) |
| `PopularCourses.tsx` | Courses subtitle (`courses.subtitle`) |
| `WhyChooseUs.tsx` | Why subtitle (`why.subtitle`) |
| `FeaturedInstructors.tsx` | Instructors subtitle (`instructors.subtitle`) |
| `MasterSkills.tsx` | Master description (`master.desc`) |
| `ShareKnowledge.tsx` | Share description (`share.desc`) |

Each `<p>` element's text content will be rendered through `<ScrollReveal>` with appropriate styling overrides (font size, color) via the `textClassName` and `containerClassName` props.

---

## Technical Details

### Files to Create

| File | Description |
|------|-------------|
| `src/components/ui/ScrollFloat.tsx` | GSAP-powered character-level float animation on scroll |
| `src/components/ui/ScrollReveal.tsx` | GSAP-powered word-level reveal animation with blur on scroll |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/home/CategorySection.tsx` | ScrollFloat on title, ScrollReveal on subtitle |
| `src/components/home/PopularCourses.tsx` | ScrollFloat on title, ScrollReveal on subtitle |
| `src/components/home/FeaturedInstructors.tsx` | ScrollFloat on title, ScrollReveal on subtitle |
| `src/components/home/WhyChooseUs.tsx` | ScrollFloat on title, ScrollReveal on subtitle |
| `src/components/home/ShareKnowledge.tsx` | ScrollFloat on title, ScrollReveal on description |
| `src/components/home/HeroSection.tsx` | ScrollReveal on subheadline |
| `src/components/home/MasterSkills.tsx` | ScrollReveal on description |

### Component Adaptations
- The original ScrollFloat renders an `<h2>` wrapper -- we will make the wrapper element configurable or use it inside existing `<h2>` tags by rendering as `<span>` instead to avoid nested headings
- The original ScrollReveal renders an `<h2>` wrapper -- similarly adapted to render as `<div>` or `<span>` to work inside `<p>` elements
- Font sizes will be controlled via `textClassName` to match existing design (not using the default `clamp(1.6rem,4vw,3rem)`)
- The ShareKnowledge section has white text on gradient background -- `textClassName` will include `text-white` for proper contrast
- ScrollReveal's `baseRotation` will be set to `0` for subtitle texts to avoid unwanted rotation on small paragraphs

