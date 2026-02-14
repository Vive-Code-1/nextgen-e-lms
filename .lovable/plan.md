

# Fix: Rate Limit Popup - Reliable Approach

## Problem
The `supabase.functions.invoke` SDK wraps all non-2xx responses in a `FunctionsHttpError` and sets `data: null`. Attempts to read the response body from `fnErr.context.json()` are failing silently in the catch block, so the popup never shows.

## Solution
Change the edge function to return **HTTP 200** with the rate limit error payload in the body (instead of HTTP 429). This way, `data` will contain the error info directly, and the existing client-side check `data?.error === "rate_limit"` will work reliably.

This is a common pattern with Supabase Edge Functions since the JS SDK does not expose non-2xx response bodies reliably.

## Changes

### 1. Edge Function: `supabase/functions/process-payment/index.ts`

Change the rate limit response from **status 429** to **status 200**, keeping the same JSON body:

```ts
// Before (line ~45):
return new Response(JSON.stringify({
  error: "rate_limit",
  message: "কম সময়ে বার বার কেনার কারনে আপনাকে আপাততো ব্লোক করে রাখা হয়েছে, বিস্তারিত জানতে কন্টাক করুন।",
}), {
  status: 429,  // <-- This causes supabase-js to throw, hiding the body
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

// After:
return new Response(JSON.stringify({
  error: "rate_limit",
  message: "কম সময়ে বার বার কেনার কারনে আপনাকে আপাততো ব্লোক করে রাখা হয়েছে, বিস্তারিত জানতে কন্টাক করুন।",
}), {
  status: 200,  // <-- Now supabase-js will put this in `data`
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});
```

### 2. Checkout Page: `src/pages/Checkout.tsx`

Simplify the error handling back to checking `data` directly (since it will no longer be null):

```tsx
// Move rate limit check BEFORE the fnErr check
if (data?.error === "rate_limit") {
  setRateLimitMessage(data.message);
  setRateLimitOpen(true);
  setLoading(false);
  return;
}

if (fnErr) {
  throw fnErr;
}
```

## Why This Works
- HTTP 200 means `supabase.functions.invoke` puts the parsed JSON into `data` (not null)
- The client simply checks `data.error === "rate_limit"` which reliably triggers the popup
- No need to fight with `FunctionsHttpError.context.json()` which is unreliable in practice

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/process-payment/index.ts` | Rate limit response: 429 to 200 |
| `src/pages/Checkout.tsx` | Simplified error handling: check `data` before `fnErr` |

