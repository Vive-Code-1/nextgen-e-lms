

# Hero Search Bar and Category Dropdown Fixes

## Changes

### 1. Dynamic Search with Category - Navigate to Courses Page
Currently the search bar and category dropdown in `HeroSection.tsx` don't navigate anywhere. The fix will:
- Add state for search text and selected category
- Use `useNavigate` from react-router-dom
- On Enter key press or arrow button click, navigate to `/courses?category=X&search=Y`
- Update `Courses.tsx` to read the `search` query param and filter courses by title match

### 2. Category Dropdown - Show Below (Not Above) with Proper Z-Index
Currently the dropdown uses `bottom-full` which opens it upward. The fix will:
- Change `bottom-full mb-2` to `top-full mt-2` so it opens downward
- Ensure `z-50` is present so it overlays the stats cards below
- Show selected category name in the button text instead of generic "Category" label

### 3. Category Selection - Show Selected State
- When a category is clicked, update button text to show selected category name
- Close dropdown after selection

---

## Technical Details

### File: `src/components/home/HeroSection.tsx`
- Add `useNavigate` import
- Add `searchText` and `selectedCategory` state
- Wire input's `onChange` and `onKeyDown` (Enter triggers navigation)
- Wire arrow button's `onClick` to navigate
- Category buttons update `selectedCategory` state and close dropdown
- Change dropdown position from `bottom-full mb-2` to `top-full mt-2`
- Display selected category name in button text

### File: `src/pages/Courses.tsx`
- Read `search` query param alongside `category`
- Filter courses by both category and search text (case-insensitive title match)

