

# Checkout Page Fixes

## 1. Show/Hide Password Toggle

Add a show/hide password button next to the password input field in the "Create Your Account" section.

**File:** `src/pages/Checkout.tsx`
- Add `showPassword` state (`useState(false)`)
- Import `Eye` and `EyeOff` icons from lucide-react
- Wrap the password input in a `relative` div with a toggle button positioned on the right
- Toggle input `type` between `"password"` and `"text"`

## 2. Remove Bengali Text from Cash on Delivery

**File:** `src/pages/Checkout.tsx` (line 234)
- Remove `<p className="text-xs text-muted-foreground">ক্যাশ অন ডেলিভারি</p>` from the COD label

## 3. BD Manual Payment: Remove Flag Emoji + IP-Based Visibility

**File:** `src/pages/Checkout.tsx`
- Change heading from `"🇧🇩 BD Manual Payment"` to `"BD Manual Payment"` (line 243)
- Add a `useEffect` that fetches the user's country via a free IP geolocation API (e.g., `https://ipapi.co/json/`) and stores `isBangladesh` in state
- Conditionally render the entire BD Manual Payment section only when `isBangladesh` is true
- Default `isBangladesh` to `false` so non-BD users never see the section

## 4. Fix "email rate limit exceeded" Error

The error occurs because Supabase's `signUp()` triggers a confirmation email, and repeated attempts hit the rate limit. The fix is to disable email confirmation requirement for signup.

**File:** `src/pages/Checkout.tsx`
- The `signUp` call already exists. The root cause is Supabase Auth settings -- email confirmation must be disabled in the Supabase dashboard (Auth > Providers > Email > "Confirm email" toggle OFF).
- As an additional safeguard in the code, wrap the signUp call to handle this specific error gracefully: if the error message contains "rate limit", show a user-friendly message like "Too many attempts. Please try again in a few minutes."
- Also, after signup, immediately sign in with `supabase.auth.signInWithPassword()` to ensure the user session is active regardless of email confirmation settings.

---

## Technical Summary

### Changes in `src/pages/Checkout.tsx`:
1. Add `showPassword` state + Eye/EyeOff toggle button on password field
2. Remove Bengali subtitle from COD option
3. Remove flag emoji from BD Manual Payment heading
4. Add `isBangladesh` state + `useEffect` with IP geolocation check to conditionally show BD Manual section
5. After `signUp`, call `signInWithPassword` to auto-login and avoid email confirmation issues; add friendly error message for rate limit errors
