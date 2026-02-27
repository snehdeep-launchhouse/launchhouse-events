

## Gaps vs. Requirements

The feature is already built with mobile responsiveness, `?book-demo=true` trigger, Google Calendar + Meet + Resend integration, and the 3-step flow. The following specific requirements are **not yet implemented**:

| Requirement | Current State |
|---|---|
| Company logo on every step | Missing — only title text |
| Force NY timezone (America/New_York) with visual indicator | Uses browser's local timezone |
| "High Demand" scarcity banner above calendar | Missing |
| Show busy slots as disabled/greyed "Slot Booked" buttons | Busy slots are hidden; only available ones shown |
| Confirmation screen shows NY time | Shows browser timezone |
| Edge function uses NY timezone for event creation | Uses client-sent timezone |

### Plan

#### 1. `src/components/RequestDemoPanel.tsx`
- Import `Logo` component and render it at the top of every step (inside `formContent`, before the step indicator)
- Hardcode `timezone = "America/New_York"` instead of reading from browser
- Add visual indicator: `"All times shown in New York Time (ET)"` label near the calendar
- Add scarcity banner: styled alert above the calendar reading "High Demand: Limited Demo Slots Available"
- Pass `timezone: "America/New_York"` to `get-demo-availability` and `book-demo`
- Modify `fetchAvailability` to also request **all** 30-min slots (9:00–17:30) and mark busy ones
- Update state: change `availableSlots` to an array of `{ time: string; available: boolean }` objects
- Render busy slots as greyed-out, disabled buttons with "Slot Booked" text; available slots as bright clickable buttons
- Update confirmation screen to show "ET" instead of browser timezone
- 90-minute lead time filter: compute cutoff in NY time using date-fns-tz or manual UTC offset

#### 2. `supabase/functions/get-demo-availability/index.ts`
- Return **both** available and busy slots so the frontend can render them
- Change response shape to `{ slots: Array<{ time: string; available: boolean }>, date, timezone }`
- Generate all 30-min slots 09:00–17:30, mark each as available/busy based on FreeBusy response

#### 3. `supabase/functions/book-demo/index.ts`
- Update email template to always display "ET" (New York Time) instead of the client timezone string
- Format the time label as `formatTime12h(time) + " ET"` in both the confirmation and internal emails

### Files Changed

| File | Change |
|---|---|
| `src/components/RequestDemoPanel.tsx` | Add logo, NY timezone, scarcity banner, busy slot UI |
| `supabase/functions/get-demo-availability/index.ts` | Return both available + busy slots |
| `supabase/functions/book-demo/index.ts` | Force NY timezone label in emails |

