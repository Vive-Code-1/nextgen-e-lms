

# Contact Page: Left Column Height Match Fix

## Problem
The left column (Address, Phone, Email) has 3 separate cards with `space-y-4` gaps, leaving empty space at the bottom since it's shorter than the right column form card.

## Solution
Merge the 3 separate info cards into a single unified card that stretches to match the form's height, with dividers between items -- matching the reference image.

### Changes to `src/pages/Contact.tsx`

**Left column (lines 68-81):**
- Replace `space-y-4` wrapper with a single `bg-card border border-border rounded-2xl h-full flex flex-col divide-y divide-border` container
- Remove individual card borders/rounded corners/shadows from each info item
- Each item becomes a `p-6 flex items-start gap-4` section inside the unified card
- The last item gets `flex-1` so the card stretches evenly to fill remaining space

**Grid gap (line 67):**
- Change `gap-12` to `gap-8` for tighter layout matching the reference

### File to Modify
| File | Change |
|------|--------|
| `src/pages/Contact.tsx` | Unified single card for info items with `divide-y`, remove individual card styling, adjust gap |

