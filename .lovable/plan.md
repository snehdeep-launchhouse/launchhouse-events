
## Add Privacy Policy & Terms of Service to Footer

### Overview
Create two new dedicated pages — Privacy Policy and Terms of Service — tailored to LaunchHouse Events / Rina Event Tech. Add links to both in the footer that open in a new tab. The pages will follow the existing site design (dark theme, branded layout with Navbar and Footer).

### Content Approach
Both pages will be specifically written for LaunchHouse Events, not generic boilerplate:

**Privacy Policy** will cover:
- Data collected via the Build Request form (name, email, phone, company, event details)
- How data is used (service delivery only, no selling to third parties)
- Data storage and retention
- User rights (access, deletion requests via email)
- Contact: snehdeep@launchhouse.events
- Governing jurisdiction: India

**Terms of Service** will cover:
- Scope of services (Cvent event build and configuration)
- Client obligations (timely provision of assets, content, feedback)
- Delivery timelines and same-day delivery conditions (mirrors existing T&C on site)
- Revision rounds per service tier
- Payment terms (placeholder for you to fill in if needed)
- Limitation of liability
- Governing law: India

### Pages to Create

| File | Route | Purpose |
|---|---|---|
| `src/pages/PrivacyPolicy.tsx` | `/privacy-policy` | Full privacy policy page |
| `src/pages/TermsOfService.tsx` | `/terms-of-service` | Full terms of service page |

### Files to Update

| File | Change |
|---|---|
| `src/App.tsx` | Add two new routes: `/privacy-policy` and `/terms-of-service` |
| `src/components/Footer.tsx` | Add Privacy Policy and Terms of Service links that open in a new tab |

### Footer Layout After Change

```text
[ Logo ]    © 2025 LaunchHouse Events. A division of Rina Event Tech    [ Privacy Policy ]  [ Terms ]  [ Contact ]
```

On mobile it stacks vertically as the footer already does.

### Page Layout
Each policy page will:
- Use the existing `<Navbar />` and `<Footer />` for consistency
- Have a clean, readable layout with a page header and sectioned content
- Match the existing dark theme and typography of the site
- Be fully responsive on mobile

### No Database Changes Required
These are static content pages. No backend, no migrations, no edge functions needed.
