
# Checkout Page Enhancements + Admin Dashboard Fix

## 1. Add "BD Manual Payment" Section to Checkout

Below the existing Payment Method section, add a new **"BD Manual Payment"** section with:

- **Three payment options as cards**: bKash, Nagad, Rocket (styled like the reference image with icons/logos)
- When a BD manual method is selected, show:
  - **Payment number display** with a copy button (e.g., "01332052874")
  - **Input field**: "যে নম্বর থেকে পাঠিয়েছেন" (sender phone number)
  - **Input field**: "Transaction ID (TrxID)"
- The payment method radio selection will include these BD manual options alongside UddoktaPay/Stripe/PayPal
- When a BD manual method is chosen, the Pay button submits the order with `payment_status: "pending"` (admin manually verifies) -- no redirect needed

## 2. Add COD (Cash on Delivery) Option

- Add a "Cash on Delivery" radio option in the Payment Method section
- When selected, no additional fields needed -- just submit order as pending

## 3. Add Phone & Address Fields to "Create Your Account" Section

- Add **Phone Number** input field
- Add **Address** textarea field
- All fields (Full Name, Email, Password, Phone, Address) will be **required**
- Phone and address stored in the user's profile (requires adding columns to `profiles` table)

## 4. Auto-Login After Checkout (No Email Verification)

- Use `supabase.auth.signUp()` with auto-confirm approach
- After successful payment submission, redirect to a **Thank You page** (`/thank-you`) showing:
  - "Your account has been created"
  - Display the email and password used
  - Message: "আপনার একাউন্ট এর ইমেল ও পাস দিয়ে লগিন করে আপনার অর্ডার স্টাটাস দেখুন"
  - A "Student Login" link button pointing to `/auth`

## 5. Fix Admin Dashboard Redirect

- **Problem**: `Auth.tsx` always redirects to `/dashboard` after login, ignoring admin role
- **Fix**: After login, check `user_roles` table. If user has `admin` role, redirect to `/admin`; otherwise redirect to `/dashboard`

---

## Technical Details

### Database Migration

Add `phone` and `address` columns to `profiles` table:

```text
ALTER TABLE public.profiles ADD COLUMN phone text;
ALTER TABLE public.profiles ADD COLUMN address text;
```

Add `sender_phone` and `trx_id` columns to `orders` table for BD manual payments:

```text
ALTER TABLE public.orders ADD COLUMN sender_phone text;
ALTER TABLE public.orders ADD COLUMN trx_id text;
```

### Files to Create

- **`src/pages/ThankYou.tsx`** -- Post-checkout confirmation page with login link

### Files to Modify

- **`src/pages/Checkout.tsx`** -- Add BD manual payment section (bKash/Nagad/Rocket), COD option, phone/address fields, validation, and redirect to ThankYou page
- **`src/pages/Auth.tsx`** -- Fix login redirect: check `user_roles` for admin role, redirect accordingly
- **`src/App.tsx`** -- Add `/thank-you` route
- **`src/integrations/supabase/types.ts`** -- Update types for new columns
- **`supabase/functions/process-payment/index.ts`** -- Add `bkash_manual`, `nagad_manual`, `rocket_manual`, and `cod` payment method handlers that create order with pending status and return success (no redirect)

### Edge Function Changes

For BD manual and COD methods, the `process-payment` function will:
1. Create the order with `payment_status: "pending"`, store `sender_phone` and `trx_id`
2. Return `{ success: true }` (no redirect URL) so the frontend navigates to the Thank You page

### Checkout Flow

```text
User fills form --> Selects BD Manual (bKash/Nagad/Rocket)
  --> Shows payment number + copy button
  --> User enters sender phone + TrxID
  --> Clicks Pay
  --> Account created (if not logged in)
  --> Order created with pending status
  --> Redirect to /thank-you with credentials
```
