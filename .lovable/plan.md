# Mobile footer: Cookie Settings hidden by chat widget

On mobile the chat widget sits at `bottom-20 right-3` (above the sticky "Book a Free Consultation" CTA bar), occupying roughly the bottom-right 200px×45px of the viewport. The current footer links row (`flex flex-wrap gap-6`) wraps to a second line where "+1 (571) 444-8523" is on the left and "Cookie Settings" lands on the right — directly under the chat bubble.

`pb-28` on the footer was not enough to clear both the sticky CTA and the floating widget.

## Fix (visual only — `src/components/Footer.tsx`)

1. Stack the links container vertically on mobile so each item is on its own centered row (Cookie Settings is no longer pinned to the right edge where the widget sits). Keep the horizontal flex-wrap layout from `sm` upward.
   - Links container: `flex flex-wrap gap-6 text-sm text-muted-foreground` → `flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:gap-6 text-sm text-muted-foreground`

2. Increase mobile bottom padding so the whole footer content sits above the widget + sticky CTA stack (~sticky CTA 70px + widget 45px + spacing).
   - `<footer>`: `py-12 pb-28 lg:pb-12 border-t border-border/50` → `py-12 pb-40 lg:pb-12 border-t border-border/50`

No changes to functionality, links, or desktop layout (≥lg unchanged; sm/md gets a tidy wrapped row).
