

## Plan: Gate Pricing Behind Lead Capture

### What Changes

**Current flow:** User completes calculator questions → sees full result card (complexity tier, pricing, timelines, products) → then sees lead capture form below.

**New flow:** User completes calculator questions → sees lead capture form with a teaser message ("Enter your details to unlock your pricing estimate") → after submitting, the full result card (pricing, timelines, products) is revealed.

### Implementation Details

#### 1. EventComplexityCalculator.tsx — Restructure the result page

- Add a `leadSubmitted` state boolean (default `false`).
- On the result page, **show the lead form first** with a heading like "You're almost there! Enter your details to see your custom pricing."
- **Hide** the result card (complexity, price, timelines, products) until `leadSubmitted` is `true`.
- Pass an `onSubmitted` callback to `LeadForm` so the parent knows when submission succeeds.
- After submission, animate the result card into view and show the "Schedule a Consultation" / "Start Over" buttons.

#### 2. LeadForm.tsx — Add onSubmitted callback

- Accept a new optional prop `onSubmitted?: () => void`.
- Call `onSubmitted()` after successful save (alongside the existing `setSubmitted(true)`).
- Update the submitted success state to be more celebratory since it now reveals pricing — e.g. "Your results are ready!"

#### 3. Receptionist Chat Bot — Update system prompt

- Update **RULE 2 (Pricing questions)** in the `receptionist-chat` edge function so instead of giving exact pricing tiers, the bot says something like: "To see your custom pricing, try our **Event Complexity Calculator** — it takes under a minute, and you'll get your personalised estimate after entering your details."
- Remove the explicit `$899 / $2,199 / $3,499 / $4,999` figures from the pricing rule so the bot doesn't bypass the gate.
- Keep the general complexity tier names (Simple, Medium, Advanced, Complex) but without dollar amounts.

### Files Modified

| File | Change |
|------|--------|
| `src/components/EventComplexityCalculator.tsx` | Add `leadSubmitted` state; reorder result page to show lead form first, reveal pricing after submission |
| `src/components/LeadForm.tsx` | Add `onSubmitted` prop; update messaging to "enter details to see pricing" |
| `supabase/functions/receptionist-chat/index.ts` | Remove explicit pricing from RULE 2; direct users to calculator for pricing |

