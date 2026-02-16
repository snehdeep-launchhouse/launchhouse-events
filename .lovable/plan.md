

## New "Our Services" Page + Homepage Enhancements

This plan covers creating a dedicated Services detail page, linking it across the site, and adding interactive hover animations to the homepage pricing cards.

---

### 1. New Route and Page

**File: `src/pages/Services.tsx` (new)**
- A new page at `/services` with its own hero banner, organized content sections, and a "Get a Quote" CTA at the bottom
- Google Analytics is already handled globally in `index.html`, so it will track this page automatically
- The page will reuse the existing `Navbar` and `Footer` components for consistent structure

**File: `src/App.tsx` (edit)**
- Add a new route: `<Route path="/services" element={<Services />} />`

---

### 2. Page Content Structure (Top to Bottom)

The page will be organized into these clean sections, using cards, icons, and a table -- not walls of text:

**A. Hero Banner** -- "The White Glove Approach to Event Tech"
- Subtitle: "Reclaim your time. Let us architect the experience."
- Brief 2-3 sentence summary of the value proposition
- Uses the same dark overlay hero style as the homepage

**B. "How Long Does It Take?" Section**
- A concise summary with three visual cards showing Sprint (5 days), Standard (4 weeks), and Marathon (3 months) benchmarks
- Clean iconography (Zap, Target, Mountain icons)

**C. Service Tiers -- Two Tab Groups**

Uses a tabbed layout to keep the page compact while housing all the information:

- **Tab 1: Full Event Build Packages** -- Three cards side by side:
  - Standard Deployment (30+ days)
  - Rapid Deployment (5-21 days)
  - Lifecycle Support (Premium -- ongoing)

- **Tab 2: Attendee Hub and App Builds** -- Three cards:
  - Standard Hub (20+ days)
  - Rush Hub (7-21 days)
  - Premium Hub Management (ongoing)

- **Tab 3: Training**
  - Custom Attendee Training Video card

**D. SLA and Turnaround Times Table**
- Clean styled table showing Complexity Level, First Draft Delivery, and Revision Turnaround
- Four rows: Simple, Medium, Advanced, Complex
- Note below: "Timelines begin once all necessary content and assets are provided."

**E. Additional Services -- Problem/Solution Cards**
- Three cards using the suggested layout:
  - "Got the tool but not the skills?" --> Enablement and Training
  - "Drowning in attendee emails?" --> Post-Launch Support
  - "Stuck on a technical hurdle?" --> On-Demand Custom Tasks

**F. Get a Quote CTA**
- A prominent "Get a Quote" button linking to the same Google Form as the homepage
- Placed above the footer

---

### 3. Navigation Updates

**File: `src/components/Navbar.tsx` (edit)**
- Rename "Services" nav link to "Our Services"
- Change it from scrolling to `#services` to navigating to `/services` using React Router's `useNavigate`

---

### 4. Homepage Pricing Card Links

**File: `src/components/PricingSection.tsx` (edit)**
- Make the four package cards (Simple, Medium, Advanced, Complex) clickable -- clicking any card navigates to `/services`
- Add a hover animation: slight scale-up (`hover:scale-[1.03]`) and elevated shadow on hover for an interactive feel

---

### 5. Animations

- Fade-in animations on sections as they appear (using CSS `animate-fade-in`)
- Hover scale effect on pricing cards and service tier cards
- Smooth transitions on tab switches
- Cards will use the existing `shadow-card` / `shadow-card-hover` utilities

---

### Technical Summary

| Action | File | Change |
|--------|------|--------|
| Create | `src/pages/Services.tsx` | Full services detail page |
| Edit | `src/App.tsx` | Add `/services` route |
| Edit | `src/components/Navbar.tsx` | Rename link to "Our Services", navigate to `/services` |
| Edit | `src/components/PricingSection.tsx` | Make cards clickable to `/services`, add hover animation |

No new dependencies required. The page uses existing UI components (Tabs, Table, Button, Card) and Tailwind utilities already in the project.

