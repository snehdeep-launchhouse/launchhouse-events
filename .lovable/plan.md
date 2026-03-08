

## Plan: Restore Original Pricing Page & Keep Calculator Components for Chatbot

### Step 1 — Rewrite `src/pages/Pricing.tsx` (original static page)

Replace the entire calculator-based pricing page with the original static layout matching other pages' pattern (Navbar → Hero → Sections → CTA → Footer):

- **Hero section** with `pricing-banner.jpg` background, title "Transparent, Complexity-Based Pricing", subtitle, and CTA button
- **Event Build Tiers** — 4 cards (Simple $899, Medium $2,199, Advanced $3,499, Complex $4,999) with delivery SLAs and feature lists
- **Same Day Delivery** — 12-hour turnaround details with requirements callout
- **Payment Options** — 50/50 split and 100% advance (10% discount) cards
- **Attendee Hub & Event App** — Standard, Rush, Premium Hub tiers
- **Additional Services** — Training, Post Launch Support, Custom Tasks (from existing `PricingSection.tsx` data)
- **CTA banner** with `pricing-cta-banner.jpg` and "Get a Quote" button

No calculator imports. No chat state machine. Pure static content.

### Step 2 — Verify calculator component files still exist

These files are already present and will remain untouched (confirmed they exist):
- `src/components/ChatBubble.tsx`
- `src/components/OptionButtons.tsx`
- `src/components/ResultCard.tsx`
- `src/components/LeadForm.tsx`
- `src/components/DescribeEvent.tsx`
- `src/lib/calculator-data.ts`

### Step 3 — Verify chatbot still works

The `ReceptionistWidget` is already lazy-loaded in `App.tsx` (line 96-98) and runs globally. The `receptionist-chat` edge function is deployed. No changes needed — the chatbot widget continues to work independently in the bottom-right corner across all pages.

### What stays the same
- All edge functions (`receptionist-chat`, `analyze-event`, etc.)
- Database table `event_complexity_leads`
- Calculator component files (available for future chatbot integration)
- `ReceptionistWidget` in `App.tsx`
- CSS variables (chat tokens, success tokens already in `index.css`)
- Tailwind config

### Summary
Only one file changes: `src/pages/Pricing.tsx` — rewritten from calculator to static pricing page.

