

## New Pricing Page (`/pricing`)

### Overview
Create a dedicated Pricing page with professionally written marketing copy, pricing cards, infographics, and a clear call-to-action. The "Pricing" nav link will change from a scroll anchor to a route link pointing to `/pricing`.

---

### 1. Update Navigation

**File: `src/components/Navbar.tsx`**
- Change the Pricing nav link from `{ label: "Pricing", href: "#pricing", type: "scroll" }` to `{ label: "Pricing", href: "/pricing", type: "route" }`

**File: `src/components/PricingSection.tsx`**
- Keep the existing homepage pricing section as-is (it serves as a summary that links to the services page)

---

### 2. Add Route

**File: `src/App.tsx`**
- Add `<Route path="/pricing" element={<Pricing />} />` above the catch-all route

---

### 3. Create the Pricing Page

**New file: `src/pages/Pricing.tsx`**

The page will follow the same structure and design language as the Services page (hero banner, card grids, tables, consistent spacing and animations).

#### Sections:

**A. Hero Banner**
- Reuse the hero banner image with dark overlay (matching Services page pattern)
- Headline: "Transparent Pricing, Exceptional Value"
- Subtitle: Professional copy about cost-effective Cvent solutions

**B. Pricing Philosophy Intro**
- Beach shack vs. 5-star resort analogy -- professionally written copy explaining why Medium, Advanced, and Complex builds require custom quotes
- Emphasise that Simple builds start from $899

**C. Event Build Pricing**
- Card grid layout with the following tiers:
  - **Simple Build** -- Starts from $899, same-day delivery available, T&C Apply tooltip
  - **Medium Build** -- Custom quote required, card with "Contact Us" CTA
  - **Advanced Build** -- Custom quote required, card with "Contact Us" CTA
  - **Complex Build** -- Custom quote required, card with "Contact Us" CTA
- "Contact Us" buttons link to the Google Form

**D. Attendee Hub Pricing**
- Cards for:
  - Attendee Hub Only Build -- $1,999
  - Attendee Hub Premium (Post Launch Support) -- $99/hour
  - Attendee Training Video -- Starts from $499

**E. Creative Services**
- Card for HTML Support -- $75/hour

**F. Support Services**
- Card for Premium/Post Launch Support -- $75/hour

**G. CTA Section**
- Background image with dark overlay (matching Services page)
- "Contact Us" button linked to the Google Form
- Copy about sales rep reaching out within 24 hours

---

### 4. SEO

**File: `index.html`**
- Add/update meta tags for the pricing page context (description, keywords targeting: Cvent pricing, event registration cost, event technology pricing, Cvent consulting rates)

The Pricing page component will include a Helmet-style approach using `document.title` in a `useEffect` for page-specific SEO.

---

### 5. Google Analytics

The existing cookie consent banner and GA integration (G-JDM9N7HJD3) already tracks all pages via the global `gtag("config", ...)` call. React Router page changes are automatically captured. No additional GA code is needed.

---

### Technical Details

- **Design consistency**: Uses the same card styles (`rounded-xl border border-border/50 bg-card-gradient shadow-card`), hover effects (`hover:shadow-card-hover hover:scale-[1.02]`), section spacing (`py-20 md:py-28`), and typography patterns as the Services page
- **Icons**: Uses lucide-react icons consistent with the rest of the site
- **T&C tooltip**: Reuses the existing `TnCTooltip` component on the Simple build card
- **Google Form link**: Same form URL used across the site for "Get a Quote" / "Contact Us"
- **Responsive**: Grid layouts using `sm:grid-cols-2 lg:grid-cols-3` patterns
- **No new dependencies required**
