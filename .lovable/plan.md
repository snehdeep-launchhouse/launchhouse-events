# Quick Index — Active Section Tracking + Liquid Glass Refinement

Two scoped refinements to the Quick Index overlay on `/pre-launch-checks`. Visual + presentation only. No content, routing, PDF, analytics, or backend changes.

## 1. Auto-updating active section indicator

**Goal:** As the user scrolls, the bubble for the currently-visible section is visually marked as active, and updates live. Opening the overlay reflects the user's current location.

**How:**
- New `useActiveSection(ids: string[])` hook inside `QuickIndexDrawer.tsx`.
- Uses a single `IntersectionObserver` watching all destination targets (`orientation`, `timing-guide`, each `section-*`, `red-flags`, `launchhouse-lens`, `guardrails`).
- `rootMargin` tuned so the active section is the one whose heading sits just below the fixed site header (e.g. `-{headerClearance}px 0px -55% 0px`), giving stable, non-flickery transitions.
- Tracks the topmost intersecting entry; falls back to the last-passed section when none intersect (e.g. at page bottom).
- Re-measures `--nav-height` once on mount and on `resize`.
- Runs regardless of overlay open/closed state so the indicator is correct the moment the overlay opens — but observer is created once at component mount, not on each open.

**Visual treatment of the active bubble:**
- Stronger blue tint: `bg-sky-300/25`, `border-sky-200/55`.
- Left inset accent: a 3px rounded `bg-sky-300` bar inside the bubble (absolute, left-1.5, top/bottom inset).
- `aria-current="location"` on the active button.
- Subtle `ring-1 ring-sky-300/40` glow.
- No layout shift between active/inactive states (same paddings, same height).
- Respects `prefers-reduced-motion` — color transitions only, no pulse.

**Behavior preserved:** click-to-navigate, scroll-clearance fix, focus management, Escape/backdrop close, Scroll-to-Top button, destination order, labels.

## 2. Liquid-glass effect for the overlay UI

**Goal:** Replace the current flat translucent panel with a true "liquid glass" look (Apple visionOS / iOS 26 style) — layered translucency, refracted light, soft inner highlights, depth.

**Scope:** Only the floating cluster inside `QuickIndexDrawer.tsx` (panel container, bubbles, header chip, close button, Scroll-to-Top). The trigger button, scrim, and page content stay as-is.

**Techniques (CSS-only, no new deps):**
- **Panel container:**
  - `backdrop-blur-2xl` + `backdrop-saturate-150`
  - Layered backgrounds: base `bg-white/5`, plus a `bg-gradient-to-br from-white/10 via-white/[0.03] to-sky-300/10` overlay
  - Top inner highlight: `before:` pseudo with `bg-gradient-to-b from-white/20 to-transparent`, `h-px` style top edge sheen
  - Bottom inner shadow: `after:` pseudo with soft sky tint
  - Outer shadow: deeper `shadow-[0_30px_80px_-20px_rgba(8,47,112,0.6)]`
  - Border: `border-white/15` with `ring-1 ring-inset ring-white/10`
  - Subtle noise/grain via inline SVG `background-image` (data-uri, ~1KB) at 4% opacity to break up the blur banding
- **Bubbles (inactive):**
  - `bg-white/[0.06]` + `backdrop-blur-md`
  - Top edge highlight via `before:` gradient line
  - Soft inner shadow on hover
  - Border `border-white/15`, hover `border-white/30`
- **Bubble (active):** as described in section 1, layered on top of the glass treatment.
- **Close + Scroll-to-Top:** matching glass chip styling.
- All gradients use white/sky tints already in the palette — no new tokens needed.

**Accessibility / fallbacks:**
- Keep WCAG-AA text contrast: text remains `text-slate-50` / `text-sky-50` on the dark scrim background.
- `@supports not (backdrop-filter: blur(1px))` fallback: solid `bg-slate-900/85` so the panel stays legible on browsers without backdrop-filter.
- `motion-reduce:` disables hover-lift; color transitions remain.
- Mobile: same effects, lighter blur (`backdrop-blur-xl`) to keep perf reasonable on low-end devices via `md:backdrop-blur-2xl`.

## Files touched

- `src/components/pre-launch/QuickIndexDrawer.tsx` — add hook, active state, glass styling.

No other files. No changes to `ChecklistSection.tsx`, `content.ts`, scroll-clearance logic, PDF flow, header/footer, global CSS, or routing.

## Validation

- `npx tsc --noEmit`
- `npx vitest run src/lib/pre-launch/content.test.ts`
- `npx vite build`
- Manual: scroll page top→bottom, confirm active bubble updates smoothly for Orientation, Section A, Section J, Section N, Red Flags, Guardrails. Open overlay mid-scroll, confirm correct bubble pre-highlighted. Click navigation still lands with 40px clearance. Reduced-motion + mobile widths verified.

## Out of scope

- No changes to bubble order, labels, or copy.
- No new dependencies (no `react-intersection-observer`, no glassmorphism libraries).
- No edits to other pre-launch components or global tokens.
