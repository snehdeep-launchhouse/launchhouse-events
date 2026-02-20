
## Update Registration Options — Add "Multiple Days" and "Both"

### What's Changing
The last question on the Get a Quote form — **"What registration options will be available to attendees?"** — currently has two checkboxes:
- Single Days Only
- Full Day

It will be updated to three checkboxes:
- Single Days Only
- Multiple Days
- Both

"Full Day" is replaced with "Multiple Days" and a third option "Both" is added.

### Files to Change

| File | Change |
|---|---|
| `src/pages/GetAQuote.tsx` | Update line 34: change `REGISTRATION_OPTIONS` constant from `["Single Days Only", "Full Day"]` to `["Single Days Only", "Multiple Days", "Both"]` |

### Technical Notes
- The Zod schema for `registrationOptions` is already `z.array(z.string()).min(1, …)` — it accepts any string values, so no schema change is needed.
- The edge function (`send-quote-request`) stores the selection as a `text[]` array — it will correctly store whichever options are submitted, no backend change needed.
- The checkbox render loop uses `REGISTRATION_OPTIONS.map(...)` so the third option appears automatically.
- The flex row layout (`flex flex-col sm:flex-row`) will accommodate three chips cleanly on desktop; on mobile they stack vertically.
- No database migration is needed — the `registration_options text[]` column stores whatever strings are submitted.
