

## Plan: Add "Estimated Starting Investment" Section to Calculator Results

### What Changes

**Single file edit: `src/components/EventComplexityCalculator.tsx`**

Insert a new "Estimated Starting Investment" card between the Attendee Hub card (line ~344) and the action buttons (line ~346).

### Implementation

1. **Extract numeric price** from `result.price` (e.g. `"$2,199"` → `2199`) using a simple parse helper.

2. **Calculate total**: Event build price + ($1,999 if `attendeeHubSelected`).

3. **Render a new Card** with:
   - Title: "Estimated Starting Investment" with a DollarSign icon
   - Line item: "Event Build" — `Starting from {result.price}`
   - Conditional line item: "Event App Module" — `Starting from $1,999` (only if hub selected)
   - Separator line
   - Bold total: "Estimated Total" — formatted with `$` and commas

4. **Styling**: Use existing Card component with a `Separator` between line items and total. Consistent with current design system.

### Price Mapping
- Simple → $899
- Medium → $2,199
- Advanced → $3,499
- Complex → $4,999
- Attendee Hub → $1,999 (flat)

### No Changes To
- Scoring logic (`calculator-data.ts`)
- Lead submission (`LeadForm.tsx`)
- Pricing page
- Database schema

