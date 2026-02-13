

# Advanced Order Management System

## Overview
Transform the basic orders table into a full-featured order management system with bulk selection, soft delete (trash), manual order creation, status filters, and smart auto-approval logic for gateway payments.

---

## Database Changes

### Add `deleted_at` column to `orders` table
A new nullable `timestamp` column enables soft delete (trash) instead of permanent deletion. Orders with `deleted_at IS NOT NULL` are "trashed."

### Update RLS
Add admin UPDATE and DELETE policies so admins can soft-delete and modify orders.

---

## New Component: `AdminOrderManagement.tsx`

Replaces the inline orders table in `AdminDashboard.tsx` with a dedicated, feature-rich component.

### Features

**1. Status Tabs & Filters**
- Tabs: All | Pending | Completed | Trash
- Trash tab shows soft-deleted orders with "Restore" and "Permanent Delete" options

**2. Bulk Selection**
- Header checkbox to select/deselect all visible orders
- Per-row checkboxes
- Bulk action bar appears when items are selected:
  - "Approve Selected" (for pending manual/COD orders)
  - "Move to Trash"
  - "Delete Permanently" (only in Trash tab)

**3. Smart Action Column**
- **Auto-gateway payments** (PayPal, Stripe, UddoktaPay): Status is auto-set to "completed" by the payment callback. No approve button shown -- just a green "Completed" badge.
- **Manual/COD payments** (bkash_manual, nagad_manual, rocket_manual, cod): Show "Approve" button when status is "pending". Admin clicks to mark completed and enroll student.

**4. Manual Order Creation**
- "Add Order" button opens a dialog with fields:
  - Customer: Select existing user (searchable dropdown from profiles) or enter new email
  - Course: Select from courses list
  - Amount, Payment Method, Status (pending/completed)
  - Notes (sender_phone, trx_id)
- On submit: inserts into `orders` table. If status is "completed", also creates enrollment.

**5. Enhanced Table Columns**
| Column | Source |
|--------|--------|
| Checkbox | Bulk select |
| Order ID | Short ID |
| Customer | Join profiles (name + email) |
| Course | Join courses (title) |
| Amount | With currency |
| Payment Method | Badge style |
| Status | Color-coded badge |
| Date | Formatted |
| Action | Smart approve / trash / restore |

**6. Trash (Soft Delete)**
- "Move to Trash" sets `deleted_at = now()`
- Trash tab filters `deleted_at IS NOT NULL`
- "Restore" clears `deleted_at`
- "Delete Permanently" removes the row

---

## Edge Function Update: `process-payment/index.ts`

No change needed -- gateway callbacks (UddoktaPay, Stripe, PayPal) already set `payment_status: "completed"` automatically. Manual/COD orders already set `payment_status: "pending"`. The logic is already correct; the admin UI just needs to reflect this properly.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/admin/AdminOrderManagement.tsx` | Full order management component |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/AdminDashboard.tsx` | Replace inline orders rendering with `AdminOrderManagement` component |
| SQL Migration | Add `deleted_at` column to `orders`, add admin UPDATE/DELETE RLS policies |
| `src/integrations/supabase/types.ts` | Add `deleted_at` to orders type |

---

## Technical Details

### Smart Auto-Status Logic (in UI)
```text
const isManualMethod = ["bkash_manual", "nagad_manual", "rocket_manual", "cod"].includes(order.payment_method);

If order.payment_status === "pending" AND isManualMethod --> Show "Approve" button
If order.payment_status === "completed" --> Show green "Completed" badge (no action)
If order.payment_status === "pending" AND !isManualMethod --> Show yellow "Processing" badge (waiting for gateway callback)
```

### Bulk Operations
```text
Selected order IDs stored in state as Set<string>
Bulk approve: UPDATE orders SET payment_status = 'completed' WHERE id IN (...) + create enrollments
Bulk trash: UPDATE orders SET deleted_at = now() WHERE id IN (...)
Bulk restore: UPDATE orders SET deleted_at = null WHERE id IN (...)
Bulk delete: DELETE FROM orders WHERE id IN (...)
```

### Manual Order Dialog Fields
- User search: query `profiles` table with ILIKE on full_name or email
- Course select: query `courses` table
- Amount: auto-fills from selected course price, editable
- Payment method: dropdown (all methods)
- Status: pending or completed
- Optional: sender_phone, trx_id

