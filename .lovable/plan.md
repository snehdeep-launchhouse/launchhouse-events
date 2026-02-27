

## Plan: Restore Domain-Wide Delegation in `book-demo` Edge Function

### Changes to `supabase/functions/book-demo/index.ts`

**1. Add `sub` (subject) to JWT claim set (line 23-29)**
Add `sub: "snehdeep@launchhouse.events"` to the JWT claim so the service account impersonates this user via Domain-Wide Delegation.

**2. Restore `conferenceDataVersion=1` in the Calendar API URL (line 173)**
Change the URL back to include `?conferenceDataVersion=1`.

**3. Restore `attendees` array and `conferenceData` block in the event payload (lines 180-186)**
- Add `attendees` array with the booker's email + any additional attendees
- Add `conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } } }`
- Keep the description with contact info as a fallback reference

**4. Update `meetLink` extraction (line 195)**
Already reads `eventData.hangoutLink` — no change needed, it will now be populated.

**5. Confirmation email**
The `buildConfirmationEmail` already uses `meetLink` for the "Join Google Meet" button — no change needed.

### Files Modified
| File | Change |
|---|---|
| `supabase/functions/book-demo/index.ts` | Add `sub` field, restore attendees + conferenceData |

No other files affected. Auto-deploys after save.

