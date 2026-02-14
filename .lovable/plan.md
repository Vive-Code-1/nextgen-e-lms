

# Fix Rate Limit Popup + Updated Rules (2 orders / 10 min)

## Root Cause

`supabase.functions.invoke` treats any non-2xx response as an error. When `process-payment` returns 429, `fnErr` is set and line 222 (`if (fnErr) throw fnErr`) fires immediately -- the code never reaches line 225 where `data?.error === "rate_limit"` is checked.

## Changes

### 1. `supabase/functions/process-payment/index.ts`
- Change rate limit window from 30 minutes to **10 minutes**
- Change max orders from 3 to **2**
- Update the Bangla message to: "কম সময়ে বার বার কেনার কারনে আপনাকে আপাততো ব্লোক করে রাখা হয়েছে, বিস্তারিত জানতে কন্টাক করুন।"

### 2. `src/pages/Checkout.tsx`
- Fix error handling: instead of blindly throwing on `fnErr`, parse the error response to detect rate limit
- Replace the generic `throw fnErr` with logic that checks if the error context contains rate_limit info
- Update the rate limit popup to include **WhatsApp** and **Facebook** buttons instead of a generic "Contact Us" link

**Error handling fix (around lines 203-232):**

```tsx
const { data, error: fnErr } = await supabase.functions.invoke("process-payment", { body: {...} });

// Handle non-2xx responses - check if it's a rate limit
if (fnErr) {
  // supabase.functions.invoke puts response body in data even on error
  if (data?.error === "rate_limit") {
    setRateLimitMessage(data.message);
    setRateLimitOpen(true);
    setLoading(false);
    return;
  }
  throw fnErr;
}
```

**Updated popup (lines 528-543):**

Replace the single "Contact Us" button with WhatsApp and Facebook buttons:

```tsx
<AlertDialog open={rateLimitOpen} onOpenChange={setRateLimitOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>অর্ডার সীমা অতিক্রম</AlertDialogTitle>
      <AlertDialogDescription className="text-base">
        {rateLimitMessage}
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter className="flex gap-3">
      <a href="https://wa.me/8801332052874" target="_blank">
        <Button className="bg-green-600 hover:bg-green-700">WhatsApp</Button>
      </a>
      <a href="https://facebook.com/yourpage" target="_blank">
        <Button className="bg-blue-600 hover:bg-blue-700">Facebook</Button>
      </a>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/process-payment/index.ts` | 10 min window, max 2 orders, updated message |
| `src/pages/Checkout.tsx` | Fix error handling order; add WhatsApp/Facebook buttons in popup |

