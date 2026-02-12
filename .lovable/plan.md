

# Complete LMS Feature Build: Course Details, Checkout, Dashboards, and Bug Fixes

## Summary
This plan covers 6 major changes: (1) Fix Bengali text breaking in ScrollFloat, (2) Fix currency signs on Courses page, (3) Course Details page, (4) Checkout page with payment integration, (5) Student Dashboard, (6) Admin Dashboard. All backed by Supabase authentication and database tables.

---

## 1. Fix Bengali Text Breaking in ScrollFloat

**Problem:** ScrollFloat splits text by individual characters (`text.split('')`), which breaks Bengali conjunct characters (যুক্তাক্ষর) -- rendering garbled text like "আপনার জ্ঞা়ন শে়য়া়র" instead of proper Bengali.

**Solution:** Use the `Intl.Segmenter` API to split by grapheme clusters instead of raw characters. This correctly handles Bengali conjuncts and compound characters.

**File:** `src/components/ui/ScrollFloat.tsx`
- Replace `text.split('')` with `new Intl.Segmenter('bn', { granularity: 'grapheme' })` to properly segment Bengali text
- Fallback to `Array.from(text)` for browsers without Segmenter support (still better than `.split('')` for multi-byte characters)

---

## 2. Fix Currency Signs on Courses Page

**Problem:** Courses page always shows `৳` (BDT) regardless of language. Should show `$` in EN mode and `৳` in BN mode.

**File:** `src/pages/Courses.tsx`
- Access `language` from `useLanguage()` hook
- Create a currency helper: `const currency = language === 'en' ? '$' : '৳'`
- Replace all hardcoded `৳` with `{currency}` in price displays
- Also update `filterPrices` array to use language-dependent currency labels

**File:** `src/components/home/PopularCourses.tsx`
- Same currency logic for the Trending Courses section prices

---

## 3. Courses Page Header Fix

**Problem:** Header says "Course Grid" -- should say "All Courses" with proper breadcrumb.

**File:** `src/pages/Courses.tsx`
- Change translation key from `coursepage.page_title` ("Course Grid") to show "All Courses" / "সকল কোর্স"
- Update breadcrumb text accordingly

**File:** `src/lib/translations.ts`
- Update `coursepage.page_title` to "All Courses" (EN) / "সকল কোর্স" (BN)

---

## 4. Course Details Page

**New file:** `src/pages/CourseDetails.tsx`

Based on the reference image (image-21), the page includes:

- **Header banner** with gradient background, course title, breadcrumb
- **Course info card** at top: thumbnail image, title, subtitle, lesson count, duration, students enrolled, category badge, instructor avatar + name, star rating
- **Main content area** (left 2/3):
  - Large course preview image/video area
  - Overview section: Course Description, What You'll Learn (bullet list), Requirements
  - Course Content: Accordion with chapters, each containing lectures with duration and Preview links
  - About the Instructor: photo, name, role, stats (courses, lessons, duration, students), bio, skills list
  - Post a Comment form (name, email, subject, comments, submit button)
- **Sidebar** (right 1/3):
  - Price display (with strikethrough original price and discount badge)
  - Add to Wishlist and Share buttons
  - **Enroll Now** button (links to checkout page)
  - "Includes" list: on-demand video hours, downloadable resources, lifetime access, mobile access, assignments, certificate
  - "Course Features" list: enrolled students, duration, chapters, video hours, level

**Data:** Dummy course data array with slugs matching existing course titles. Each course has detailed content (chapters, lectures, descriptions, requirements, instructor info).

**Route:** `/courses/:slug`

**File:** `src/App.tsx` -- Add route for CourseDetails

**Linking:**
- `src/pages/Courses.tsx` -- "View Course" button links to `/courses/:slug`
- `src/components/home/PopularCourses.tsx` -- "Enroll Now" button links to `/courses/:slug`

---

## 5. Supabase Database Schema

Create tables for users, courses, enrollments, and orders.

**Migration SQL:**

```text
-- Profiles table (auto-created on signup)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table (for admin access)
CREATE TYPE public.app_role AS ENUM ('admin', 'student', 'instructor');
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  original_price NUMERIC DEFAULT 0,
  category TEXT,
  instructor_name TEXT,
  duration TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'BDT',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Enrollments table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, course_id)
);
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admin manage courses" ON public.courses FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users read own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin read all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users read own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own enrollments" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 6. Authentication (Login/Register)

**New file:** `src/pages/Auth.tsx`
- Login and Register tabs
- Email + password authentication using Supabase Auth
- Register form: Full Name, Email, Password
- Login form: Email, Password
- Redirect to student dashboard after login

**File:** `src/App.tsx` -- Add `/auth` route
**File:** `src/components/Navbar.tsx` -- Link Login/Register buttons to `/auth`

---

## 7. Checkout Page

**New file:** `src/pages/Checkout.tsx`

- Shows course summary (title, image, price)
- If not logged in: shows inline registration form (name, email, password) -- creates account on submit
- If logged in: shows user info
- Payment method selection: UddoktaPay, Stripe, PayPal (radio buttons with logos)
- "Pay Now" button
- On successful payment: creates order record, creates enrollment, redirects to student dashboard

**Payment Edge Functions:**

**New file:** `supabase/functions/process-payment/index.ts`
- Accepts: course_id, payment_method, amount, user_id
- For UddoktaPay: calls UddoktaPay API to create payment session, returns redirect URL
- For Stripe: creates Stripe checkout session, returns URL
- For PayPal: creates PayPal order, returns approval URL

**New file:** `supabase/functions/payment-callback/index.ts`
- Webhook/callback handler for payment confirmations
- Updates order status to 'completed'
- Creates enrollment record

**Secrets needed:**
- `UDDOKTAPAY_API_KEY` -- UddoktaPay API key
- `STRIPE_SECRET_KEY` -- Stripe secret key (will use Stripe integration tool)
- `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` -- PayPal credentials

**File:** `src/App.tsx` -- Add `/checkout/:slug` route

---

## 8. Student Dashboard

**New file:** `src/pages/StudentDashboard.tsx`

Based on the reference image (image-22), includes:

- **Sidebar navigation:** Dashboard, Announcements, My Courses, Tools, Promotions, Assignments, Free Gifts, Reviews, Subscriptions, Profile
- **Main area:**
  - Welcome message with user name
  - Stats cards: Total Courses, Running Courses, Completed Courses, Completed Lessons
  - Red banner: "Course Support" section with video link
  - Quick Links grid: My Courses, Assignments, Promotions, Free Gifts, Profile, Reviews
  - FAQ section with common questions

**Protected route** -- redirects to `/auth` if not logged in.

**File:** `src/App.tsx` -- Add `/dashboard` route

---

## 9. Admin Dashboard

**New file:** `src/pages/AdminDashboard.tsx`

- **Sidebar:** Dashboard, Courses, Users, Orders, Settings
- **Main area:**
  - Stats overview: Total Courses, Total Students, Total Revenue, Pending Orders
  - Recent Orders table
  - Course Management: list, add, edit, delete courses
  - User Management: view users, assign roles

**Protected route** -- only accessible to users with `admin` role (checked via `has_role` function).

**File:** `src/App.tsx` -- Add `/admin` route

---

## 10. Auth Context Updates

**New file:** `src/contexts/AuthContext.tsx`
- Wraps app with auth state management
- Provides: `user`, `session`, `isAdmin`, `isLoading`, `signOut`
- Uses `onAuthStateChange` listener + `getSession`
- Checks user role from `user_roles` table

**File:** `src/App.tsx` -- Wrap with `AuthProvider`, add protected route logic

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/ui/ScrollFloat.tsx` | Fix Bengali character splitting |
| `src/pages/Courses.tsx` | Currency fix, link to course details |
| `src/components/home/PopularCourses.tsx` | Currency fix, link to course details |
| `src/lib/translations.ts` | Update page titles, add new keys |
| `src/pages/CourseDetails.tsx` | NEW -- Full course detail page |
| `src/pages/Auth.tsx` | NEW -- Login/Register page |
| `src/pages/Checkout.tsx` | NEW -- Checkout with payment options |
| `src/pages/StudentDashboard.tsx` | NEW -- Student dashboard |
| `src/pages/AdminDashboard.tsx` | NEW -- Admin dashboard |
| `src/contexts/AuthContext.tsx` | NEW -- Auth state management |
| `src/App.tsx` | Add routes, wrap with AuthProvider |
| `src/components/Navbar.tsx` | Link login/register, show user state |
| `supabase/functions/process-payment/index.ts` | NEW -- Payment processing |
| `supabase/functions/payment-callback/index.ts` | NEW -- Payment webhooks |
| `supabase/config.toml` | Add edge function configs |
| Database migration | Create tables, RLS, triggers |

### Implementation Order
1. Fix Bengali text + currency bugs (immediate UX fixes)
2. Database migration (tables, RLS, triggers)
3. Auth context + Auth page
4. Course Details page
5. Checkout page (UI first)
6. Edge functions for payments (after secrets are configured)
7. Student Dashboard
8. Admin Dashboard
9. Wire up Navbar with auth state

### Secrets Required (will be requested during implementation)
- UddoktaPay API Key
- Stripe Secret Key (via Stripe integration tool)
- PayPal Client ID + Secret

