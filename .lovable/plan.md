## Goal
Replace the current white/grey panel surface on **Contact Us** and **Book a Consultation** with a more transparent, light sky-blue-tinted liquid-glass look — inspired by the Quick Index drawer, but kept light so the dark form copy stays readable.

## Files
- `src/components/ContactUsPanel.tsx`
- `src/components/RequestDemoPanel.tsx`

## Changes

### 1. Panel surface (`glassPanelClass` in both files)
Swap the white base for a translucent sky tint with stronger blur, plus a soft sky highlight/glow borrowed from Quick Index:

- Background: `bg-sky-50/55 supports-[backdrop-filter]:bg-sky-100/35`
- Blur: keep `backdrop-blur-2xl backdrop-saturate-150`
- Inset ring: `ring-1 ring-inset ring-white/50` (light sheen)
- Border: `border-sky-200/50` (replace `border-primary/20`)
- Shadow: keep `shadow-[0_30px_80px_-20px_rgba(0,106,225,0.25)]`
- Top hairline: `before:via-white/60` (brighter sheen)
- Bottom glow: `after:from-sky-300/20` (sky wash, like Quick Index's `from-sky-400/15`)

### 2. Headers
- Border: `border-sky-200/40` instead of `border-primary/15`
- Keep `text-foreground` / `text-muted-foreground` for readability

### 3. Inner cards (step containers, confirmation card, "Need to reach us sooner?" card)
- Replace `bg-white/70` with `bg-white/55 supports-[backdrop-filter]:bg-white/40`
- Border: `border-sky-200/50`
- Keep `backdrop-blur-md` and `shadow-card`

### 4. Selectable tiles (service-offering / product checkboxes)
- Unselected: `border-sky-200/50 bg-white/45`
- Selected: `border-primary/45 bg-sky-100/60`
- Hover: `hover:bg-white/70 hover:border-primary/40`

### 5. Drawer close button (RequestDemoPanel)
- `bg-white/55 backdrop-blur-md hover:bg-white/75` with `border-sky-200/50`

## Out of scope
- No changes to inputs, EmailInput, Calendar, Checkbox primitives, Buttons, step indicator pills, validation, copy, routing, or analytics.
- No changes to Chloe, Quick Index, shared `sheet.tsx` / `drawer.tsx`, design tokens, or Tailwind config.

## Readability guarantee
Surfaces stay light (sky-50/55 to white/40 range) so dark `text-foreground` / `text-muted-foreground` retain full contrast. Sky tint is decorative only.
