# LaunchHouse Events — Website & Holo AI Source-of-Truth Brief

This document is the approved source of truth for all website copy updates, Holo AI content generation, and Lovable prompt instructions. All content created from or about the LaunchHouse Events website must align with this brief.

---

## 1. Company Positioning

LaunchHouse Events helps US SMB and commercial event teams get more value from Cvent by supporting event registration builds, Cvent configuration, Attendee Hub, mobile app readiness, OnArrival/check-in preparation, event tech QA, reporting, and ongoing event support.

LaunchHouse Events is a professional services company — not a SaaS product. We are practitioners who build, configure, and manage event technology on behalf of teams that already have Cvent but need hands-on execution support.

---

## 2. Target Market

**Primary buyers:**
- US SMB and commercial companies running meetings, conferences, and corporate events
- Lean in-house event teams and marketing teams that manage events without dedicated Cvent support staff
- Meetings and events managers, corporate event planners, and executive assistants responsible for event registration
- Teams that already hold a Cvent license but lack the internal bandwidth or platform expertise to use it effectively

**They are NOT:**
- Large enterprise companies with dedicated in-house Cvent teams
- Event agencies looking to resell our services
- Companies evaluating Cvent for the first time (we support existing Cvent users)

---

## 3. Core Problem We Solve

Cvent is powerful, but many teams do not have the time, resources, or hands-on expertise to configure, test, and manage event builds properly. This creates launch delays, attendee experience issues, and last-minute stress.

**Specific pain points we address:**
- Registration pages that take too long to build internally
- No one on the team who knows how to configure Cvent correctly
- Last-minute panics before event launch dates
- Attendee Hub and mobile app left unconfigured or underutilized
- OnArrival and check-in technology not tested before event day
- Reports that do not exist or do not answer the right questions
- Post-launch issues with no one available to troubleshoot in real time

---

## 4. Core Benefits

- Launch cleaner Cvent-powered events faster
- Reduce internal workload and free up your team for higher-value work
- Avoid last-minute build issues and event-day surprises
- Improve the attendee registration and app experience
- Get practical event technology execution without adding full-time headcount
- Use transparent pricing instead of bloated agency retainers or unpredictable hourly billing

---

## 5. Approved Experience Claim

**Use only:** 15+ years of combined experience

**Do not use:**
- 30+ years
- 30 years collective experience
- Thirty-plus years
- Any variation that implies more than 15 years

This is the approved and factually correct claim. Any instance of "30+" on the website must be updated to "15+" before the site is used for LinkedIn sharing, Holo AI ingestion, or any external marketing.

---

## 6. Approved Pricing Language

- Simple builds start from **$899**
- Same-day delivery starts from **$1,199**
- Same-day delivery applies to simple builds and qualified medium builds
- Medium, Advanced, and Complex builds are priced on a custom quote basis
- No hidden fees. No bloated retainers. You pay for what your event actually needs.

**Approved framing for homepage and marketing:**
> Simple builds from $899. Same-day delivery from $1,199.

**Do not use:**
- "Starting at $1,199" as the base price anchor (this is the same-day price, not the entry price)
- Any pricing language that contradicts the Pricing page

---

## 7. Approved CTA Language

| Context | Approved CTA |
|---|---|
| Primary navbar and hero CTA | Book a Free Consultation |
| Quote request flow | Get a Quote |
| General contact or inquiry | Talk to Our Team |
| Same-day or urgent builds | Start Your Build |
| Pricing page bottom CTA | Book a Free Consultation |
| Services page bottom CTA | Get a Quote |

**Do not use "Request a Demo" as the primary CTA.** LaunchHouse Events is a professional services company, not a SaaS product. The "demo" framing creates a product expectation that does not match the service being offered. The underlying booking flow (calendar, form, Supabase integration) does not need to change — only the label.

---

## 8. CTA Trust Line

Use this line near or below primary CTAs to reduce conversion friction:

> One of our team members will reach out within 24 hours. No commitment required.

Variants approved for use:
- "We'll get back to you within 24 hours."
- "No pressure. No commitment. Just a conversation."
- "Free consultation. No obligation."

---

## 9. Credibility Line

Use this as a supporting trust statement on the homepage, about page, and in Holo-generated content:

> Built by practitioners with hands-on experience supporting event technology workflows across registration, attendee apps, and live event operations.

This line can be paired with the approved experience claim:

> 15+ years of combined experience. Built by practitioners who have worked across registration, attendee apps, and live event operations.

---

## 10. US Market Language Rules

All website copy, Holo-generated content, and Lovable prompts must use US English spelling. Apply these corrections wherever British English appears:

| British (do not use) | US English (use this) |
|---|---|
| programmes | programs |
| organisations | organizations |
| specialised | specialized |
| customised | customized |
| organisation | organization |
| programme | program |

**Currently found on the live website (must be corrected):**
- `Services.tsx` — "most organisations," "Complex programmes"
- `Pricing.tsx` — "enterprise programme"
- `PrivacyPolicy.tsx` — "organisation name," "organisational measures"

---

## 11. Services Holo Must Understand

Holo AI must be able to generate marketing content for each of the following services individually and collectively. Each service listed below is something LaunchHouse Events actively provides.

| Service | Plain-language Description |
|---|---|
| Cvent registration builds | Building the event registration website and form inside Cvent, including page design, registration types, session selection, and email confirmations |
| Cvent configuration | Setting up and configuring Cvent settings, custom fields, workflows, email templates, reports, and attendee management to match event requirements |
| Attendee Hub support | Building and configuring the Cvent Attendee Hub including branding, session schedules, speaker profiles, and web and app content |
| Mobile app readiness | Preparing and configuring the Cvent mobile event app including content, branding, and pre-launch testing |
| OnArrival / check-in preparation | Setting up and testing the Cvent OnArrival check-in system, badge printing, and on-site registration flow before event day |
| Event tech QA | End-to-end testing of the registration build, workflows, emails, and integrations before launch to catch issues before attendees do |
| Reporting and optimization | Building custom Cvent reports, analyzing registration data, and optimizing attendee conversion and event performance |
| Ongoing event support | Post-launch management including invitee updates, troubleshooting, real-time support during the live event, and content changes |

---

## 12. Implementation Guardrails

The following must never be changed without explicit approval, regardless of copy update instructions:

**Do not touch:**
- Any Supabase Edge Function invocations (`supabase.functions.invoke(...)`)
- Any Zod validation schemas or form field definitions
- Database table names, column names, or field mappings
- Backend integration logic in `supabase/functions/`
- Abandoned-form tracking logic (`upsertAbandoned`, `upsertAbandonedDemo`, `sendBeacon`)
- The `ContactPanelProvider`, `openContactPanel()`, or `openDemoPanel()` context wiring
- Any form submission handlers (`onFinalSubmit`, `onConfirmBooking`, `onStep1Submit`)
- Environment variables in `.env`
- Migration files in `supabase/migrations/`
- Email validation logic in `src/lib/email-validation.ts`
- The `TnCTooltip.tsx` legal content (requires separate legal review before changes)

**Safe to change (copy, labels, metadata only):**
- Text inside JSX string literals — headlines, descriptions, paragraph copy, button labels
- `document.title` values inside `useEffect` blocks
- `<meta>` tag content in `index.html`
- Adding a single new `<Route>` alias for `/contact` in `App.tsx`
- Adding a `document.title` `useEffect` to `Services.tsx` (currently missing)
- Updating `sitemap.xml` string values

**One approved structural addition:**
Add the following route to `src/App.tsx` to fix the `/contact` 404:
```tsx
<Route path="/contact" element={<GetAQuote />} />
```
This is a non-destructive alias. No existing routes are removed or modified.

---

## 13. Files Requiring Changes (Do Not Edit Without This Brief)

| File | What Needs Changing |
|---|---|
| `index.html` | Title, meta description, og tags, keywords (remove India-specific), JSON-LD schema |
| `src/components/HeroSection.tsx` | Experience claim (30+ → 15+), pricing anchor ($1,199 → from $899), CTA labels |
| `src/components/WhyUsSection.tsx` | "30+ Years Experience" → "15+ Years Experience," same-day pricing text |
| `src/components/Navbar.tsx` | "Request a Demo" → "Book a Free Consultation" in 3 locations |
| `src/components/RequestDemoPanel.tsx` | Panel title and description text only |
| `src/components/PricingSection.tsx` | Pricing anchor text |
| `src/pages/About.tsx` | Experience stat (30+ → 15+), body copy corrections |
| `src/pages/Services.tsx` | British spellings, missing service descriptions, add document.title |
| `src/pages/Pricing.tsx` | "programme" → "program" |
| `src/App.tsx` | Add `/contact` route alias |
| `public/sitemap.xml` | Add `/contact` entry |

---

*Last updated: 2026-05-03*
*This brief supersedes any conflicting copy currently on the live website.*
