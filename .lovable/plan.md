

# UddoktaPay Integration + Rate Limit Fix

## 1. Fix "Too many attempts" Error

The rate limit error from Supabase signup will be silently handled instead of shown to students.

**File:** `src/pages/Checkout.tsx`
- When a rate limit error occurs during signup, try signing in with the provided credentials first (the account may already exist from a previous attempt)
- If sign-in succeeds, continue with payment flow silently
- If sign-in also fails, show a generic friendly message like "অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন" instead of the technical error
- This handles the common case where a user tried to checkout before, their account was created, but the payment step failed -- now they can retry seamlessly

## 2. Integrate UddoktaPay with Production API

The `UDDOKTAPAY_API_KEY` secret already exists. The edge function currently points to the sandbox URL. It needs to be updated with the production base URL.

**File:** `supabase/functions/process-payment/index.ts`
- Change the UddoktaPay API URL from `https://sandbox.uddoktapay.com/api/checkout-v2` to `https://digitaltechdude.paymently.io/api/checkout-v2`
- Pass the actual user's `full_name` and `email` (received from the frontend) instead of hardcoded "Customer" / "customer@example.com"
- Set `redirect_url` to the app's thank-you/success page
- Set `cancel_url` to the course page
- Add `webhook_url` pointing to the `payment-callback` edge function
- Add `return_type: "GET"` so the invoice_id comes as a query parameter

**File:** `src/pages/Checkout.tsx`
- Pass `full_name` and `email` to the edge function call so UddoktaPay gets real user info

## 3. Payment Verification via Callback

**File:** `supabase/functions/payment-callback/index.ts`
- Add UddoktaPay verification: when receiving a callback with `invoice_id`, call the UddoktaPay Verify Payment API (`https://digitaltechdude.paymently.io/api/verify-payment`) to confirm payment status
- If status is "COMPLETED", update the order to completed and create enrollment
- Redirect user to the thank-you page on GET requests

## 4. Admin Panel - Payment Settings Tab

**File:** `src/pages/AdminDashboard.tsx`
- The admin panel already has a "Settings" tab (currently empty). Add a "Payment Settings" section under it displaying:
  - UddoktaPay API Key field (masked, with update button)
  - UddoktaPay Base URL field
  - Toggle to enable/disable each payment method (UddoktaPay, Stripe, PayPal, COD, BD Manual)
- Payment settings will be stored in a new `site_settings` table
- For now, since changing edge function env vars requires redeployment, the admin panel will show current configuration status and allow toggling which payment methods are visible on checkout

---

## Technical Details

### Database Migration
Create a `site_settings` table for storing payment configuration:

```text
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings" ON public.site_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can read settings" ON public.site_settings
  FOR SELECT USING (true);

-- Default payment config
INSERT INTO public.site_settings (key, value) VALUES
  ('payment_methods', '{"uddoktapay": true, "stripe": true, "paypal": true, "cod": true, "bd_manual": true}'::jsonb),
  ('uddoktapay_base_url', '"https://digitaltechdude.paymently.io/api"'::jsonb);
```

### Files to Modify

1. **`src/pages/Checkout.tsx`** -- Fix rate limit handling (silent retry via signIn), pass user info to edge function, read enabled payment methods from `site_settings`
2. **`supabase/functions/process-payment/index.ts`** -- Update UddoktaPay URL to production, use real user data, read base URL from settings or env
3. **`supabase/functions/payment-callback/index.ts`** -- Add UddoktaPay payment verification via their Verify Payment API
4. **`src/pages/AdminDashboard.tsx`** -- Add Settings tab with payment method toggles and API configuration display
5. **`src/integrations/supabase/types.ts`** -- Add `site_settings` type

### Rate Limit Fix Flow

```text
User submits checkout form
  --> signUp() called
  --> If "rate limit" error:
      --> Try signInWithPassword() (account may already exist)
      --> If sign-in succeeds: continue with payment
      --> If sign-in fails: show friendly Bengali message
  --> If other error: show generic error
  --> Never show "Too many attempts" to students
```

### UddoktaPay Payment Flow

```text
1. User selects UddoktaPay on checkout
2. Frontend calls process-payment edge function
3. Edge function calls UddoktaPay checkout-v2 API
4. Returns payment_url to frontend
5. Frontend redirects user to UddoktaPay
6. User completes payment
7. UddoktaPay redirects to payment-callback with invoice_id
8. Callback verifies payment via verify-payment API
9. Updates order status + creates enrollment
10. Redirects user to thank-you page
```

