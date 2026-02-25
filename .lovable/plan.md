

## Universal Speed Optimization (Home Page Priority)

### Current State

- Home page (`Index.tsx`) eagerly imports all 6 section components (Navbar, Hero, Services, WhyUs, Pricing, Contact, Footer)
- Hero banner image is a JPG loaded via Vite import with `loading="lazy"` -- but the hero is above the fold, so lazy-loading actually *delays* it
- Google Fonts loaded via blocking `<link rel="stylesheet">` without `font-display: swap`
- No critical CSS inlined for the navbar/hero -- relies entirely on Tailwind CSS bundle
- No `<link rel="preload">` for the hero image
- Mobile touch targets lack `touch-action: manipulation` for zero-delay taps
- Below-the-fold sections (WhyUs, Pricing, Contact) are eagerly loaded even though they are not visible on initial render

### Changes

#### 1. Hero Image: Priority Loading (Not Lazy)

**File: `src/components/HeroSection.tsx`**
- Change `loading="lazy"` to `loading="eager"` and add `fetchPriority="high"` -- the hero is above the fold and must load immediately
- Add `decoding="async"` to avoid blocking the main thread during decode

#### 2. Font Loading: Add `font-display: swap`

**File: `index.html`**
- Change the Google Fonts URL to include `&display=swap` parameter so text renders immediately with fallback fonts
- Add `<link rel="preload">` for the primary font (Inter 400/600) as critical resources
- This eliminates the invisible text flash (FOIT) on slow connections

#### 3. Below-the-Fold Lazy Loading on Home Page

**File: `src/pages/Index.tsx`**
- Use `React.lazy` for below-the-fold sections: `WhyUsSection`, `PricingSection`, `ContactSection`
- Keep `Navbar`, `HeroSection`, `ServicesSection` eagerly loaded (visible on first viewport)
- Wrap lazy sections in `Suspense` with a minimal skeleton fallback

#### 4. Touch Optimization: Zero-Delay Taps

**File: `src/index.css`**
- Add a global rule: `a, button, [role="button"] { touch-action: manipulation; }` -- this removes the 300ms tap delay on all interactive elements across mobile browsers

#### 5. Critical CSS: Inline Navbar + Hero Styles

**File: `index.html`**
- Add a minimal `<style>` block with the navbar fixed positioning and hero background color so the first paint shows the correct layout before the Tailwind bundle loads
- This prevents any FOUC on the nav bar area

#### 6. Preload Hero Image

**File: `index.html`**
- Add `<link rel="preload" as="image" href="/src/assets/hero-banner.jpg">` so the browser starts fetching the hero image before it encounters it in the JS bundle
- Note: Vite will hash this in production, but the preload hint still helps during dev and the browser will deduplicate

#### 7. Auth/Session Non-Blocking on Public Pages

The current architecture already handles this correctly: `Index.tsx` does not import or initialize any auth/Supabase logic. The `AdminReport` is lazy-loaded and only runs auth checks when that route is visited. No changes needed here -- just confirming retention.

#### 8. Ignition Branding & Security Retention

No changes to the Ignition platform logic. The super admin restriction (`snehdeep@launchhouse.events`), de-duplicated email triggers, branded header/footer/logo, and React Query caching from the previous optimization round are all preserved.

---

### Files Summary

| File | Action |
|------|--------|
| `index.html` | Add `&display=swap` to font URL, preload hero image, inline critical nav CSS |
| `src/components/HeroSection.tsx` | Change `loading="lazy"` to `loading="eager"`, add `fetchPriority="high"` |
| `src/pages/Index.tsx` | Lazy-load below-the-fold sections (WhyUs, Pricing, Contact) |
| `src/index.css` | Add global `touch-action: manipulation` for interactive elements |

---

### Technical Details

**Google Fonts with swap:**
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" />
```
The URL already has `display=swap` -- confirmed. No change needed for this parameter specifically. However, the font stylesheet is render-blocking. We will change it to use `rel="preload"` with an `onload` swap pattern to make it non-blocking.

**Non-blocking font loading pattern:**
```html
<link rel="preload" href="https://fonts.googleapis.com/css2?..." as="style" onload="this.onload=null;this.rel='stylesheet'" />
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?..." /></noscript>
```

**Hero image preload (Vite-aware):**
Since Vite processes the image import and hashes the filename, we cannot preload the exact production URL from `index.html`. Instead, we will use `fetchPriority="high"` on the `<img>` tag itself, which achieves the same browser prioritization without needing to know the hashed URL.

**Touch-action rule:**
```css
@layer base {
  a, button, [role="button"], input, select, textarea {
    touch-action: manipulation;
  }
}
```
This removes the 300ms delay browsers add on touch devices to distinguish taps from double-taps.

**Lazy below-the-fold sections:**
```tsx
const WhyUsSection = lazy(() => import("@/components/WhyUsSection"));
const PricingSection = lazy(() => import("@/components/PricingSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
```
These load as soon as React is idle, well before the user scrolls down. The `Suspense` fallback is a simple height placeholder to prevent layout shift.

