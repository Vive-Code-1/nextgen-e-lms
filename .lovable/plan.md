

# Contact Card Center + Incomplete Orders + IP Rate Limiting

## 1. Contact Card -- Horizontal Center Fix

**File: `src/pages/Contact.tsx` (line 70)**

Change the info card items from `items-start` to `items-center` so the icon and text are horizontally centered (vertically aligned in the row axis).

```
// Before
className="p-6 flex items-start gap-4 text-left"

// After  
className="p-6 flex items-center gap-4 text-left"
```

---

## 2. Incomplete Orders (Abandoned Checkout Tracking)

### Concept
When a user fills in at least email or phone on the checkout page but leaves without completing the payment, their partial data is saved to a new `checkout_attempts` table. Admins can see these as "Incomplete Orders" in a new tab in the Order Management section.

### Database: New `checkout_attempts` table

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | default gen_random_uuid() |
| full_name | text | nullable |
| email | text | nullable |
| phone | text | nullable |
| course_slug | text | nullable |
| course_title | text | nullable |
| ip_address | text | nullable |
| created_at | timestamptz | default now() |
| is_converted | boolean | default false |

RLS: Insert allowed for anon/authenticated. Select allowed for admins only (using `has_role` function).

### Edge Function: `save-checkout-attempt`

A small edge function that:
- Receives `{ email, phone, full_name, course_slug, course_title }`
- Validates that at least email or phone is provided
- Extracts client IP from request headers
- Inserts into `checkout_attempts`
- Returns success

### Frontend Changes

**`src/pages/Checkout.tsx`**:
- Add a `useEffect` with a debounce (e.g. 3 seconds after last typing) that fires when `email` or `phone` has a value
- Calls the `save-checkout-attempt` edge function with the partial form data
- Uses a ref to avoid duplicate saves for the same session

**`src/components/admin/AdminOrderManagement.tsx`**:
- Add a new "Incomplete" tab alongside All/Pending/Completed/Trash
- Fetches from `checkout_attempts` where `is_converted = false`
- Shows: Name, Email, Phone, Course, Date
- Each row has a "Call" badge/link for quick phone action

---

## 3. IP-Based Rate Limiting for Fake Orders

### Edge Function: `process-payment` Update

Modify the existing `process-payment` edge function to:
1. Extract the client IP from `req.headers.get("x-forwarded-for")` or `req.headers.get("cf-connecting-ip")`
2. Query `orders` table: count orders from the same IP in the last 30 minutes
3. If count >= 3, return an error message: "আপনি বার বার কেনার চেষ্টা করায় আপাততো আপনি অর্ডার করতে পারবেন না। আমাদের সাথে কন্টাক করুন।"
4. Save IP address on each order

### Database Changes

- Add `ip_address` column (text, nullable) to the `orders` table

### Frontend Changes

**`src/pages/Checkout.tsx`**:
- When the edge function returns the rate limit error, show a popup dialog (not just inline error) with the Bangla message and a "Contact Us" link

---

## Technical Summary

| File/Resource | Change |
|---------------|--------|
| `src/pages/Contact.tsx` | `items-start` to `items-center` on info card items |
| DB Migration | Create `checkout_attempts` table + add `ip_address` to `orders` |
| `supabase/functions/save-checkout-attempt/index.ts` | New edge function for partial checkout data |
| `supabase/functions/process-payment/index.ts` | Add IP extraction, rate limiting (3 orders/30min), save IP |
| `src/pages/Checkout.tsx` | Debounced auto-save of partial form data; rate limit error popup dialog |
| `src/components/admin/AdminOrderManagement.tsx` | New "Incomplete" tab fetching `checkout_attempts` with contact info |

