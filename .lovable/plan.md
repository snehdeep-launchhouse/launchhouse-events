## Problem

Chloe's chat panel uses the same liquid-glass palette as Quick Index (dark slate + white text), but Quick Index sits over a dimmed full-screen scrim while Chloe floats directly over a light page. The translucent `bg-slate-900/55` + heavy blur lets the bright page bleed through, washing out the white text and message bubbles.

## Fix (UI only, `src/components/ReceptionistWidget.tsx`)

1. **Panel surface** — raise opacity so text contrast matches Quick Index over its scrim.
   - `bg-slate-900/55` → `bg-slate-900/90`
   - Drop the `supports-[backdrop-filter]:bg-white/[0.06]` override that was thinning the surface
   - Keep `backdrop-blur-xl`, ring, hairline highlight, sky-glow underlay

2. **Header** — strengthen divider (`border-white/15`) so the title block reads as a distinct band.

3. **Message bubbles** — make both roles solid enough to read:
   - Assistant: `bg-white/[0.08]` → `bg-white/15`, text `text-slate-50`
   - User: `bg-sky-300/20` → `bg-sky-400/30`, border `border-sky-200/60`, text `text-white`
   - Keep rounded shape and shadow

4. **Typing indicator + action buttons + input** — bump background to `bg-white/15` / `bg-white/[0.18]` and use `text-slate-50` / `placeholder:text-slate-300/70` so they match the readable Quick Index list items.

5. **Send button** — `bg-white/[0.18]` with `text-slate-50` for the same contrast level as Quick Index's close button.

No logic, no copy, no layout, no pill changes — the floating "Ask me anything" pill stays exactly as it is (it already matches Quick Index).

## Out of scope

- Edge function, prompts, routing, auto-open behavior
- The Quick Index component itself
- Any non-checklist page
