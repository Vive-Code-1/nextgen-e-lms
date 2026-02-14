

# Fix BlurText Centering and Update ShinyText Settings

## 1. Fix BlurText Center Alignment (All 6 Section Titles)

**Root cause**: In `src/components/ui/BlurText.tsx` (line 86), the inline style has `justifyContent: 'inherit'`. Inline styles override Tailwind classes, so the `justify-center` class on the BlurText `className` prop is being ignored. Since there's no parent with `justify-content` set, it defaults to `flex-start` (left-aligned).

**Fix**: Remove `justifyContent: 'inherit'` from the inline style in `BlurText.tsx`. This allows the `justify-center` Tailwind class (already present in every usage) to work correctly.

**File: `src/components/ui/BlurText.tsx`** (line 86)
- Change: `style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'inherit' }}`
- To: `style={{ display: 'flex', flexWrap: 'wrap' }}`

This single change fixes center alignment for all 6 titles simultaneously since they all already pass `justify-center` in their className.

No other text effects need to be removed -- the 6 titles are already using only BlurText.

## 2. Update ShinyText on "Potential with"

**File: `src/components/home/HeroSection.tsx`** (lines 57-63)
- Change `speed={2}` to `speed={3.2}`
- Change `shineColor="#7F3AEE"` to `shineColor="#FCC522"`

## Files to Modify

| File | Change |
|------|--------|
| `src/components/ui/BlurText.tsx` | Remove `justifyContent: 'inherit'` from inline style |
| `src/components/home/HeroSection.tsx` | Update ShinyText speed and shineColor |
