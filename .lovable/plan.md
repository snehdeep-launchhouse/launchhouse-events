

## Add "Home" Navigation Link + Clickable Logo

Two small changes to improve site navigation:

### 1. Add "Home" to the Navigation Bar

**File: `src/components/Navbar.tsx`**
- Add a "Home" link as the first item in the `navLinks` array, pointing to `/` with type `"route"`
- The nav order will become: **Home** | Our Services | Why Us | Pricing | Contact

### 2. Make the Logo Clickable

**File: `src/components/Logo.tsx`**
- Wrap the logo in a React Router `Link` component (or pass an `onClick` handler) so clicking it navigates to `/` (the home page)
- Add `cursor-pointer` styling for visual feedback

### Technical Details

| File | Change |
|------|--------|
| `src/components/Navbar.tsx` | Add `{ label: "Home", href: "/", type: "route" }` as the first nav link |
| `src/components/Logo.tsx` | Wrap the logo content in a `Link to="/"` from `react-router-dom` so it always navigates home |

No new dependencies needed.

