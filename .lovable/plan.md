

# Chat Widget Best Practices & Animation Enhancements

## Two tasks to implement:

### 1. ReceptionistWidget Best Practices (src/components/ReceptionistWidget.tsx)

**Auto-open after idle time:**
- Auto-open the chat pill after **30 seconds** of page idle time (industry standard: 15-60s, 30s balances engagement vs. annoyance)
- Only trigger once per session using `sessionStorage` flag
- Do NOT auto-open on mobile (disruptive on small screens)
- Do NOT auto-open if user previously dismissed the widget in this session

**Auto-collapse if no interaction:**
- If auto-opened and user takes no action (no typing, no clicking inside) for **15 seconds**, auto-close it back to the pill
- Reset this timer on any user interaction within the widget

**Pill attention pulse:**
- Add a subtle pulse/bounce animation to the pill after 10 seconds to draw attention before auto-open
- Stop pulsing once user has interacted

**Session persistence:**
- Track `hasInteracted`, `hasDismissed`, and `hasAutoOpened` in sessionStorage so the widget doesn't repeatedly nag

### 2. Animation Enhancements (src/index.css + widget)

**Pill entrance:** Slide-up + fade-in when pill first appears on page load (delayed 1s after mount)

**Pill pulse:** Gentle scale pulse keyframe (`1 → 1.05 → 1`) applied before auto-open

**Chat panel open:** Scale-up from bottom-right origin + fade-in (replace current simple fade-in)

**Chat panel close:** Scale-down + fade-out transition before unmounting

**Message bubbles:** Staggered slide-up animation for each new message

### 3. Hero banner preload fix (index.html)

Remove the `<link rel="preload" as="image" href="/hero-banner.jpg">` from `index.html` head. Instead, add a conditional preload only on the home page route within the `Index.tsx` component using a `useEffect` that dynamically injects the preload link tag.

## Files to modify:
- `src/components/ReceptionistWidget.tsx` -- all widget logic changes
- `src/index.css` -- new keyframes for pulse, scale-up-from-corner, message-slide
- `index.html` -- remove hero-banner preload line
- `src/pages/Index.tsx` -- add dynamic preload for hero-banner

