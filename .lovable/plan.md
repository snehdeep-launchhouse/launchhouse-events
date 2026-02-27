

## Mobile Optimization for Request a Demo

### Changes

#### 1. `src/components/RequestDemoPanel.tsx`
- Use `useIsMobile()` hook to detect mobile
- On mobile: render as a `Drawer` (bottom sheet via vaul) instead of `Sheet` (right panel)
- Add `text-base` (16px) class to all `Input` fields to prevent iOS auto-zoom
- Time slot buttons: add `min-h-[44px] min-w-[44px]` for touch targets
- Calendar container: add `w-full max-w-[calc(100vw-3rem)]` to prevent horizontal overflow on 320px screens
- Time slots grid: change to `grid-cols-2 sm:grid-cols-4` on mobile for larger tap targets
- Drawer version gets a large close button in header

#### 2. `src/components/ui/sheet.tsx`
- No changes needed — mobile will use Drawer instead

#### 3. `src/components/Navbar.tsx`
- Add a sticky fixed "Request a Demo" button at the bottom of the screen on mobile (visible when mobile menu is closed)
- Use `md:hidden fixed bottom-0 left-0 right-0 z-40` with safe-area padding
- Keep the button in the mobile hamburger menu as well

#### 4. `src/index.css`
- Add `env(safe-area-inset-bottom)` padding utility for the sticky mobile CTA

### Files Changed

| File | Change |
|------|--------|
| `src/components/RequestDemoPanel.tsx` | Conditional Drawer vs Sheet rendering, 16px inputs, 44px touch targets, calendar width constraints |
| `src/components/Navbar.tsx` | Add sticky bottom mobile CTA button |
| `src/index.css` | Safe-area-inset padding for bottom sticky button |

