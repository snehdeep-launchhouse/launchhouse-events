

# Pre-Launch QA Audit Plan — Launchhouse AI Systems

This plan covers a comprehensive 10-section audit using automated testing, database queries, edge function calls, and browser-based validation.

---

## Section 1 — Calculator Logic Testing

**Approach:** Write a Deno test suite for `calculator-data.ts` logic covering 20+ configurations.

Create `supabase/functions/calculator-logic-test/index.ts` (temporary test edge function) or, better, write a frontend Vitest test file at `src/lib/calculator-data.test.ts` that imports `calculateResultWithTrace`, `getInferredProducts`, and runs 20+ scenarios:

**Test matrix (20 cases minimum):**

| # | Scenario | Key inputs | Expected tier |
|---|----------|-----------|--------------|
| 1 | Minimal event | All lowest values, no products | Simple |
| 2 | Simple with Reg only | Low scores + 1 product | Simple |
| 3 | Attendee Hub alone | Low score + Hub selected | Medium (override) |
| 4 | Advanced branding only | Low score + branding=3 | Medium (override) |
| 5 | 4+ reg paths, low score | reg_paths=3 | Advanced (override) |
| 6 | 2 products selected | Low score + 2 products | Advanced (override) |
| 7 | 3+ products | Low score + 3 products | Complex (override) |
| 8 | Speaker=YES infers Abstract | speakers=2 | Abstract in inferred list |
| 9 | Appointments=YES infers product | appointments=2 | Appointments in inferred list |
| 10 | Inferred + selected = 2 products | speakers=2 + Reg selected | Advanced |
| 11 | Inferred + selected = 3 products | speakers=2, appointments=2 + Reg | Complex |
| 12 | Hub + inferred speaker = 2 products | speakers=2 + Hub selected | Advanced |
| 13 | High base score alone | All high values, no products | Complex (score > 25) |
| 14 | Medium base score | Score ~15 | Medium |
| 15 | Advanced base score | Score ~22 | Advanced |
| 16 | Branding override doesn't downgrade | High score + branding=3 | Stays at higher tier |
| 17 | Reg paths override doesn't downgrade | Already Complex + reg_paths=3 | Stays Complex |
| 18 | "Not sure" product not counted | "Not sure" selected only | No product override |
| 19 | All overrides stacked | Hub + 4 reg paths + advanced branding | Complex |
| 20 | Edge: exactly score 12 | Sum = 12 | Simple |
| 21 | Edge: exactly score 13 | Sum = 13 | Medium |
| 22 | Edge: exactly score 18 | Sum = 18 | Medium |
| 23 | Edge: exactly score 25 | Sum = 25 | Advanced |
| 24 | Edge: score 26 | Sum = 26 | Complex |

**Validation rules verified:**
- `getInferredProducts` correctly infers Abstract from speakers>0 and Appointments from appointments>0
- Inferred products are counted in the product count for override rules
- "Not sure / Need help deciding" is excluded from product count
- Override rules use `maxComplexity` (never downgrade)

## Section 2 — Calculator User Flow Testing

**Browser automation test:**
1. Navigate to `/calculator`
2. Click through all 13 questions with specific answers
3. Verify result card appears with complexity, price, first draft, revision turnaround
4. Fill lead form (name, email, company)
5. Submit and verify confirmation message
6. Test on mobile viewport (375x812)

## Section 3 — Database Testing

**Actions:**
1. Query `event_complexity_leads` to verify schema matches all expected columns
2. After browser test submission, query the table to confirm the record was stored with all fields populated
3. Validate `created_at` has a default timestamp

## Section 4 — AI Receptionist Validation

**Use `curl_edge_functions` to send 5 test prompts** to `receptionist-chat`:
1. "How complex will my event be?"
2. "How much does a Cvent event build cost?"
3. "How long does it take to build an event?"
4. "Do you support Attendee Hub?"
5. "Can Launchhouse build a conference app?"

Verify each response references correct pricing, timelines, calculator, or consultation as appropriate per the system prompt rules.

## Section 5 — Website Knowledge Test

Included in Section 4 — the system prompt embeds all company knowledge. Verify responses reference specific services, pricing tiers ($899/$2,199/$3,499/$4,999), SLA timelines, and Cvent products.

## Section 6 — Consultation Redirect Test

**Findings from code review:**
- **Chat widget "Schedule Consultation" button** → calls `openDemoPanel()` which opens the Request Demo sliding panel. This is correct.
- **Calculator LeadForm "Schedule a Consultation" button** → submits the lead form to the database. It does NOT redirect to `/request-demo`. This is a lead capture form, not a redirect.
- **No `/request-demo` route exists** — the demo panel is a sheet/drawer overlay triggered by `openDemoPanel()`.

**Issue identified:** The calculator result page has no "Schedule Consultation" CTA that opens the demo panel. The LeadForm button saves data but doesn't open the demo workflow. We should add a separate "Schedule a Consultation" button on the result page that calls `openDemoPanel()`.

## Section 7 — Calculator + Chatbot Integration

Verify via Section 4 responses that:
- AI mentions the "Event Complexity Calculator" when asked about complexity/pricing
- AI references the "📊 Try Calculator" button
- The widget's "Try Calculator" button navigates to `/pricing` (code confirmed at line 271-276 of ReceptionistWidget)

**Issue identified:** The "Try Calculator" button navigates to `/pricing`, but the calculator is at `/calculator`. This is a bug — it should navigate to `/calculator`.

## Section 8 — Performance Testing

1. Check console logs for errors
2. Verify lazy loading of ReceptionistWidget in App.tsx (confirmed)
3. Verify calculator page loads without errors
4. Test mobile responsiveness at 375x812

## Section 9 — Security and Error Handling

1. Run the database linter
2. Verify RLS policies on `event_complexity_leads` (anonymous INSERT allowed, SELECT denied — confirmed)
3. Verify the receptionist-chat edge function doesn't expose system prompt in responses
4. Verify input sanitization — the edge function passes raw messages to AI gateway (acceptable since it's not SQL)
5. Check the LeadForm for basic client-side validation (name, email, company required — confirmed)

## Section 10 — Issues to Fix

Based on code review, these bugs need to be fixed:

1. **Calculator redirect bug**: `handleCalculator()` in ReceptionistWidget navigates to `/pricing` instead of `/calculator`
2. **Missing consultation CTA on result page**: After calculator results, there's no button to open the Request Demo panel — only the lead capture form
3. **AI system prompt references**: The system prompt tells users to go to the "Pricing page" for the calculator, but the calculator is at `/calculator` — the prompt should reference the correct location

---

## Implementation Sequence

1. Write Vitest test file for calculator logic (20+ cases) and run tests
2. Fix the `/pricing` → `/calculator` navigation bug in ReceptionistWidget
3. Add a "Schedule a Consultation" button on the calculator result page that opens the demo panel
4. Update the AI system prompt to reference `/calculator` correctly
5. Run browser tests for full user flow (desktop + mobile)
6. Query database to validate lead storage
7. Call receptionist-chat edge function with 5 test prompts
8. Run database security linter
9. Compile final report

