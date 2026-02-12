

# Design System Overhaul: Vibrant EdTech Palette

## Summary
Replace the current Deep Navy + Electric Teal palette with a vibrant, youthful EdTech color scheme featuring Vivid Violet, Golden Amber CTAs, and Emerald Green accents. Update button shapes to pill-style and add gradient backgrounds.

---

## New Color Mapping

| Role | Old | New | HSL (approx) |
|------|-----|-----|---------------|
| Primary (titles, key UI) | Deep Navy #0F172A | Vivid Violet #7C3AED | 263 84% 58% |
| Primary Foreground | White | White | 0 0% 100% |
| Background | Near-white #FDFDFE | Light Violet tint #F5F3FF | 250 100% 98% |
| Accent (buttons, CTAs) | Electric Teal #0EA5E9 | Golden Amber #FBBF24 | 45 97% 56% |
| Accent Foreground | White | Black #000 | 0 0% 0% |
| Hero/Footer bg (used via classes) | Deep Navy #0F172A | Deep Indigo #1E1B4B | 244 47% 20% |
| Success/Stats icons | Teal | Emerald Green #10B981 | 160 84% 39% |

---

## Files to Change

### 1. `src/index.css` -- CSS Variables
- Update `:root` variables: `--primary` to Violet HSL, `--accent` to Amber HSL, `--background` to light violet, `--ring` to violet
- Update `.dark` variables accordingly
- Update `.glass` utility for violet-tinted glassmorphism
- Add a `.gradient-section` utility class for Violet-to-Indigo gradient backgrounds

### 2. `tailwind.config.ts` -- Extended Colors
- Add custom colors: `violet-brand`, `amber-cta`, `emerald-accent`, `indigo-dark` for direct use in components
- No structural changes needed

### 3. `src/components/ui/button.tsx` -- Pill Shape
- Change the base `rounded-md` to `rounded-full` in the `buttonVariants` cva definition
- Also update the `sm` and `lg` size variants from `rounded-md` to `rounded-full`

### 4. `src/components/Navbar.tsx`
- Register button: change from `bg-accent` to the amber CTA color (it will inherit from the new accent variable automatically)
- Glassmorphism stays, colors update via CSS variables

### 5. `src/components/home/HeroSection.tsx`
- Wrap hero in Deep Indigo background (`bg-[#1E1B4B]`) with white text
- Update headline and subheadline text to white
- CTA button already uses `bg-accent` which will now be Golden Amber with black text

### 6. `src/components/home/StatsSection.tsx`
- Change stat icon backgrounds to Emerald Green tint (`bg-emerald-500/10`)
- Change stat icon color to Emerald Green (`text-emerald-500`)
- Number color stays accent (now Amber) or switch to Violet for variety

### 7. `src/components/home/PopularCourses.tsx`
- Add gradient background (Violet to Indigo) to the section
- Update section title to white text (since on gradient bg)
- Badge and price accent colors update automatically via CSS variables
- "Enroll" button picks up new amber accent automatically

### 8. `src/components/home/WhyChooseUs.tsx`
- Section background stays light; icon accents update via CSS variables automatically

### 9. `src/components/Footer.tsx`
- Change footer background from `bg-primary` to `bg-[#1E1B4B]` (Deep Indigo)
- Accent links change from teal to amber automatically

### 10. Placeholder pages (`Courses.tsx`, `About.tsx`, `Contact.tsx`)
- Icon colors update automatically via `text-accent` variable change

---

## Technical Notes

- Most color changes propagate automatically through CSS custom properties -- only components with hardcoded color classes (like `bg-primary`, specific hex values) need manual updates
- The gradient section for Popular Courses will use `bg-gradient-to-br from-[#7C3AED] to-[#1E1B4B]`
- Button pill shape is a single-line change in the CVA base class
- The Emerald Green color is used explicitly (not via CSS variable) since it serves a distinct "success/stats" role separate from the primary accent

