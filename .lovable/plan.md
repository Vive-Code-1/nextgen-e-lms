

# Contact Form Height Fix

## Problem
The right-side form card is not stretching to match the height of the left-side info cards. There's empty white space below the "Send Enquiry" button.

## Solution
In `src/pages/Contact.tsx`:
- Change grid from `items-start` to `items-stretch` so both columns are equal height
- Add `flex flex-col` to the form card container and `flex-1` to the form so the content stretches
- Increase textarea rows from 5 to 7 for more vertical fill
- Add `h-12` to all input fields for slightly taller inputs

## File Modified

| File | Change |
|------|--------|
| `src/pages/Contact.tsx` | Grid `items-start` to `items-stretch`, taller inputs (`h-12`), bigger textarea (`rows={7}`), flex stretch on form card |

