

# Fix Order Flow - Auth + Payment Issues

## Root Causes Found

1. **Auth Error**: Supabase has email confirmation enabled. When a user signs up, their email is unconfirmed. Then `signInWithPassword` fails with **"Email not confirmed"** (not "invalid login"), so the code falls through to the generic Bengali error message. This is the error shown in the screenshot.

2. **Orders missing `course_id`**: All existing orders have `course_id: null`. The edge function code was updated but may need redeployment.

## Fix 1: Auto-confirm users via Admin API in Edge Function

Instead of trying to sign in unconfirmed users from the frontend, move the user creation to the `process-payment` edge function where we have the service role key. The service role can auto-confirm users.

**File:** `supabase/functions/process-payment/index.ts`
- Add user creation/lookup logic at the start of the function
- Accept `full_name`, `email`, `password`, `phone`, `address` from the request
- If no `user_id` provided, use `supabase.auth.admin.createUser()` with `email_confirm: true` to auto-confirm
- If user already exists, use `supabase.auth.admin.listUsers()` or handle the error and look up by email
- Return the created user's credentials in the response so the frontend can auto-login

**File:** `src/pages/Checkout.tsx`
- Remove all signup/signin logic from the frontend
- Send `email`, `password`, `full_name`, `phone`, `address` to the edge function
- The edge function handles everything (user creation + order + payment)
- After successful response, sign in with the returned credentials
- No more rate limit or email confirmation errors shown to students

## Fix 2: Redeploy Edge Functions

- Redeploy `process-payment` and `payment-callback` to ensure the latest code (with `course_id` lookup) is live

## Fix 3: Fix existing orders

- The 3 existing orders have `course_id: null` -- these can be left as-is since they were test orders

---

## Technical Details

### Updated `process-payment` Edge Function Flow

```text
1. Receive request with email, password, full_name, phone, address, course_slug, payment_method
2. If no user_id provided:
   a. Try admin.createUser() with email_confirm: true
   b. If user exists error, look up user by email
   c. Update profile with phone/address
3. Look up course_id from courses table using course_slug
4. Create order with user_id and course_id
5. Process payment (UddoktaPay/COD/etc.)
6. Return response with user credentials (for frontend auto-login)
```

### Updated `Checkout.tsx` Flow

```text
1. Collect form data (name, email, password, phone, address, payment method)
2. Call process-payment edge function with ALL data
3. Edge function returns: { redirect_url, user_email, user_password } or { success: true }
4. Frontend does signInWithPassword() to establish session
5. Opens payment URL in new tab (if redirect_url)
6. Navigates to /thank-you
7. No auth errors ever shown to students
```

### Files to Modify

1. **`supabase/functions/process-payment/index.ts`** -- Add user creation with admin API (auto-confirm), ensure course_id lookup works
2. **`src/pages/Checkout.tsx`** -- Remove frontend auth logic, delegate to edge function, auto-login after response
