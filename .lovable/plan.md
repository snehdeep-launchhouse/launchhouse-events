

## Plan: Add JSON-LD Structured Data for Organization Schema

### What this does
Adds machine-readable structured data to the site so Google can display rich results (knowledge panel, logo, contact info, social links) when people search for "LaunchHouse Events."

### Implementation

**Edit `index.html`** — Insert a `<script type="application/ld+json">` block in `<head>` containing:

- **Organization schema** with:
  - Name: LaunchHouse Events
  - URL: https://www.launchhouse.events
  - Logo: favicon.svg (absolute URL)
  - Description matching the meta description
  - Contact point (email: snehdeep@launchhouse.events, type: customer service)
  - Address: Bengaluru, Karnataka, India
  - Founded: 2025
  - `sameAs` array (for any social profiles like Twitter @LaunchHouseHQ)
  - `areaServed`: Global
  - `knowsAbout`: Cvent, Event Registration, Event Management

- **WebSite schema** with:
  - Name and URL
  - `potentialAction` SearchAction (optional, for sitelinks search box)

This is a single edit to `index.html`, adding ~35 lines of JSON-LD after the existing `<link rel="apple-touch-icon">` line.

