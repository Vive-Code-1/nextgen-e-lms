

# Fix UddoktaPay Payment Flow + Course Enrollment

## Problems Identified

1. **UddoktaPay opens inside the Lovable preview iframe** -- `window.location.href` navigates the iframe itself, and `digitaltechdude.paymently.io` blocks being loaded in iframes (X-Frame-Options). Fix: use `window.open(url, '_blank')` to open payment in a new browser tab.

2. **Orders have no `course_id`** -- The `process-payment` edge function creates orders without setting `course_id` because the `courses` table in the database is **empty**. The course data only exists as a hardcoded object in the frontend. This means the `payment-callback` can never create enrollments (it checks `order.course_id`).

3. **Existing users re-entering credentials** -- If a user is already logged in (`user` exists), the checkout should skip account creation entirely and just proceed to payment. If not logged in but account exists, the current silent sign-in fallback works but needs to also handle the case where the password is wrong (existing account, different password).

4. **COD admin approval flow** -- COD orders are created as "pending" but there's no admin UI to approve them and trigger enrollment.

## Solution

### 1. Populate the `courses` table with matching data

Insert all 8 courses from the hardcoded `coursePrices` object into the `courses` table with matching slugs, so that `course_id` can be resolved.

### 2. Fix `process-payment` edge function

- Look up the course by `course_slug` from the `courses` table to get the `course_id`
- Set `course_id` on the order record
- This enables the callback to create enrollments after payment verification

### 3. Fix UddoktaPay redirect -- open in new tab

In `src/pages/Checkout.tsx`, change:
```text
window.location.href = data.redirect_url;
```
to:
```text
window.open(data.redirect_url, '_blank');
navigate("/thank-you", { state: { ... } });
```
This opens UddoktaPay in a new browser tab and shows the thank-you page in the current tab.

### 4. Handle existing users properly

- If the user is already logged in, skip account creation entirely and go straight to payment
- If not logged in and signup fails with "already registered", try sign-in
- If sign-in fails (wrong password), show: "এই ইমেইল দিয়ে আগে একাউন্ট আছে, সঠিক পাসওয়ার্ড দিন"

### 5. Auto-enrollment on UddoktaPay verification

The `payment-callback` function already handles this correctly -- it verifies payment, updates order status to "completed", and creates enrollment using `order.course_id` and `order.user_id`. The fix is just ensuring `course_id` is set on the order (step 2).

### 6. Admin order approval for COD

Add an "Approve" button in the Admin Dashboard orders section. When clicked, it updates the order's `payment_status` to "completed" and creates the enrollment.

---

## Technical Details

### Database Migration

Insert courses into the `courses` table:

```text
INSERT INTO public.courses (slug, title, price, original_price, image_url, category, duration, instructor_name) VALUES
('complete-graphics-design-masterclass', 'Complete Graphics Design Masterclass', 49.99, 99.99, 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=250&fit=crop', 'Design', '40 hours', 'Expert Instructor'),
('professional-video-editing-with-premiere-pro', 'Professional Video Editing with Premiere Pro', 44.99, 89.99, 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=250&fit=crop', 'Video', '35 hours', 'Expert Instructor'),
('digital-marketing-social-media-strategy', 'Digital Marketing & Social Media Strategy', 59.99, 119.99, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop', 'Marketing', '45 hours', 'Expert Instructor'),
('seo-mastery-rank-1-on-google', 'SEO Mastery: Rank #1 on Google', 39.99, 79.99, 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=400&h=250&fit=crop', 'Marketing', '30 hours', 'Expert Instructor'),
('full-stack-web-development-bootcamp', 'Full-Stack Web Development Bootcamp', 54.99, 109.99, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop', 'Development', '60 hours', 'Expert Instructor'),
('dropshipping-business-from-scratch', 'Dropshipping Business from Scratch', 34.99, 69.99, 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop', 'Business', '25 hours', 'Expert Instructor'),
('advanced-graphics-design-portfolio', 'Advanced Graphics Design Portfolio', 54.99, 109.99, 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop', 'Design', '50 hours', 'Expert Instructor'),
('full-stack-javascript-development', 'Full Stack JavaScript Development', 64.99, 129.99, 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop', 'Development', '55 hours', 'Expert Instructor');
```

Also need to allow the service role (edge function) to update orders -- add an RLS policy:

```text
CREATE POLICY "Service role can update orders" ON public.orders
  FOR UPDATE USING (true) WITH CHECK (true);
```

Wait -- the edge function uses the service role key which bypasses RLS. So no policy change needed.

### Files to Modify

1. **`supabase/functions/process-payment/index.ts`**
   - Look up course by `course_slug` from `courses` table
   - Set `course_id` on the order insert

2. **`src/pages/Checkout.tsx`**
   - Change `window.location.href` to `window.open(url, '_blank')` for payment redirects
   - After opening payment URL, navigate to thank-you page in current tab
   - Improve error messages for existing users with wrong passwords

3. **`src/pages/AdminDashboard.tsx`**
   - Add "Approve" button on pending orders
   - On approve: update order status to "completed" and create enrollment via an edge function or direct Supabase call

### Payment Flow After Fix

```text
UddoktaPay Flow:
1. User clicks Pay -> edge function creates order WITH course_id
2. Edge function calls UddoktaPay API -> returns payment_url
3. Frontend opens payment_url in NEW TAB
4. Frontend shows thank-you page in current tab
5. User completes payment in new tab
6. UddoktaPay calls payment-callback with invoice_id
7. Callback verifies payment -> updates order -> creates enrollment
8. User now has course access

COD Flow:
1. User clicks "Order" -> edge function creates pending order WITH course_id
2. Frontend shows thank-you page
3. Admin sees pending order in dashboard
4. Admin clicks "Approve" -> order marked completed -> enrollment created
5. Student now has course access
```

