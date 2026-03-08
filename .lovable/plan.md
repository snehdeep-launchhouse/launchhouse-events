
## Plan: Auto-collapse Chat Widget Pill

### Objective
Reduce visual clutter by automatically collapsing the "Ask me anything" button to just the icon after 5 seconds on the page, while maintaining accessibility by re-expanding it on hover.

### Changes to `src/components/ReceptionistWidget.tsx`

1. **Add Collapse State**
   - Introduce an `isExpanded` state variable initialized to `true`.
   - Add a `useEffect` hook to automatically set `isExpanded` to `false` after a 5000ms delay.

2. **Update Button Layout & Styling**
   - Attach `onMouseEnter={() => setIsExpanded(true)}` and `onMouseLeave={() => setIsExpanded(false)}` to the floating button so it intuitively expands when the user hovers over it.
   - Conditionally apply padding and gap classes based on the state:
     - Expanded: `gap-2.5 pl-4 pr-2 py-2` (Current design)
     - Collapsed: `gap-0 p-2` (Creates a perfectly circular 56x56px button)
   
3. **Smooth Width Transition**
   - Wrap the "Ask me anything" text span in a new `div` that handles the transition.
   - Expanded state classes: `max-w-[200px] opacity-100`
   - Collapsed state classes: `max-w-0 opacity-0`
   - Apply `overflow-hidden`, `whitespace-nowrap`, and `transition-all duration-300` to the wrapper to create a smooth, layout-stable slide-and-fade effect.

### Impact
The button will draw attention on initial page load for 5 seconds to educate the user that the AI assistant is available, then quietly tuck itself away to a minimal floating chat icon. It remains easily discoverable via hover interaction on desktop.
