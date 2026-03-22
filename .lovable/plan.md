

# Cookie Consent Banner — Make.com Style with LaunchHouse Branding

## Overview

Replace the current simple cookie banner with a two-layer consent system:

1. **Bottom Banner** (initial state) — slim bar with privacy text, "Cookie Settings" button, and "Accept All" button
2. **Settings Modal** (on click "Cookie Settings") — centered dialog with privacy explanation, "More Information" link to Privacy Policy, and toggleable cookie categories

## Cookie Categories

| Category | Toggleable | Description |
|---|---|---|
| Necessary Cookies | No (Always Active) | Essential for site functionality |
| Functional Cookies | Yes (default on) | Remember preferences and settings |
| Marketing Cookies | Yes (default on) | Google Analytics tracking |
| Performance Cookies | Yes (default on) | Site performance monitoring |

Since we only have Google Analytics currently, the Marketing toggle will control GA. Functional and Performance toggles will be stored for future use but currently only Marketing triggers `enableGA()`.

## File Changes

### `src/components/CookieBanner.tsx` — Full rewrite

**Bottom Banner:**
- Fixed bottom bar, white/light background with border-top
- Left: privacy text paragraph mentioning cookies, third-party transfers, linking to Privacy Policy
- Right: "Cookie Settings" outline button + "Accept All" primary (blue) button + X close button
- Matches LaunchHouse brand colors (primary blue for Accept All)

**Settings Modal (Dialog):**
- Opens when "Cookie Settings" clicked
- LaunchHouse logo at top left, X close at top right
- Title: "Privacy Preference Center"
- Description paragraph about cookies
- "More Information" link → `/privacy-policy`
- Section: "Manage Consent Preferences" with 4 accordion-style rows:
  - Necessary Cookies — "Always Active" label (no toggle)
  - Functional Cookies — Switch toggle
  - Marketing Cookies — Switch toggle
  - Performance Cookies — Switch toggle
- Footer: "Reject All" button + "Confirm My Choices" primary button

**Storage:**
- Store granular preferences as JSON in `localStorage("cookie-consent")`:
  ```json
  { "necessary": true, "functional": true, "marketing": true, "performance": true }
  ```
- `enableGA()` only when `marketing: true`
- `disableGA()` when `marketing: false`

**Components used:** Dialog, Switch, Button, Separator (all existing shadcn components), plus Link from react-router-dom for privacy policy link.

### No other files changed
- App.tsx already lazy-loads CookieBanner via `DeferredCookieBanner`
- Privacy Policy page already exists at `/privacy-policy`

