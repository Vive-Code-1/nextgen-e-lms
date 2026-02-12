

# NextGen LMS - Premium Homepage Implementation Plan

## Overview
Build a modern, bilingual (EN/BN) LMS homepage inspired by the DreamsLMS reference but with a cleaner 2025 aesthetic using Deep Navy + Electric Teal color palette, glassmorphism navbar, and smooth CSS animations.

---

## Phase 1: Foundation Setup

### 1.1 Design System (index.css + tailwind.config.ts)
- Update CSS variables to match the new palette:
  - Primary: Deep Navy (#0F172A -> HSL 222.2 84% 4.9% -- already close, minor tweaks)
  - Accent/Ring: Electric Teal (#0EA5E9 -> HSL 199 89% 48%)
- Import 'Inter' font from Google Fonts in `index.html`
- Add custom keyframes for fade-in-up, counter, and card-hover animations in Tailwind config
- Add glassmorphism utility classes

### 1.2 Language Context
- Create `src/contexts/LanguageContext.tsx` with React Context
- Store current language (`en` | `bn`) and toggle function
- Create `src/lib/translations.ts` with all static text in both English and Bengali

---

## Phase 2: Navigation Bar

### 2.1 Navbar Component (`src/components/Navbar.tsx`)
- Sticky top navbar with glassmorphism (backdrop-blur + semi-transparent bg)
- **Left:** Logo with GraduationCap icon + "NextGen LMS" text
- **Center:** Nav links (Home, Courses, About Us, Contact Us) using React Router Links
- **Right:** Language toggle (EN/BN dropdown), Login (ghost button), Register (teal solid button), separated by vertical divider
- Mobile: Hamburger menu using Sheet component from shadcn/ui
- Wrap App in LanguageProvider

---

## Phase 3: Homepage Sections

### 3.1 Hero Section (`src/components/home/HeroSection.tsx`)
- Split layout: text left (60%), image right (40%)
- Headline and subheadline with bilingual support
- "Explore Courses" CTA button with ArrowRight icon
- Right side: placeholder illustration from Unsplash
- CSS fade-in-up animation on load

### 3.2 Stats Section (`src/components/home/StatsSection.tsx`)
- Strip with 3 metrics: Active Students (500+), Total Courses (120+), Expert Instructors (50+)
- Counter animation using a custom hook (`useCountUp`) with IntersectionObserver
- Teal accent on numbers, subtle background differentiation

### 3.3 Popular Courses Grid (`src/components/home/PopularCourses.tsx`)
- Section header with bilingual title
- 4 dummy course cards in a responsive grid (1/2/4 columns)
- **Card anatomy:** Image placeholder, Category badge, Title, Star rating, Price, "Enroll" button
- Hover: translateY(-8px) + deeper shadow transition

### 3.4 Why Choose Us (`src/components/home/WhyChooseUs.tsx`)
- 3 feature cards with icons (Award for Certificates, Headphones for Support, Users for Mentors)
- Clean grid layout with bilingual text

### 3.5 Footer (`src/components/Footer.tsx`)
- Dark navy background (#0F172A)
- 4 columns: Brand info, Quick Links, Support links, Newsletter signup
- Bottom bar with copyright
- Bilingual content support

---

## Phase 4: Routing & Pages

### 4.1 Update App.tsx
- Wrap with LanguageProvider
- Add routes: `/`, `/courses`, `/about`, `/contact`
- Create placeholder pages for Courses, About, Contact

---

## File Structure

```text
src/
  contexts/
    LanguageContext.tsx
  lib/
    translations.ts
  components/
    Navbar.tsx
    Footer.tsx
    home/
      HeroSection.tsx
      StatsSection.tsx
      PopularCourses.tsx
      WhyChooseUs.tsx
  pages/
    Index.tsx (rebuilt as homepage)
    Courses.tsx (placeholder)
    About.tsx (placeholder)
    Contact.tsx (placeholder)
```

---

## Technical Details

- **No GSAP**: GSAP is not available as a dependency. All animations will use CSS animations + Tailwind keyframes + IntersectionObserver for scroll-triggered reveals. The visual result will be equivalent.
- **Font**: Inter loaded via Google Fonts CDN in `index.html`
- **Images**: Unsplash placeholder URLs for hero and course card images
- **Responsive**: Mobile-first with Tailwind breakpoints; navbar collapses to hamburger via shadcn Sheet
- **Language toggle**: Simple React Context, no i18n library needed for static content
- **Colors**: Updated CSS variables + new `teal` accent color in Tailwind config

