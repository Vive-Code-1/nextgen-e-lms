
# Contact Page Layout Update

## What Changes

The current "Contact Form" section (line 53-80) has two columns:
- **Left**: "Get in Touch with Us Today" title + description paragraph (currently mostly empty space)
- **Right**: Contact form

The update will:
1. **Remove** the title "Get in Touch with Us Today" and the description paragraph from the left column
2. **Move** the 3 info cards (Address, Phone, Email) from the separate top section into the left column
3. **Remove** the separate "Info Cards" section (lines 35-51) entirely since its content moves into the form section
4. Stack the 3 cards vertically on the left side, alongside the form on the right

## File Modified

| File | Change |
|------|--------|
| `src/pages/Contact.tsx` | Remove Info Cards section (lines 35-51). Replace left column content (lines 57-61) with the 3 info cards stacked vertically. Keep the right column form as-is. |

## Result Layout

```text
+---------------------------+---------------------------+
|  [icon] Address Card      |                           |
|  Dhaka, Bangladesh        |   Name    |   Email       |
|                           |   Phone   |   Subject     |
|  [icon] Phone Card        |   Message textarea        |
|  +880 1234 567 890        |                           |
|                           |   [Send Message Button]   |
|  [icon] Email Card        |                           |
|  info@nextgenlms.com      |                           |
+---------------------------+---------------------------+
```
