

## About Us Page (`/about`)

### Overview
Create a dedicated About Us page that tells the LaunchHouse Events story with professional marketing copy, modern design elements, and consistent branding. The page will be placed after "Home" in the navigation bar.

---

### 1. Update Navigation

**File: `src/components/Navbar.tsx`**
- Insert a new nav link `{ label: "About Us", href: "/about", type: "route" }` as the second item in the `navLinks` array (after Home, before Our Services)

---

### 2. Add Route

**File: `src/App.tsx`**
- Import the new `About` page component
- Add `<Route path="/about" element={<About />} />` above the catch-all route

---

### 3. Create the About Us Page

**New file: `src/pages/About.tsx`**

The page will follow the same structure and design language as Services and Pricing pages (hero banner with dark overlay, card grids, consistent spacing, hover animations, and typography).

#### Sections:

**A. Hero Banner**
- Reuse the hero banner image with dark overlay (matching other pages)
- Headline: "Built by Event People, for Event People"
- Subtitle: Professional tagline about passion meeting expertise

**B. Our Story**
- Origin narrative: Founded in early 2025 from Bengaluru, India -- the tech capital
- The founder's journey: from event management employee at a well-known company to discovering Cvent in 2016 and being captivated by event automation
- Evolution from practitioner to building a team of specialists
- Professional storytelling tone with a human touch

**C. By the Numbers -- Stats/Infographic Strip**
- Horizontal card strip with key metrics:
  - **30+** Years Collective Experience
  - **2025** Founded in Bengaluru
  - **24hr** Response Time
  - **Cvent Certified** Team
- Uses the same card styling with icons

**D. Our Team DNA / What Drives Us**
- Three pillar cards highlighting the team composition:
  - **Event Consultants** -- Domain experts who understand the nuances of event architecture, registration logic, and attendee journeys
  - **Sales Team** -- Advisors who listen first and recommend solutions tailored to scope and budget
  - **Service Team** -- Hands-on builders who turn vision into reality with precision and speed
- Each card emphasises "driven by passion, backed by domain expertise"
- Copy weaves in the theme of making event planners' lives easy and painless

**E. Our Philosophy -- "Faster. Cheaper. Better."**
- Three-column layout expanding on the company motto:
  - **Faster**: Streamlined processes, same-day delivery capability, no bureaucratic delays
  - **Cheaper**: Lean operations from Bengaluru, no bloated retainers, transparent pricing
  - **Better**: Cvent certified, 30+ years collective expertise, white-glove service standards
- Professional copy positioning these as competitive advantages rooted in the Bengaluru tech ecosystem

**F. Why Bengaluru**
- Brief section highlighting the strategic advantage of being based in India's tech capital
- Access to top-tier tech talent, cost-effective operations passed on to clients, global delivery capability across time zones

**G. CTA Section**
- Background image with dark overlay (matching Services and Pricing pages)
- "Get Started" button linked to the Google Form
- Copy inviting visitors to start a conversation

---

### 4. SEO

**File: `index.html`**
- Expand meta keywords to include: "Cvent consulting Bengaluru", "event technology India", "about LaunchHouse Events", "Cvent certified team"

The About page component will set `document.title` via `useEffect` for page-specific SEO (pattern used in Pricing page).

---

### 5. Google Analytics

The existing cookie consent banner and GA integration already tracks all pages via the global `gtag("config", ...)` call. React Router page changes are automatically captured. No additional GA code is needed.

---

### Technical Details

- **Design consistency**: Uses the same card styles (`rounded-xl border border-border/50 bg-card-gradient shadow-card`), hover effects (`hover:shadow-card-hover hover:scale-[1.02]`), section spacing (`py-20 md:py-28`), and typography patterns as Services and Pricing pages
- **Hero pattern**: Same dark overlay on `heroBanner` image with white text, matching all other pages
- **Icons**: Uses lucide-react icons (Users, Globe, Rocket, Heart, Target, MapPin, etc.)
- **Google Form link**: Same `GOOGLE_FORM` URL used across the site for CTAs
- **Responsive**: Grid layouts using `sm:grid-cols-2 lg:grid-cols-3` patterns
- **Animations**: Consistent `animate-fade-in` and hover transitions
- **No new dependencies required**

