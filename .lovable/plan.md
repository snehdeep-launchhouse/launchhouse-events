## Goal

Produce a single PDF — `Calculator-Logic-Spec.pdf` — that fully documents the Event Complexity Calculator on `/calculator`, so you have a precise reference when upgrading or fixing it.

This is a one-off artifact. No code in the app changes.

## What the PDF will cover

**1. Overview & Entry Points**
- Route: `/calculator` → `src/pages/Calculator.tsx`
- Main component: `EventComplexityCalculator.tsx`
- Two entry flows: manual Q&A and AI "Describe Your Event" (`DescribeEvent.tsx` → `analyze-event` edge function)

**2. The 13 Questions (full catalog)**
For each question: ID, prompt text, options, point values, single vs multi-select. Sourced from `src/lib/calculator-data.ts`.

**3. Scoring Engine (step-by-step)**
- Stage 1 — Base score: sum of all answer values except `cvent_products`
- Stage 2 — Inferred products (Speakers → Abstract; Appointments → Appointments)
- Stage 3 — Base tier thresholds: ≤12 Simple, ≤18 Medium, ≤25 Advanced, >25 Complex
- Stage 4 — Minimum-tier overrides: Advanced branding → ≥Medium; 4+ reg paths → ≥Advanced
- Stage 5 — Product-count overrides (Attendee Hub explicitly excluded): 2 products → ≥Advanced, 3+ → Complex
- Stage 6 — Final result mapping (price, first draft, revision turnaround) per tier
- Worked examples for each tier

**4. Attendee Hub Module (separate pricing track)**
- Triggered by selecting "Attendee Hub / Event App"
- Triggers a follow-up features step (Agenda, Networking, Push, Gamification, Exhibitors)
- Flat $1,999 add-on, excluded from complexity scoring

**5. Pricing & Timeline Table**
Tier → Starting price, First Draft SLA, Revision SLA, plus Hub add-on.

**6. Scope Summary Generator**
Mapping of answers → bullet points (`generate-scope-summary.ts`), used in UI, PDF, and lead emails.

**7. UI / UX Flow**
Step progress, Hub features sub-step, results gate behind `LeadForm`, post-submit reveal of result cards, PDF download (`generate-results-pdf.ts`).

**8. Lead Capture & Persistence**
- `LeadForm.tsx` → inserts into `event_complexity_leads` (column mapping table included)
- Email validation: format check + DNS/MX via `verify-email-domain` edge function (blocks generic providers)
- Required fields, event date, complexity, price, products, hub flags, scope summary

**9. Integrations & Connections**
- Supabase table: `event_complexity_leads` (column list)
- Edge functions: `analyze-event` (Lovable AI Gateway, Gemini), `verify-email-domain`, `send-lead-notification`
- AI Receptionist (`receptionist-chat`) — gated from revealing prices
- Admin Report page consumes the leads table
- Results PDF generator (`generate-results-pdf.ts`)

**10. Known Quirks / Upgrade Candidates**
- Attendee Hub deliberately excluded from product count & overrides
- "Not sure" Cvent option counts toward selection length but is filtered from product list
- `cvent_products` answer value = count of selections (not a weighted score)
- Inferred products auto-hidden from the multi-select to avoid double-counting
- AI analyzer doesn't infer Attendee Hub features (only top-level products)

**11. File Reference Index**
Quick table of every file involved, with one-line purpose each.

## How it will be built

- Python + `reportlab` (Platypus) for a clean, branded multi-page PDF
- Brand colors: Signature Blue `#006AE1`, dark `#141D2B`
- Tables for questions, scoring tiers, DB column mappings, file index
- Visual QA: render to images with `pdftoppm`, inspect every page, fix issues, re-render
- Output saved to `/mnt/documents/Calculator-Logic-Spec.pdf` and surfaced via `<presentation-artifact>`

## Out of scope (this task)

- No edits to calculator code, schema, or UI
- No recommendations for changes beyond noting quirks; we'll discuss upgrades after you review the spec
