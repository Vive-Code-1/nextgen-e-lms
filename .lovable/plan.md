

# Contact Page Redesign

Based on the reference images, here are the key visual improvements:

## Changes to `src/pages/Contact.tsx`

### Left Column: Unified Contact Info Card
Currently the 3 info cards (Address, Phone, Email) are separate cards with gaps between them. The reference shows them inside **one single card** separated by horizontal dividers, filling the full height.

- Wrap all 3 info items in a single `bg-card border rounded-2xl` container
- Use `divide-y divide-border` to create subtle dividers between items
- Each item gets more padding (`p-6`) for breathing room
- Remove individual card borders/shadows
- Add `h-full` so the card stretches to match the form height

### Right Column: Enhanced Form
- Add a bold heading at the top: "Send Message" / "মেসেজ পাঠান"
- Add field labels above each input (Name, Email, Phone, Subject, Message) with required asterisk indicators
- Increase input styling with subtle background tint and larger padding
- Make the submit button more prominent: golden amber (`bg-amber-500`) with full-width, rounded-full, and a send icon
- Increase overall card padding

### Layout
- Both columns use `items-stretch` (already present) so they match height
- Reduce gap slightly from `gap-12` to `gap-8` for a tighter look

## Technical Details

### File to Modify
| File | Change |
|------|--------|
| `src/pages/Contact.tsx` | Redesign contact info layout (unified card with dividers), add form labels and heading, style submit button |

### Translation Keys
The existing translation keys will be reused. The form heading and label texts will use existing keys where available, and inline text where not.

