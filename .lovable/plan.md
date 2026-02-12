

# Fix Navbar Visibility on Auth Page + Grant Admin Role

## 1. Grant Admin Role to aabeg01@gmail.com

The user `aabeg01@gmail.com` (ID: `b1a438bf-8a83-4954-b195-cc9dec52e735`) needs an `admin` role inserted into the `user_roles` table.

**Action:** Run a database migration to insert the admin role for this user.

```text
INSERT INTO public.user_roles (user_id, role)
VALUES ('b1a438bf-8a83-4954-b195-cc9dec52e735', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## 2. Fix Navbar Visibility on Non-Hero Pages

**Problem:** The navbar uses a transparent background with white text when not scrolled (`bg-white/10`, `text-white`). This works on the homepage which has a dark hero banner, but on pages like `/auth`, `/courses`, `/dashboard`, etc., the background is light -- making the white navbar text invisible (as shown in the screenshot).

**Solution:** Determine whether the current page has a dark hero. Only the homepage (`/`) uses a dark hero background. On all other routes, the navbar should always use the solid style (white background, dark text) -- equivalent to the "scrolled" appearance.

**File:** `src/components/Navbar.tsx`

- Add a variable: `const hasDarkHero = location.pathname === "/"`
- Change the navbar background logic: use the transparent/white-text style only when `hasDarkHero && !isScrolled`; otherwise always use the solid white background style
- This affects:
  - The navbar container background class
  - Logo text color
  - Nav link text colors
  - Language button text color
  - Auth button text colors
  - Mobile menu button color
  - The divider line color

All conditional classes like `isScrolled ? "text-foreground" : "text-white"` become `(isScrolled || !hasDarkHero) ? "text-foreground" : "text-white"`, ensuring dark text on light-background pages.

No changes to the auth page background color are needed -- the navbar fix alone resolves the visibility issue.

