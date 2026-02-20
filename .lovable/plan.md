
## Enable Right-Click "Open in New Tab/Window" on Navbar Links

### The Problem
All navbar links are rendered as `<button>` elements. Browsers only show "Open in new tab / Open in new window" in the right-click context menu for real `<a>` (anchor) elements. Buttons cannot be right-clicked to open in a new tab — they have no `href` for the browser to act on.

### The Fix
Replace `<button>` with `<a>` tags for every navbar link, providing a real `href` the browser can resolve. The existing click handler logic (smooth-scroll for hash links, SPA navigation for routes) is preserved via `onClick` with `e.preventDefault()` so the page doesn't do a full reload on left-click. Right-click and middle-click will work natively because the `<a>` tag has a valid `href`.

### Behavior After the Change

| Action | Route links (e.g. /about) | Scroll links (e.g. #why-us) |
|---|---|---|
| Left-click | SPA navigation (no reload, smooth) | Smooth scroll to section |
| Right-click | "Open in new tab / window" available | "Open in new tab / window" available (navigates to `/#why-us`) |
| Middle-click | Opens in new tab | Opens in new tab at `/#why-us` |
| Cmd/Ctrl+click | Opens in new tab | Opens in new tab at `/#why-us` |

### Technical Details

- **Route links** (`type: "route"`): `href` is set to the route path (e.g. `/about`). `onClick` calls `e.preventDefault()` then `navigate(href)` + `scrollTo(top)` for SPA behaviour on left-click.
- **Scroll links** (`type: "scroll"`): `href` is set to `/#why-us` / `/#contact` so right-click/middle-click land on the home page at the correct anchor. Left-click `onClick` calls `e.preventDefault()` and handles the smooth scroll or navigate-then-scroll logic as before.
- The mobile menu uses the same `<a>` elements, so the fix applies there too.
- The "Get Started" CTA button already uses `window.open` so it opens in a new tab by default — no change needed there.

### File Changed
- `src/components/Navbar.tsx` — replace `<button>` with `<a>` in both desktop and mobile nav, update `handleNav` to accept `e: React.MouseEvent<HTMLAnchorElement>` and call `e.preventDefault()`.
