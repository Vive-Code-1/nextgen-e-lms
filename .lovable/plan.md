

# Contact Page - 3 Fixes

## 1. Make Info Cards Compact (Match Form Height)

The 3 info cards currently have `p-6` padding and large icon containers, making them taller than the form. The fix:
- Reduce card padding from `p-6` to `p-4`
- Reduce icon container padding from `p-4` to `p-3`
- Reduce icon size from `h-7 w-7` to `h-5 w-5`
- Reduce margin-bottom on icon container from `mb-4` to `mb-2`
- Reduce title margin from `mb-2` to `mb-1`
- Change `space-y-6` between cards to `space-y-4`
- Add `items-stretch` or `items-center` to the grid so both columns align properly

## 2. Fix Missing Email Input Field

On line 53-56, the first row has a `grid-cols-2` but only contains one `Input` (Name). The Email input is missing. Fix:
- Add `<Input placeholder={t("contact.email_placeholder")} type="email" className="bg-background" />` as the second item in the first `grid-cols-2` row

## 3. Add Google Map Below Contact Form

Add a new section below the contact section with an embedded Google Map showing Bangladesh (Dhaka area):
- Use an `<iframe>` with Google Maps embed URL for Dhaka, Bangladesh
- Apply `rounded-2xl overflow-hidden` for border radius
- Set width to 100% and a reasonable height (e.g., 400px)
- Wrap in a container matching the same `max-w-[80vw]` layout

## File Modified

| File | Change |
|------|--------|
| `src/pages/Contact.tsx` | Compact card styles, add email input, add Google Map iframe |

## Layout After Fix

```text
+---------------------------+---------------------------+
| [icon] Address            |  Name      |  Email       |
| Dhaka, Bangladesh         |  Phone     |  Subject     |
| [icon] Phone              |  Message textarea         |
| +880 1234 567 890         |  [Send Enquiry]           |
| [icon] Email              |                           |
| info@nextgenlms.com       |                           |
+---------------------------+---------------------------+

+-----------------------------------------------------+
|              Google Map (Dhaka, BD)                  |
|              rounded-2xl border                     |
+-----------------------------------------------------+
```

