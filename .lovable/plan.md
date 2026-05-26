# Visual fixes: tablet navbar + footer overlap

Visual-only changes. No functionality, routing, or business logic touched.

## 1. Navbar — tablet crowding (`src/components/Navbar.tsx`)

At 768px (md), all 4 nav links + "Contact Us" + "Book a Free Consultation" try to fit on one row, causing the wrapping seen in the screenshot ("About Us", "Our Services" wrapping to two lines; Pricing nearly touching Contact Us).

Fix: shift the horizontal desktop layout from the `md` breakpoint to `lg` (1024px). On tablet (md–lg) the hamburger menu shows instead, which already contains all links + both CTAs.

- Line 50: `hidden md:flex items-center gap-8` → `hidden lg:flex items-center gap-6`
- Line 63: `hidden md:inline-flex` (Contact Us) → `hidden lg:inline-flex`
- Line 66: `hidden md:inline-flex` (Book a Free Consultation) → `hidden lg:inline-flex`
- Line 71: hamburger `md:hidden` → `lg:hidden`
- Line 81: mobile menu wrapper `md:hidden` → `lg:hidden`
- Line 106: sticky mobile CTA `md:hidden` → `lg:hidden`

Result: desktop (≥1024px) unchanged. Tablet (768–1023px) now uses the existing tidy hamburger menu. Mobile unchanged.

## 2. Footer — Cookie Settings hidden behind chat widget (`src/components/Footer.tsx`)

The "Ask me anything" chat bubble (fixed bottom-right, z-50) overlaps the right-aligned footer links row, hiding "Cookie Settings" on tablet/mobile.

Fix: add bottom padding to the footer so its content sits above the chat widget, and ensure the links row wraps cleanly under the widget on tablet by giving it right-side breathing room.

- Footer `<footer>` class: `py-12 border-t border-border/50` → `py-12 pb-24 lg:pb-12 border-t border-border/50`
- Links container: keep `flex flex-wrap gap-6` (already wraps) — no other change needed once bottom padding clears the widget.

Result: on mobile/tablet the footer ends with ~96px of clearance so the floating chat widget no longer covers Cookie Settings. On desktop (lg+) the widget sits to the right of footer content without overlap, so padding stays normal.

## Verification

- Resize preview to 768, 1024, 1280 and confirm: no wrapping nav labels, both CTAs visible at ≥1024, hamburger at <1024, Cookie Settings fully visible at all sizes without the chat bubble covering it.
