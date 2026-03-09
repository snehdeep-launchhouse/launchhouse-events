

# Plan: Create EventComplexityCalculator on Hidden /calculator Route

## What We're Building
A standalone `/calculator` page containing the Event Complexity Calculator component. The route will be functional but hidden from all navigation menus — accessible only by direct URL. The Pricing page remains completely untouched.

## Files to Create/Modify

### 1. Create `src/components/EventComplexityCalculator.tsx`
- Multi-step wizard using the existing `questions` array from `calculator-data.ts`
- Each step shows one question with `OptionButtons` for selection
- Progress bar via the existing `Progress` component
- After all questions: compute result via `calculateResultWithTrace()`, display complexity tier + pricing
- Render the existing `LeadForm` beneath the result for lead capture
- Auto-infer Cvent products from answers; filter the product multi-select question accordingly
- Smooth transitions between steps using CSS animations (no new deps needed — project already has `animate-fade-in` / `animate-slide-up` in Tailwind config)

### 2. Create `src/pages/Calculator.tsx`
- Minimal page wrapper: Navbar + centered calculator + Footer
- No SEO meta / no sitemap entry — keeps it hidden from search engines
- Page title set to generic "Calculator" via `useEffect`

### 3. Modify `src/App.tsx`
- Add lazy-loaded route: `<Route path="/calculator" element={<Calculator />} />`
- No navigation links added anywhere — route is hidden, direct-access only

## Component Architecture

```text
Calculator (page)
 └── EventComplexityCalculator
      ├── Progress bar (step X of N)
      ├── Question text
      ├── OptionButtons (single or multi-select)
      ├── Result card (complexity + price + turnaround)
      └── LeadForm (pre-filled with answers + products)
```

## Calculator Flow
1. Show questions 0–12 sequentially (from `calculator-data.ts`)
2. For `cvent_products` question: filter out already-inferred products using `getFilteredCventOptions()`
3. On completion: call `calculateResultWithTrace()` with all answers + selected products
4. Display result card with complexity tier, starting price, and turnaround times
5. Show LeadForm passing `answers`, `selectedProducts`, and `result` as props

## No Changes To
- Pricing page (`src/pages/Pricing.tsx`) — completely untouched
- Navigation menus — no links to `/calculator` added
- Database schema — uses existing `event_complexity_leads` table

