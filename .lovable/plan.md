

## Add Cookie Consent Banner

A cookie consent banner that appears when visitors first land on the site, allowing them to accept or reject cookies (including Google Analytics).

### How It Works

- A banner appears at the bottom of the screen on first visit
- Two buttons: "Accept All" and "Reject All"
- The user's choice is saved in `localStorage` so the banner does not reappear
- If the user rejects cookies, the Google Analytics scripts are disabled
- If the user accepts, Google Analytics runs normally

### Technical Details

#### 1. New Component: `src/components/CookieBanner.tsx`

- A fixed-position banner at the bottom of the viewport with a brief message about cookie usage
- "Accept All" and "Reject All" buttons
- On accept: store `cookie-consent: accepted` in localStorage, allow GA to fire
- On reject: store `cookie-consent: rejected` in localStorage, disable GA tracking
- On subsequent visits, check localStorage and skip showing the banner

#### 2. Update `index.html`

- Modify the Google Analytics script to not fire automatically
- Instead, load it conditionally based on consent status (the component will handle enabling/disabling via `window.gtag`)

#### 3. Update `src/App.tsx`

- Import and render `<CookieBanner />` alongside the existing layout so it appears on every page

### Visual Design

- Semi-transparent dark background bar fixed to the bottom of the screen
- Clean text explaining cookie usage
- Two styled buttons matching the site's existing design system (primary for Accept, outline for Reject)
- Responsive layout that stacks buttons vertically on mobile

