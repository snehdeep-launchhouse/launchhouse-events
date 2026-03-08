

## Plan: Mobile Optimization for Chat Widget and Contact Panels

### Issues Found

1. **ContactUsPanel: No mobile Drawer** — Uses `Sheet` on all devices. `RequestDemoPanel` correctly switches to a bottom `Drawer` on mobile, but `ContactUsPanel` does not. Right-side sheets are awkward on mobile (hard to reach close button, no swipe-to-dismiss).

2. **ContactUsPanel: Missing iOS zoom prevention** — Input fields lack `text-base` class, so iOS Safari auto-zooms on focus (font-size < 16px).

3. **ContactUsPanel: Missing min touch targets** — Buttons don't have `min-h-[44px]` like `RequestDemoPanel` does.

4. **ReceptionistWidget: Close button too small** — The X button uses `p-1` with a 16px icon = ~24px touch target. Needs 44px minimum.

5. **ReceptionistWidget: No safe-area handling** — On notched iPhones, the input area can be obscured by the home indicator.

### Changes

#### 1. `src/components/ContactUsPanel.tsx`
- Import `useIsMobile`, `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`, `DrawerDescription`, `DrawerClose`
- Extract form content into a variable (like `RequestDemoPanel` does)
- Render `Drawer` on mobile, `Sheet` on desktop
- Add `text-base md:text-sm` to all `Input` and `EmailInput` fields
- Add `min-h-[44px]` to all `Button` components
- Use `flex-col-reverse` for navigation buttons (already present on step 2)

#### 2. `src/components/ReceptionistWidget.tsx`
- Increase close button touch target: `p-2` instead of `p-1`, icon stays `h-4 w-4` (total ~32px → add `min-w-[44px] min-h-[44px]`)
- Add `pb-safe` / `env(safe-area-inset-bottom)` padding to the input area for notched devices
- Add `touch-manipulation` to action buttons to eliminate 300ms tap delay

### No changes needed for:
- `RequestDemoPanel` — already has Drawer on mobile, `text-base`, `min-h-[44px]`, `flex-col-reverse`
- Streaming logic — works identically on mobile/desktop
- `ContactPanelProvider` — context integration is correct

