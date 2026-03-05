

## Advanced Performance Optimization — Full Audit & Implementation Plan

### Current State
The site already has solid fundamentals: hero image preloading in `index.html`, `fetchPriority="high"` on hero banners, lazy-loaded CTA images, code splitting via `React.lazy` for routes and below-fold sections, and manual chunk splitting in Vite config. Google Fonts are preloaded with async swap. Inline CSS spinner prevents blank flashes.

### Remaining Bottlenecks Identified

1. **Font loading blocks rendering** — Google Fonts stylesheet is preloaded but the actual font files still cause FOIT/FOUT. No `font-display: swap` fallback stack in CSS.
2. **No CSS containment** — Sections trigger full-page layout recalculations on scroll/interaction.
3. **ContactUsPanel & RequestDemoPanel loaded eagerly** — These heavy components (~600-800 lines each with form libs, Sheet, Calendar, etc.) are imported synchronously in `ContactPanelProvider`, meaning they're in the initial bundle even though they only render when opened.
4. **Lucide icons imported individually but still add weight** — Not a major issue, but tree-shaking is already working.
5. **No `will-change` or `content-visibility`** — Below-fold sections could benefit from `content-visibility: auto` for rendering performance.
6. **Form submission path** — Forms import Supabase client eagerly (required), but the panel components themselves don't need to be in the critical path.
7. **Image `aspect-ratio`** — Width/height attributes are set but no CSS `aspect-ratio` to prevent CLS before images decode.
8. **Recharts in bundle** — Listed as dependency; if only used on admin page, it should already be code-split via lazy route. Confirmed: `AdminReport` is lazy-loaded.

### Plan

#### 1. Lazy-load Contact & Demo Panels (Biggest Win)
- In `ContactPanelProvider.tsx`, dynamically import `ContactUsPanel` and `RequestDemoPanel` using `React.lazy` — only load them when `contactOpen` or `demoOpen` becomes `true`.
- This removes ~1400 lines of form/sheet/calendar code from the initial JS bundle.

#### 2. Add `content-visibility: auto` for Below-Fold Sections
- In `src/index.css`, add utility class `.section-lazy` with `content-visibility: auto; contain-intrinsic-size: auto 600px;` 
- Apply to below-fold sections on all pages (philosophy, team DNA, CTA sections, SLA tables, etc.) via className additions.
- This tells the browser to skip rendering off-screen sections until they're near the viewport.

#### 3. CSS `aspect-ratio` for Banner Images  
- Add a shared CSS rule for hero/CTA banner `<img>` tags: `aspect-ratio: 16/9` to lock layout dimensions before image loads, eliminating CLS.

#### 4. Font Display Optimization
- Add `font-display: swap` fallback font stack in `index.css` for the `font-display` and `font-body` families to ensure text renders immediately with system fonts.

#### 5. Preconnect to Supabase
- Add `<link rel="preconnect">` for the Supabase API domain in `index.html` so form submissions have a warm connection ready.

#### 6. Defer CookieBanner Rendering
- Wrap `CookieBanner` in a `useEffect`-based delay (e.g., render after 2s or `requestIdleCallback`) so it doesn't compete with initial paint.

#### 7. Add `dns-prefetch` for Google Analytics
- Add `<link rel="dns-prefetch" href="https://www.googletagmanager.com">` in `index.html` for when cookie consent is given.

### Files Changed
- `src/components/ContactPanelProvider.tsx` — Lazy-load both panel components
- `src/index.css` — Add `content-visibility`, `aspect-ratio`, and font-display rules
- `index.html` — Add preconnect for Supabase, dns-prefetch for GA
- `src/App.tsx` — Defer CookieBanner with idle callback
- `src/pages/About.tsx` — Add `section-lazy` class to below-fold sections
- `src/pages/Services.tsx` — Add `section-lazy` class to below-fold sections  
- `src/pages/Pricing.tsx` — Add `section-lazy` class to below-fold sections
- `src/pages/Index.tsx` — Add `section-lazy` class to WhyUs/Pricing wrappers

### What This Does NOT Change
- No layout, text, or visual changes
- No changes to form logic or submission flow
- No changes to Supabase client or types
- All existing functionality preserved

