## Request a Demo Feature

Core Instruction: do not disrupt any existing feature 

### Overview

Add a 3-step "Request a Demo" sliding panel with Google Calendar integration for scheduling and automated confirmation emails via Resend.

### 1. Secret: `GOOGLE_CALENDAR_ID`

Prompt user to add the `GOOGLE_CALENDAR_ID` secret before proceeding.

### 2. Database: `demo_requests` table

```sql
CREATE TABLE public.demo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  business_email text NOT NULL,
  selected_products text[] NOT NULL DEFAULT '{}',
  scheduled_date date NOT NULL,
  scheduled_time text NOT NULL,
  additional_attendees text[] DEFAULT '{}',
  google_event_id text,
  google_meet_link text,
  google_event_link text,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.demo_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view" ON public.demo_requests
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active')
  );
```

### 3. Edge Function: `book-demo`

New function at `supabase/functions/book-demo/index.ts`:

- Receives: `firstName`, `lastName`, `email`, `products`, `date`, `time`, `timezone`, `additionalAttendees[]`
- **Google Calendar API flow:**
  - Build JWT from `GOOGLE_SERVICE_ACCOUNT_KEY` secret
  - Exchange for access token via Google OAuth
  - Call `GET /calendars/{GOOGLE_CALENDAR_ID}/freeBusy` for availability validation
  - Call `POST /calendars/{GOOGLE_CALENDAR_ID}/events?conferenceDataVersion=1` with:
    - Summary: "LaunchHouse Events Demo — {Product(s)}"
    - Attendees: main user + additional attendees
    - `conferenceData.createRequest` to auto-generate Google Meet link
  - Extract `hangoutLink` and `htmlLink` from response
- **Insert into `demo_requests**` with event details
- **Send confirmation email via Resend** to user + all attendees with: product, date/time, Meet link, event link for rescheduling
- Config: `verify_jwt = false` in config.toml

### 4. Edge Function: `get-demo-availability`

New function at `supabase/functions/get-demo-availability/index.ts`:

- Receives: `date` (ISO date string), `timezone`
- Queries Google Calendar FreeBusy API for the given date
- Returns available 30-minute slots between 9 AM–6 PM (calendar owner's working hours)
- Frontend applies 90-minute lead-time filter client-side based on user's local time

### 5. New Component: `src/components/RequestDemoPanel.tsx`

Sheet-based sliding panel (same pattern as `ContactUsPanel`), 3 steps:

- **Step 1 — User Details:** First Name, Last Name, Business Email with existing `EmailInput` + domain verification. "Next" disabled until email verified.
- **Step 2 — Product Selection:** Reuses exact `SERVICE_OFFERINGS` array from ContactUsPanel. Multi-select checkboxes in 2-column grid. At least one required.
- **Step 3 — Schedule:** 
  - Calendar component (react-day-picker) for date selection, min date = today
  - On date select, fetch available slots from `get-demo-availability`
  - Display time slots as selectable chips, filtered to exclude anything < 90 min from now
  - "Additional Attendees" section: input field + "Add" button to collect extra email addresses (validated with regex)
  - "Confirm Booking" button submits to `book-demo` edge function
- **Confirmation screen:** Shows confirmed date/time, Google Meet link, event link, and lists attendees

### 6. `src/components/DemoPanelProvider.tsx`

Same pattern as `ContactPanelProvider`: context with `openDemoPanel()`, renders `<RequestDemoPanel />` once at provider level.

### 7. `src/components/ContactPanelProvider.tsx`

Merge both providers into one file or wrap `DemoPanelProvider` alongside. Simplest: add `openDemoPanel` to the existing provider context, render both panels.

### 8. `src/components/Navbar.tsx`

- Add "Request a Demo" button next to "Contact Us" on desktop (solid primary variant, visually highlighted)
- "Contact Us" becomes `variant="outline"` to make "Request a Demo" stand out
- Mobile menu: add "Request a Demo" button above "Contact Us"
- Both call `openDemoPanel()` from context

### 9. `src/App.tsx`

- Listen for `?book-demo=true` URL parameter at the app level
- When detected, trigger `openDemoPanel()` on mount, then remove the param from URL

### Files Changed


| File                                                | Change                                                                  |
| --------------------------------------------------- | ----------------------------------------------------------------------- |
| Database migration                                  | Create `demo_requests` table with RLS                                   |
| `supabase/config.toml`                              | Add `book-demo` and `get-demo-availability` function entries            |
| `supabase/functions/get-demo-availability/index.ts` | New — fetch Google Calendar free/busy slots                             |
| `supabase/functions/book-demo/index.ts`             | New — create Google Calendar event + send Resend confirmation emails    |
| `src/components/RequestDemoPanel.tsx`               | New — 3-step Sheet form with calendar scheduling                        |
| `src/components/ContactPanelProvider.tsx`           | Add `openDemoPanel` to context, render both panels                      |
| `src/components/Navbar.tsx`                         | Add highlighted "Request a Demo" button, demote "Contact Us" to outline |
| `src/App.tsx`                                       | Handle `?book-demo=true` URL param to auto-open demo panel              |
