
## Fix: Add "Get Started" Button to Mobile Navbar

### Problem
On mobile, the "Get Started" button is only accessible after tapping the hamburger menu to open the dropdown. It is not immediately visible in the navbar itself, making it easy to miss and reducing conversion opportunities on mobile.

### Current Behaviour
- Desktop: Logo | Nav links | **Get Started** button — always visible
- Mobile: Logo | hamburger icon only — button hidden inside dropdown

### Solution
Add a compact "Get Started" button to the mobile navbar bar itself, so it sits between the Logo and the hamburger icon and is always visible on mobile — no need to open the menu first.

### File to Change
`src/components/Navbar.tsx` — one small change:

- The desktop `Get Started` button currently has `className="hidden md:inline-flex"` — it is invisible on mobile.
- Add a second compact button that is **only visible on mobile** (`md:hidden`) next to the hamburger toggle, so both the CTA and the menu icon appear side by side.

### Visual Result (mobile navbar)
```text
[ Logo ]          [ Get Started ]  [ ☰ ]
```

### Technical Detail
- The new mobile button will call the same `handleCta` function (opens `/build-request` in a new tab).
- It will use `size="sm"` to keep it compact and fit alongside the hamburger icon.
- The existing button inside the hamburger dropdown can remain as-is for completeness, or be removed to avoid duplication — keeping it in the dropdown is fine since it won't cause confusion.
- No other files need to change.
