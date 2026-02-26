

## Mobile Consistency Fixes

After reviewing the codebase, I found these issues where mobile doesn't match the updated desktop experience:

### Issues Found

1. **HeroSection "Talk to Us" button** — Still calls `scrollTo("#contact")`, but `ContactSection` was removed from the homepage. This button does nothing on mobile or desktop. It needs to open the Contact Us panel instead.

2. **Navbar mobile layout** — The "Contact Us" button and hamburger icon sit side-by-side in the top bar, which can feel cramped on narrow screens (< 375px). The mobile menu already has a full-width "Contact Us" button inside it, so the top-bar button is redundant on mobile.

3. **Footer "Contact" link** — Points to `mailto:snehdeep@launchhouse.events`. This is fine functionally but could be updated to be consistent with the new contact flow (minor).

### Changes

#### 1. `src/components/HeroSection.tsx`
- Remove the `scrollTo` function and `#contact` reference.
- Accept an `onContactClick` prop (callback) to open the contact panel.
- The "Talk to Us" button calls `onContactClick()` instead of scrolling.

#### 2. `src/pages/Index.tsx`
- Lift `contactOpen` state up to `Index` (or pass it through).
- Actually, since `Navbar` already owns the `ContactUsPanel`, the simplest approach: make `HeroSection` also trigger the panel via a shared mechanism.
- **Approach:** Move `contactOpen` state and `<ContactUsPanel />` rendering from `Navbar` into a shared context, OR simply have `HeroSection` dispatch a custom event that `Navbar` listens to. The cleanest option: move the panel state to `Index` and pass callbacks down to both `Navbar` and `HeroSection`.

**Revised approach (simpler):** Create a tiny context `ContactPanelContext` that provides `openContactPanel()`. Wrap the app (or just the layout) with it. Both `Navbar` and `HeroSection` consume it. This avoids prop-drilling across pages.

#### 3. `src/components/Navbar.tsx`
- Hide the top-bar "Contact Us" button on mobile (`hidden md:inline-flex` — it's already partially there but line 61 shows a second button for mobile). Remove the duplicate mobile button from the top bar since it's already in the mobile dropdown menu.

#### 4. `src/components/ContactPanelProvider.tsx` (new)
- Creates a React context with `openContactPanel` function and `contactOpen` state.
- Renders `<ContactUsPanel />` once at the provider level.
- Consumed by `Navbar` and `HeroSection`.

### Files

| File | Change |
|------|--------|
| `src/components/ContactPanelProvider.tsx` | New — context provider for contact panel state |
| `src/components/HeroSection.tsx` | Use context to open panel instead of scrolling to removed section |
| `src/components/Navbar.tsx` | Use context instead of local state; remove duplicate mobile button from top bar |
| `src/App.tsx` | Wrap routes with `ContactPanelProvider` |

