# Pricing Page — Minimal CTA & Copy Updates

Presentation-only edits to `src/pages/Pricing.tsx`. No data, schema, route, edge function, or component-library changes. No impact on existing forms or flows.

## UI recommendation (your question on button vs inline link)

For section #1 ("How Our Pricing Works"), an **inline anchor on meaningful words + a small ghost "arrow link" below the copy** reads as the most organic and on-brand option. A full solid button here would feel abrupt against the centered editorial paragraph block and would compete with the bold CTAs further down the page. The ghost arrow-link pattern (`text → ArrowUpRight`) is already used elsewhere on the site, so it stays inside the existing design language.

For section #2 (build cards), replacing the repeated "Custom quoted" with a single tappable phrase that opens the calculator is both the cleanest visual fix and the most engaging — the price slot becomes the CTA itself instead of a dead label.

## Changes

### 1. "How Our Pricing Works" — integrate Calculator V2

Edit the second paragraph so "custom quoted" becomes an inline link to `/calculator`, and append a small ghost arrow-link beneath the three paragraphs:

- Inline: `…which is why those tiers are <Link>custom quoted</Link>.` styled `text-primary underline-offset-4 hover:underline font-medium`.
- Below paragraphs, centered: `Not sure where your event fits?  Try our Complexity Calculator →` as a ghost link (`Button variant="link"` or plain `<a>` with `ArrowUpRight`).

Both point to `/calculator` (V2 alias preserved separately, not used here). Opens in same tab.

### 2. Registration Build Packages — replace repeated "Custom quoted"

For Medium / Advanced / Complex cards only (Simple keeps `From $899`):

- Replace the `Custom quoted` price line with a tappable element rendered as an anchor-styled element: `Get a tailored estimate` with `ArrowUpRight`, styled in `text-primary font-semibold` so it visually occupies the same slot the price used to.
- Clicking navigates to `/calculator`.
- Simple Build is unchanged (price stays, no CTA — matches current behavior since the existing `cta` field is not rendered today).

No card layout, grid, icon, feature-list, or hover-state changes. The `buildPackages` array `cta` / `ctaVariant` fields stay as-is (currently unused) to avoid risk.

### 3. Priority Delivery — switch CTA target

Current: `onClick={() => window.open(GET_A_QUOTE_URL, "_blank")}` → Get a Quote (contact form).

Change to: `onClick={openDemoPanel}` so it opens the existing "Book a Free Consultation" RequestDemoPanel that the Navbar already uses. Button label, variant, and icon unchanged.

`openDemoPanel` is already exposed by `useContactPanel()` — just destructure it alongside the existing `openContactPanel`.

### 4. Attendee Hub & Training — three "Get Started" buttons → Calculator V2

In the `hubCards.map` render (Attendee Hub Build, Premium Hub Support, Training Video), change:

`onClick={() => window.open(GET_A_QUOTE_URL, "_blank")}` → `onClick={() => navigate("/calculator")}` (or `window.location.assign("/calculator")` to avoid adding a new import if `useNavigate` isn't already in this file — it isn't, so prefer `window.location.href = "/calculator"` for a same-tab navigation that stays inside the SPA shell). Button label, variant, icon unchanged.

## Out of scope (explicitly untouched)

- All other pages, components, routes
- JSON-LD / SEO metadata on this page
- `buildPackages` and `hubCards` data arrays' shape
- Specialist Services section
- Hero, CTA banner, footer
- `/calculator-v2` alias, V1 rollback path
- DB, edge functions, email flows, RLS

## Safety / rollback

- All edits are inside `src/pages/Pricing.tsx`. Reverting the single file restores prior behavior.
- No new dependencies, no new files, no routing changes.
- No form, lead-capture, or analytics wiring is altered.
- "Get a Quote" route (`/get-a-quote`) remains live and reachable from other parts of the site.

## Files touched

- `src/pages/Pricing.tsx` (only)
