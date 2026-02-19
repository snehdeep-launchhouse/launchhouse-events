
## Fix: Make the Terms of Service Page Fully Mobile-Friendly

### The Problem
The Scope of Services table (Section 1) renders as a 3-column HTML table on all screen sizes. On mobile:
- The 3 columns are too narrow to read comfortably
- Users must scroll horizontally to see the "Out of Scope" column
- The `overflow-x-auto` wrapper technically works but produces a poor reading experience

All other sections (headings, paragraphs, bullet lists, the delivery timelines table in Section 2) are already responsive.

### Solution: Card-Based Layout on Mobile, Table on Desktop

On **mobile** (below `md` breakpoint): replace the 3-column table with stacked service cards. Each card shows:
- Service name as a bold heading
- "What's Included" bullet list
- "Out of Scope" bullet list below it (if applicable), clearly labelled

On **desktop** (`md` and above): keep the existing 3-column table exactly as it is today.

This is a common, well-established pattern for displaying comparison tables on mobile.

### Visual Result

**Mobile (stacked cards):**
```text
┌─────────────────────────────────┐
│  Project Management             │
│  ─────────────────              │
│  INCLUDED                       │
│  · Event setup call             │
│  · Milestone walkthrough calls  │
│  · ...                          │
│                                 │
│  OUT OF SCOPE                   │
│  · Creation of graphics         │
│  · ...                          │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  Registration                   │
│  ...                            │
└─────────────────────────────────┘
```

**Desktop (unchanged 3-column table):**
```text
| Service     | Activities (In Scope) | Out of Scope |
|─────────────|───────────────────────|──────────────|
| Registration| · Path settings       | · No support |
| Agenda      | · Sessions            |              |
```

### Files to Change

| File | Change |
|---|---|
| `src/pages/TermsOfService.tsx` | 1. Update `TableRow` component to render a card layout on mobile (`md:hidden`) and keep the existing `<tr>` for desktop (`hidden md:table-row`). 2. Wrap the `<table>` in a `hidden md:block` div. 3. Add a `md:hidden` card list above the table that renders the same data as cards. |

### Technical Approach
- The `TableRow` component already receives `service`, `activities`, and `outOfScope` as props — we reuse the same data, just render it differently at different breakpoints.
- The "Project Management" row is an inline block (not using `TableRow`) — it will also get a card version for mobile.
- No new dependencies needed — pure Tailwind responsive classes.
- No routing, database, or edge function changes required.
