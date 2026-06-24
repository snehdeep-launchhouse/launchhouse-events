## Problem
The current Chloe widget uses a fixed dark navy (`bg-slate-900/55`) glass tint with light text (`text-sky-50`). Over white sections of the site, content behind the panel disappears and text reads as washed-out light-on-light.

## Goal
Drop the fixed dark glass treatment and make Chloe's pill button + chat panel + messages adapt to whatever background is behind them, in real time as the user scrolls.

## Approach (UI only, `src/components/ReceptionistWidget.tsx`)

1. **Sample the background behind the widget on scroll/resize**
   - Add a small hook inside the widget that, on `scroll`, `resize`, and panel open, calls `document.elementsFromPoint(x, y)` at the widget's anchor point (bottom-right area) and walks up to find the first element with a non-transparent computed `backgroundColor`.
   - Parse that color, compute perceived luminance, and store a `theme: 'light' | 'dark'` in state. Throttle with `requestAnimationFrame` so it stays cheap.

2. **Drive glass tint from the sampled theme via CSS variables**
   - On the widget root, set inline CSS vars: `--chloe-surface`, `--chloe-border`, `--chloe-fg`, `--chloe-fg-muted`, `--chloe-hairline`.
   - Light backgrounds → translucent white surface (`rgba(255,255,255,0.55)`), dark border, `foreground` text.
   - Dark backgrounds → translucent dark surface (`rgba(15,23,42,0.55)`), light border, `sky-50` text.
   - Keep `backdrop-blur-xl` and the hairline highlight (purely visual, theme-agnostic).

3. **Rewrite the hard-coded classes to use the vars**
   - Pill button, panel shell, header, message bubbles (user + assistant), action buttons, textarea, and close button all switch from `bg-slate-900/55 … text-sky-50 … border-white/15` to `style={{ background: 'var(--chloe-surface)', color: 'var(--chloe-fg)', borderColor: 'var(--chloe-border)' }}` (or arbitrary Tailwind `[background:var(--chloe-surface)]` equivalents).
   - User bubble keeps a brand-tinted variant but also derived from the same theme so it reads in both modes.
   - Add a smooth `transition-colors duration-300` so the swap during scroll is not jarring.

4. **No logic / no other files changed**
   - No changes to message handling, `page_context`, suppression, Edge Function, analytics, deps, or any other component.
   - No changes outside `src/components/ReceptionistWidget.tsx`.

## Acceptance
- Scrolling the homepage from the dark navy hero into the white "What We Do" section visibly morphs Chloe's panel from a dark glass to a light glass, with text remaining legible the whole time.
- Content behind the panel is always faintly visible (true glass), never an opaque white slab.
- Pill button matches the same adaptive treatment.
- No behavior changes; no other UI touched.
