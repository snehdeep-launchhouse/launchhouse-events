

## Fix: Logo click scrolls to top of home page

The `Logo` component already uses `<Link to="/">` which navigates to the home page. However, React Router's `<Link>` doesn't automatically scroll to the top when you're already on `/`. 

### Change

**src/components/Logo.tsx** — Add an `onClick` handler that scrolls to the top of the page. If already on `/`, it just scrolls up; if on another page, React Router navigates to `/` and then we scroll to top.

Replace the `<Link>` with an `onClick` that calls `window.scrollTo({ top: 0, behavior: 'smooth' })` alongside the navigation. This works on both desktop and mobile since the same `Logo` component is used everywhere via `Navbar`.

Single file change, affects all pages and both breakpoints.

