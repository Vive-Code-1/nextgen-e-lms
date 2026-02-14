

# Fix Contact Info Card Content Vertical Alignment

## Problem
The left contact info card has content bunched at the top with extra empty space at the bottom. The `flex-1` on the last item stretches it but doesn't distribute space evenly.

## Solution

**File: `src/pages/Contact.tsx`** (lines 67-70)

- Add `justify-center` to the parent card container so all 3 items are vertically centered within the card height
- Remove the `flex-1` conditional from the last item since vertical centering handles the spacing naturally

| Line | Current | New |
|------|---------|-----|
| 68 | `bg-card border border-border rounded-2xl h-full flex flex-col divide-y divide-border` | `bg-card border border-border rounded-2xl h-full flex flex-col divide-y divide-border justify-center` |
| 70 | `className={..p-6.. ${i === infoCards.length - 1 ? 'flex-1' : ''}}` | `className="p-6 flex items-start gap-4 text-left"` (no conditional) |

This vertically centers all three info blocks within the card, distributing the empty space equally above and below.

