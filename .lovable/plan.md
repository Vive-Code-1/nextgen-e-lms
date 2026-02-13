
# Fix Card Heights and Category Filtering

## Issue 1: Homepage Course Cards Have Unequal Heights

The "ভাইব কোডিং মাস্টারিং কোর্স" card appears shorter because the SpotlightCard wrapper and inner Card don't stretch to fill equal grid height.

### File: `src/components/ui/SpotlightCard.tsx`
- Add `h-full` to the root div className

### File: `src/components/home/PopularCourses.tsx`
- Add `h-full` to the Card component (line 52)
- Make CardContent use `flex flex-col flex-1` so the price/button row stays pinned to the bottom
- Add `flex flex-col h-full` to Card wrapper
- Add `flex-1` spacer before the price row so cards with shorter titles still align

## Issue 2: Category Filtering Broken for "Website Development"

**Root cause**: The database has inconsistent category values. The "ভাইব কোডিং মাস্টারিং কোর্স" has category `"Website Development"` while other dev courses have `"Development"`. This causes:
- Two "Website Development" entries in the sidebar filter (one is actually "Development" displayed as "Website Development" via `categoryDisplayNames`, the other is the literal "Website Development" value)
- Clicking the homepage "Website Development" category card links to `?category=Development`, which doesn't match courses with category `"Website Development"`

### Fix approach: Normalize filtering by grouping equivalent categories

### File: `src/pages/Courses.tsx`

1. Add a reverse mapping to normalize equivalent DB values:
```typescript
const categoryAliases: Record<string, string> = {
  "Website Development": "Development",
};
```

2. Normalize categories when building the sidebar filter list -- merge "Website Development" into "Development" so only one checkbox appears

3. Update the filter logic (line 74-78) to check both the selected category and its aliases:
```typescript
const matchCat = selectedCategories.length === 0 || 
  selectedCategories.some(sel => {
    const aliases = [sel, ...Object.entries(categoryAliases)
      .filter(([_, v]) => v === sel).map(([k]) => k)];
    if (categoryAliases[sel]) aliases.push(categoryAliases[sel]);
    return aliases.includes(c.category || "");
  });
```

4. Deduplicate sidebar categories by normalizing before creating the Set (line 121)

### Alternative (simpler): Update the course's category in the database
- Change "Website Development" to "Development" for the ভাইব কোডিং কোর্স to match the pattern

I will use both approaches: fix the DB value AND add normalization in code to prevent future mismatches.

## Technical Summary

| Change | File | Type |
|--------|------|------|
| Add `h-full` to SpotlightCard | SpotlightCard.tsx | CSS |
| Equal-height card layout with flex | PopularCourses.tsx | CSS |
| Normalize category values in filter | Courses.tsx | Logic |
| Fix DB category value | Data update | SQL |
