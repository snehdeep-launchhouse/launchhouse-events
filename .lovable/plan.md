Add US phone number +1 (571) 444-8523 to the marketing site in 4 places. No other changes.

Files to change

1. src/components/Footer.tsx
   - Add a `tel:+15714448523` anchor in the right-side flex row of links, between "Contact" and "Cookie Settings". Same styling class as siblings.

2. src/components/IgnitionFooter.tsx
   - Add the same `tel:` anchor in the right-side gap row alongside Privacy and Terms.

3. src/components/ContactSection.tsx (homepage Contact section — point 1)
   - Below the existing email row at the bottom, add a second row with a Phone icon + `tel:` link styled identically to the email line.

4. src/pages/About.tsx (About page CTA section — point 2)
   - Under the "Book a Free Consultation" button in the CTA, add a small white/translucent sub-line: "Prefer to talk? Call us at +1 (571) 444-8523" with the number as a `tel:` link.

Not changing
- Navbar (per user — phone will go inside the Contact Us form later).
- Any forms, drawers, or quote/build pages.
- No classNames, colors, or layout shifts beyond these added anchors.