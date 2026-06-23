## Goal

Bring the same liquid-glass aesthetic from Chloe / Quick Index to the **Book a Free Consultation** (`RequestDemoPanel`) and **Contact Us** (`ContactUsPanel`) side-panels, while keeping every form input, label, error, and helper text fully readable and on-brand (Signature Blue `#006AE1`).

## Direction (brand-tuned, not dark slate)

Chloe/Quick Index use a dark slate glass because they float as small surfaces. A full-height side panel with dense forms can't use that palette — labels, helper text, calendar, checkboxes, and `Input`s would all need overrides and contrast would suffer. Instead, apply a **light brand-tinted glass** that reads the same liquid-glass language (hairline highlight, sky/blue glow, backdrop blur, ring) but keeps text on a light surface for readability.

Tokens (all via `bg-*/opacity` + brand blue, no new design tokens):
- Panel surface: `bg-white/75 supports-[backdrop-filter]:bg-white/60 backdrop-blur-2xl backdrop-saturate-150`
- Border + ring: `border border-primary/20 ring-1 ring-inset ring-white/40`
- Top hairline sheen + bottom primary-tinted glow (matching the `before:` + bottom-glow pattern from Quick Index, swapped to brand primary instead of sky)
- Shadow: `shadow-[0_30px_80px_-20px_rgba(0,106,225,0.25)]` (Signature Blue tinted drop)
- Overlay scrim: keep Sheet's default but soften to `bg-slate-950/40 backdrop-blur-[2px]` so the page reads softly behind, matching Quick Index

## Changes

### 1. `src/components/RequestDemoPanel.tsx`
- Add liquid-glass classes to `<SheetContent>` (desktop) and `<DrawerContent>` (mobile) via `className`
- Add a top hairline + bottom brand glow as absolutely-positioned `aria-hidden` siblings inside the panel wrapper
- `SheetHeader` / `DrawerHeader`: transparent background, keep title in `text-foreground`, description in `text-muted-foreground` — both stay readable on the light glass
- Inner form cards (`rounded-xl border border-border bg-card`) → `rounded-xl border border-primary/15 bg-white/70 backdrop-blur-md shadow-card` so they feel like floating glass cards on the panel
- Inputs, EmailInput, Calendar, Checkboxes, Buttons: **no changes** (they already render on light surface and stay readable)
- Step indicator pills: keep current primary/muted treatment (already on-brand)

### 2. `src/components/ContactUsPanel.tsx`
- Same `SheetContent` / `DrawerContent` glass treatment
- Same inner-card softening to `bg-white/70 backdrop-blur-md`
- Service-offering checkbox tiles: soften background to `bg-white/60 hover:bg-white/80 border-primary/15` for cohesion
- Confirmation panel card: same glass-card treatment
- All copy, validation, fields, and logic untouched

### 3. Optional shared scrim
- Pass a `bg-slate-950/40 backdrop-blur-[2px]` overlay class via the existing `SheetContent`/`DrawerContent` — handled inside the two panel files only; do not modify `src/components/ui/sheet.tsx` or `drawer.tsx` (keeps the change scoped to these two surfaces).

## Readability guarantees
- Text stays on a light surface (`bg-white/60`+) so foreground tokens render at full contrast — no white-on-translucent issues.
- Labels keep `text-sm font-semibold` on `text-foreground`.
- Helper / muted copy keeps `text-muted-foreground` which already passes contrast on white.
- Error text keeps `text-destructive`.
- Brand blue accents (border, glow, hairline) reinforce LaunchHouse identity without dimming text.

## Out of scope
- No logic, copy, validation, routing, or analytics changes.
- No edits to shared `sheet.tsx` / `drawer.tsx` primitives.
- Chloe and Quick Index stay as-is.
- No new design tokens or Tailwind config changes.
