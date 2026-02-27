Please discard the previous plan and implement this updated, enterprise-grade architecture for the Auto-Advance and Abandoned Tracking features. 

CRITICAL: Do NOT break any existing functionality (NY Timezone logic, "Slot Booked" scarcity UI, 90-minute lead time, or Google Calendar/Resend booking logic).

**1. Progressive Background Capture & Auto-Advance (UX & Lead Capture):**

- **Email is King:** Apply this to BOTH the 'Request a Demo' and 'Contact Us' forms. The exact millisecond `emailVerification` transitions to `"valid"`, fire a background API call/Supabase UPSERT to save the email and whatever is currently in the First/Last name fields. Do not wait for them to click Next.

- **Smooth Auto-Advance:** Update the `useEffect`. It should ONLY programmatically trigger `handleSubmit()` to advance to Step 2 if `emailVerification === "valid"` AND the `firstName` and `lastName` fields are strictly non-empty. This prevents premature "Name is required" validation errors if a user types their email first.

**2. Bulletproof Abandoned Form Tracking:**

- **Database Schema:** Create a table named `abandoned_demo_form` with columns: `id`, `session_id` (UUID to track the user's current session for upserts), `first_name`, `last_name`, `email`, `form_type` ('demo' or 'contact'), `last_step_reached`, `status` (default 'partial'), and `updated_at`.

- **Strict RLS:** The public role must ONLY have `INSERT` and `UPDATE` (UPSERT) privileges matching their specific `session_id`. Strictly NO public `DELETE` privileges. Do not expose our leads to malicious wiping.

- **Drawer Close:** If the user closes the drawer `handleOpenChange(false)`), update the database row status to 'abandoned'.

- **Tab Close Fallback:** Implement a `window.addEventListener("beforeunload", ...)` hook. If the user closes the browser tab while a form is in progress, use `navigator.sendBeacon()` or a synchronous fetch to update their database row status to 'abandoned' before the browser kills the session.

**3. Secure Admin Notifications (Backend Webhooks):**

- **Security:** Do NOT invoke the `notify-abandoned-form` Edge Function directly from the React frontend, as an open endpoint can be spammed. 

- **Database Trigger:** Configure a Supabase Database Webhook (Trigger). When a row in `abandoned_demo_form` has its status updated to 'abandoned', the Postgres database itself should securely invoke the Edge Function.

- **Email Delivery:** The Edge Function will use our Resend API to send a summary alert (Name, Email, Form Type) to BOTH `snehdeep@launchhouse.events` and `sam@launchhouse.events`.

**4. Admin Dashboard Updates:**

- Update the existing Admin Dashboard UI to fetch and display records from `abandoned_demo_form` (where status is 'abandoned') in a clean table format so our sales team can easily follow up on lost leads.

**5. Strict 30-Minute Meeting Duration (Demo Form Only):**

- Ensure the 'Request a Demo' frontend calendar UI only displays and allows the selection of exact 30-minute time slots.

- In the `book-demo` Edge Function, strictly enforce that the Google Calendar event duration is exactly 30 minutes `end.dateTime` = `start.dateTime` + 30 mins).

- Ensure the generated Google Meet link and the `.ics` calendar file attached to the Resend email also rigidly reflect this exact 30-minute block.