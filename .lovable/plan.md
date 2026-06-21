Update Pricing page so all calculator links point to /calculator and open in a new tab, and replace the bottom CTA button.

Scope: src/pages/Pricing.tsx only. No routing, DB, edge function, or other page changes.

Changes:
1. "How Our Pricing Works" inline calculator link (currently <Link to={CALCULATOR_URL}>) — switch to an external-style anchor that opens /calculator in a new tab.
2. "Try our Complexity Calculator →" arrow link below the paragraph — switch to a new-tab anchor to /calculator.
3. Build Packages "Get a tailored estimate" link on Medium/Advanced/Complex cards — switch to a new-tab anchor to /calculator.
4. Attendee Hub & Training "Get Started" buttons (currently navigate(CALCULATOR_URL)) — switch to window.open(CALCULATOR_URL, "_blank").
5. Bottom CTA banner "Book a Free Consultation" button — change label to "Pricing Calculator" and open /calculator in a new tab.

All links use CALCULATOR_URL = "/calculator" (which App.tsx already routes to CalculatorV2), so every calculator entry from Pricing is consistent.