

# Fix: Rate Limit Popup Not Showing (Edge Function Non-2xx Error)

## Root Cause

`supabase.functions.invoke` returns `data` as `null` on non-2xx responses. The response body is instead available via `error.context.json()`. So `data?.error === "rate_limit"` never matches because `data` is null.

## Solution

**File: `src/pages/Checkout.tsx` (lines 222-231)**

Replace the current error handling block with proper parsing of the `FunctionsHttpError` context:

```tsx
// Handle non-2xx responses - check if it's a rate limit
if (fnErr) {
  // On non-2xx, response body is in error.context, not in data
  try {
    const errorBody = await fnErr.context?.json?.();
    if (errorBody?.error === "rate_limit") {
      setRateLimitMessage(errorBody.message);
      setRateLimitOpen(true);
      setLoading(false);
      return;
    }
  } catch {}
  throw fnErr;
}
```

This reads the actual response body from `fnErr.context.json()` instead of relying on `data`, which is null for non-2xx responses.

No other files need changes -- the edge function and popup UI are already correct.

