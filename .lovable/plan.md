
## Add Footer to the Build Request Form Page

### Overview
Add the existing site footer to the bottom of the `/build-request` page so users have a consistent branded experience throughout the form flow. Any links in the footer (currently just the Contact email link) will open in a new tab, and the layout will be responsive on mobile.

### What Needs to Change

**`src/pages/BuildRequest.tsx`** — two small updates:

1. **Import the Footer component** at the top of the file alongside the other imports.

2. **Add `<Footer />` below the closing `</div>` of the main page wrapper** (currently line 596), so it appears beneath the form card on every step — including the thank-you screen.

### Footer Link Behaviour
The existing Footer component has one link: `<a href="mailto:snehdeep@launchhouse.events">`. To open it in a new tab (consistent with the user's request), we'll update the `Footer` component to add `target="_blank" rel="noopener noreferrer"` to all anchor tags. This will apply everywhere the footer is used, which is appropriate.

### Mobile Consistency
The footer already uses a responsive layout (`flex-col md:flex-row`) so it stacks cleanly on mobile — no additional changes needed for mobile layout.

### Files to Change

| File | Change |
|---|---|
| `src/components/Footer.tsx` | Add `target="_blank" rel="noopener noreferrer"` to the Contact `<a>` tag |
| `src/pages/BuildRequest.tsx` | Import `Footer` and render it after the closing wrapper `</div>` on line 596 |

### Visual Result

```text
┌─────────────────────────────────┐
│  [Banner / Logo]                │
│  ┌───────────────────────────┐  │
│  │  Form card (steps 1-3)    │  │
│  │  or Thank You screen      │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  Footer: Logo | © Copy | Contact│  ← new
└─────────────────────────────────┘
```

No database changes, no new dependencies, no edge function changes required.
