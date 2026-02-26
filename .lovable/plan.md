

## Updated Plan: Contact Us Form + Abandoned Contact Tracking

### Overview

Transform the Get a Quote page into a 2-step Contact Us form, remove the old contact section, update navigation, and add full abandoned form tracking with Ignition admin visibility.

---

### 1. Database Migration

#### a. Make `quote_requests` columns nullable

The new simplified form won't collect event details, so these columns need to accept nulls:

```sql
ALTER TABLE quote_requests
  ALTER COLUMN event_type DROP NOT NULL,
  ALTER COLUMN event_type_new_or_clone DROP NOT NULL,
  ALTER COLUMN registration_types_count DROP NOT NULL,
  ALTER COLUMN sessions_count DROP NOT NULL,
  ALTER COLUMN event_launch_date DROP NOT NULL,
  ALTER COLUMN registration_options SET DEFAULT '{}';

ALTER TABLE quote_requests
  ALTER COLUMN event_type SET DEFAULT '',
  ALTER COLUMN event_type_new_or_clone SET DEFAULT '',
  ALTER COLUMN registration_types_count SET DEFAULT '',
  ALTER COLUMN sessions_count SET DEFAULT '',
  ALTER COLUMN event_launch_date SET DEFAULT '';
```

#### b. Create `abandoned_contact_requests` table

```sql
CREATE TABLE public.abandoned_contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  business_email text NOT NULL,
  last_active_step integer NOT NULL DEFAULT 1,
  captured_data jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'partial',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.abandoned_contact_requests ENABLE ROW LEVEL SECURITY;

-- Public can insert and update (upsert from frontend)
CREATE POLICY "Allow public insert" ON public.abandoned_contact_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.abandoned_contact_requests
  FOR UPDATE USING (true) WITH CHECK (true);

-- Admins can select for Ignition dashboard
CREATE POLICY "Admins can view" ON public.abandoned_contact_requests
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE status = 'active'
    )
  );

-- Admins can delete/archive from Ignition
CREATE POLICY "Admins can delete" ON public.abandoned_contact_requests
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE status = 'active'
    )
  );

-- Public can delete own record on successful submission (matched by email)
CREATE POLICY "Public can delete own" ON public.abandoned_contact_requests
  FOR DELETE USING (true);
```

#### c. Enable realtime for the new table

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.abandoned_contact_requests;
```

---

### 2. `src/pages/GetAQuote.tsx` — Complete rewrite as Contact Us form

**Two-step form:**

- **Step 1:** First Name, Last Name, Business Email (using existing `EmailInput` with domain validation). "Next" button.
- **Step 2:** Multi-select checkboxes in a compact 2-column grid for 9 offerings, plus an "Additional Information" textarea. "Submit" button.

**Offerings:**
1. Event Registration And Website
2. Attendee Hub (Website and/or Event App)
3. Appointments
4. Abstract Management
5. Survey
6. On Arrival (Onsite/Badge Creation)
7. Creative Services
8. Post Launch Services
9. Trainings

**Abandoned tracking logic:**
- When user completes Step 1 and clicks "Next", upsert into `abandoned_contact_requests` keyed on `business_email` with `last_active_step: 1`.
- On Step 2, any change to checkboxes or textarea triggers a debounced (1.5s) upsert updating `captured_data` with current selections/comments and `last_active_step: 2`.
- On successful final submission to `quote_requests`, delete the matching `abandoned_contact_requests` row by email.

**Submission:** Maps fields to existing edge function — `fullName` = `firstName + " " + lastName`, `cventTechnologies` = selected offerings, `cventTechnologiesOther` = additional info. Other fields sent as empty strings/defaults.

**Confirmation screen:**
- Title: "Thank You for Reaching Out!"
- Body: "We'll get back to you within 3–4 business hours."
- No quote number displayed.
- Urgent contact section: email `sam@launchhouse.events`, phone `+919999063734`
- WhatsApp button: links to `https://wa.me/919999063734?text=Hi%2C%20I%20just%20submitted%20a%20contact%20request%20on%20LaunchHouse%20Events.%20My%20name%20is%20{firstName}%20{lastName}.` — opens WhatsApp natively on any device.

**Page title:** "Contact Us — LaunchHouse Events"
**Banner text:** "Contact Us" / "Tell us what you need and we'll be in touch shortly"

---

### 3. `src/components/Navbar.tsx`

- Remove the `{ label: "Contact", href: "#contact", type: "scroll" }` entry from `navLinks`.
- Change both "Get Started" buttons to "Contact Us" buttons that use `navigate("/get-a-quote")` (same tab) instead of `window.open("/build-request", "_blank")`.
- The EB form at `/build-request` remains fully functional and accessible — only the nav button changes.

---

### 4. `src/pages/Index.tsx`

- Remove `ContactSection` import and its `<Suspense>` wrapper from the page.

---

### 5. `src/App.tsx`

- Add `/contact-us` route pointing to the same `GetAQuote` component for a cleaner URL (both routes work).

---

### 6. `supabase/functions/send-quote-request/index.ts`

- Change internal email subject to "New Contact Request" (keep internal quote number for tracking).
- Update submitter confirmation email:
  - Remove quote number display.
  - Subject: "We've received your contact request — LaunchHouse Events"
  - Body: "We'll get back to you within 3–4 business hours."
  - Add urgent contact info: `sam@launchhouse.events`, phone `+919999063734`.
- All recipients (sam@ and snehdeep@) remain unchanged.

---

### 7. `src/pages/AdminReport.tsx` — Ignition dashboard updates

- Add `"abandoned_contact"` to the `ReportType` union.
- Add a new report card: "Abandoned Contact Requests" with description "Contact form submissions that were not completed" and a `UserX` or `ClipboardList` icon variant.
- Add to `HIDDEN_COLUMNS`: `abandoned_contact: ["id", "created_at", "updated_at", "captured_data"]`.
- Add fetch logic for `abandoned_contact_requests` table, ordered by `updated_at desc`, filtered to `status = 'partial'`.
- Add record count query for the new table.
- Add realtime listener for `abandoned_contact_requests` to auto-refresh.
- Add a "Delete" action button per row (calls `supabase.from("abandoned_contact_requests").delete().eq("id", row.id)`) for admins to clean up records.
- Rename the existing "Quote Requests" card to "Contact Requests" to match the new form.

---

### Files Changed

| File | Change |
|------|--------|
| Database migration | Make quote columns nullable; create `abandoned_contact_requests` table with RLS |
| `src/pages/GetAQuote.tsx` | Rewrite as 2-step Contact Us form with abandoned tracking |
| `src/components/Navbar.tsx` | Remove Contact link, change Get Started → Contact Us |
| `src/pages/Index.tsx` | Remove ContactSection |
| `src/App.tsx` | Add `/contact-us` route |
| `supabase/functions/send-quote-request/index.ts` | Update email subjects/content, remove quote number from user email |
| `src/pages/AdminReport.tsx` | Add Abandoned Contact Requests report card with delete action |

