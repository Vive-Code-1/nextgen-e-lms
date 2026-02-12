

# Fix UddoktaPay Redirect - Payment Page Not Opening

## Problem

When UddoktaPay is selected and the user clicks Pay:
1. The edge function correctly returns a `redirect_url` (verified -- it returns `https://digitaltechdude.paymently.io/checkout/...`)
2. `window.open(url, '_blank')` is **blocked by the browser's popup blocker** (it considers this a popup since it's not a direct user click on a link)
3. Despite the popup being blocked, `navigate("/thank-you")` still runs
4. Result: user goes straight to thank-you without ever seeing the payment page

## Solution

Instead of `window.open` (popup, gets blocked) or `window.location.href` (doesn't work in iframe), use **`window.location.href`** for the **published site** -- this is the correct approach because:

- The published site (`nextgen-e-lms.lovable.app`) is NOT inside an iframe, so `window.location.href` works perfectly
- After payment, UddoktaPay redirects to the `payment-callback` edge function, which already redirects to `/thank-you`
- No need to navigate to thank-you from the checkout page at all

For credentials display on the thank-you page, store them in `localStorage` before redirecting so they survive the redirect chain.

## Changes

### File: `src/pages/Checkout.tsx`

In the `handlePayment` function, change the redirect logic:

```text
// BEFORE (broken):
if (data?.redirect_url) {
  window.open(data.redirect_url, '_blank');
  navigate("/thank-you", { state: ... });
}

// AFTER (fixed):
if (data?.redirect_url) {
  // Store credentials in localStorage so thank-you page can show them after redirect chain
  if (data?.user_email) {
    localStorage.setItem('checkout_credentials', JSON.stringify({
      email: data.user_email,
      password: data.user_password
    }));
  }
  // Redirect the current page to payment gateway
  window.location.href = data.redirect_url;
  return; // Stop execution -- user will be redirected back via payment-callback
}
```

### File: `src/pages/ThankYou.tsx`

Update to read credentials from both `location.state` (for COD/manual) and `localStorage` (for gateway redirects):

```text
// Check location.state first, then localStorage
const state = location.state || JSON.parse(localStorage.getItem('checkout_credentials') || 'null');
// Clear localStorage after reading
localStorage.removeItem('checkout_credentials');
```

## Flow After Fix

```text
UddoktaPay:
1. User clicks Pay -> edge function returns redirect_url
2. Credentials saved to localStorage
3. window.location.href = payment URL (full page redirect)
4. User completes payment on UddoktaPay
5. UddoktaPay redirects to payment-callback edge function
6. Callback verifies payment, creates enrollment
7. Callback redirects to /thank-you?payment=success
8. Thank-you page reads credentials from localStorage and displays them

COD / Manual (unchanged):
1. User clicks Order -> edge function returns { success: true }
2. navigate("/thank-you", { state: credentials })
3. Thank-you page reads credentials from location.state
```
