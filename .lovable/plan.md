

## Post-Migration Validation & Configuration Audit

### Current State Summary

After thorough review of all systems, here is what exists and what needs fixing:

---

### SECTION 1 — Calculator Logic

**Status: CORRECT.** The `calculator-data.ts` implements the exact evaluation order:
1. Collect answers (12 questions)
2. Infer products from speakers/appointments answers
3. Calculate base score (sum of non-product answers)
4. Determine base tier via `tierFromScore` (<=12 Simple, <=18 Medium, <=25 Advanced, else Complex)
5. Apply minimum complexity rules (branding=3 → min Medium; reg_paths=3 → min Advanced)
6. Apply product overrides (Hub → min Medium; 2 products → min Advanced; 3+ → Complex)
7. Return highest via `maxComplexity`

Inferred products (speakers, appointments) are correctly merged with user-selected products before counting. All override rules match specification.

**No changes needed.**

---

### SECTION 2 — Database

**Status: CORRECT.** The `event_complexity_leads` table has all 19 specified columns plus `id` and `created_at`. RLS allows anonymous inserts and admin-only reads. The `LeadForm` component maps all calculator answer IDs to the correct DB columns.

**Action**: Test insert via the edge function curl tool to validate end-to-end.

---

### SECTION 3 — AI Receptionist Training

**Status: NEEDS UPDATE.** The current `receptionist-chat` system prompt has basic pricing knowledge but is missing:
- Full website content (services page details, deployment tiers, SLAs, additional services)
- Proper instruction to recommend the Event Complexity Calculator within the chatbot
- Knowledge about the About page (team, certifications, founding)
- Knowledge about expedited builds ($299-$599), Hub pricing ($1,999), specialist services ($75/hr)

**Action**: Rewrite the system prompt to include comprehensive site knowledge from all pages.

---

### SECTION 4 — Site Content Learning

**Action**: Extract key content from Index, Services, Pricing, and About pages and embed it into the receptionist system prompt as structured knowledge sections.

---

### SECTION 5 — Calculator + Chatbot Integration

**Status: NOT YET INTEGRATED.** The calculator components exist but the `ReceptionistWidget` does not use them. The chatbot is currently text-only.

**Action**: This is a significant feature (embedding interactive calculator UI inside the chat widget). For this audit, we will:
1. Update the system prompt so the AI verbally recommends the calculator and explains it can help
2. Add a "Try Calculator" button in the chatbot UI that could trigger the calculator flow

**Note**: Full interactive calculator-inside-chat is a larger feature. For now, the AI will recommend it and we can add a link/button.

---

### SECTION 6 — UX Verification

- Chat widget loads on all pages (confirmed: lazy-loaded in `App.tsx` lines 96-98)
- Mobile positioning: currently `bottom-5 right-5` — needs `bottom-20` on mobile to avoid sticky CTA bar (per memory, but code shows `bottom-5`)
- Consultation button links to `/request-demo` — but the route doesn't exist in `App.tsx`. It should use the demo panel via `ContactPanelProvider`
- Lead form confirmation: works (renders success card after insert)

---

### Implementation Plan

**Step 1**: Update `receptionist-chat` edge function system prompt with comprehensive site knowledge from all pages (services, pricing, about, delivery timelines, Cvent expertise).

**Step 2**: Fix the consultation link in `ReceptionistWidget` — change from `<a href="/request-demo">` to use `useContactPanel().openDemoPanel()` or link to `/?book-demo=true`.

**Step 3**: Fix mobile positioning of chat widget — add responsive `bottom-20` for mobile to clear sticky CTA.

**Step 4**: Add a "Try Calculator" action button in the chatbot that links to `/pricing` or opens the calculator flow (lightweight integration).

**Step 5**: Test the `analyze-event` and `receptionist-chat` edge functions via curl to confirm they respond correctly.

**Step 6**: Test a database insert to `event_complexity_leads` to confirm write path.

### Files to Modify
- `supabase/functions/receptionist-chat/index.ts` — expanded system prompt
- `src/components/ReceptionistWidget.tsx` — fix consultation link, mobile positioning, add calculator button

### Files NOT Modified
- `src/pages/Pricing.tsx` — untouched
- All other pages — untouched
- All calculator components — untouched
- Database schema — untouched

