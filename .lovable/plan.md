

# Fix Checkout Pricing and Add Coupon Management

## Issue 1: Checkout Shows Original Price Instead of Discount Price

**Root cause**: The checkout page uses `course.price` (10000) everywhere instead of calculating the effective price. Even though `coursePrice` is computed on line 104, it's never used in the display or payment body.

**Affected lines in `src/pages/Checkout.tsx`:**
- Line 111: `amount: course.price` -- sends original price to payment function
- Line 344: Pay button shows `course.price`
- Line 364: Order summary shows `course.price`
- Line 372: Total shows `course.price`

**Fix**: Compute `effectivePrice` once and use it everywhere:
```typescript
const effectivePrice = course.has_discount && course.discount_price 
  ? course.discount_price 
  : (course.price || 0);
```
Replace all `course.price` references in the display and payment body with `effectivePrice`.

---

## Issue 2: Coupon Management System

### Database: New `coupons` table

```sql
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value numeric NOT NULL DEFAULT 0,
  min_order_amount numeric DEFAULT 0,
  max_uses integer, -- NULL = unlimited
  times_used integer NOT NULL DEFAULT 0,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

RLS: Admin full access, anyone can SELECT active coupons (needed for validation on checkout).

### Admin Panel: Coupon Management

**New file: `src/components/admin/AdminCoupons.tsx`**

Features:
- Table listing all coupons (Code, Type, Value, Uses, Valid Until, Status)
- "Add Coupon" button opens a dialog/form with fields:
  - Code (text)
  - Discount Type (percentage / fixed)
  - Discount Value (number)
  - Min Order Amount (number)
  - Max Uses (number, optional)
  - Valid From / Valid Until (date pickers)
  - Active toggle
- Edit button to modify existing coupons
- Delete button to remove coupons

**File: `src/pages/AdminDashboard.tsx`**
- Add sidebar link: `{ icon: Tag, label: "Coupons", id: "coupons" }`
- Add rendering for `AdminCoupons` component

### Checkout Page: Coupon Field

**File: `src/pages/Checkout.tsx`**

Add a coupon input section in the Order Summary sidebar:
- Input field + "Apply" button
- On apply: query `coupons` table to validate code (active, not expired, usage not exceeded, min order met)
- If valid: show discount breakdown (original price, coupon discount, new total)
- If invalid: show error message
- Update the `effectivePrice` to subtract coupon discount
- Send `coupon_code` and `coupon_discount` in the payment body

### Price Display Logic

```text
Order Summary:
  Course Price:     $999   (after course discount)
  Coupon (CODE10):  -$100  (if coupon applied)
  Tax:              $0.00
  ──────────────
  Total:            $899
```

## Files to Create/Modify

| File | Action |
|------|--------|
| Migration (coupons table) | Create |
| `src/pages/Checkout.tsx` | Fix price display + add coupon field |
| `src/components/admin/AdminCoupons.tsx` | Create (CRUD for coupons) |
| `src/pages/AdminDashboard.tsx` | Add Coupons tab |

