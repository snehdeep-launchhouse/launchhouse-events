

## Advanced Event Planner Logic & Email Trigger Refactor

### Current State

- **Page 1** collects: firstName, lastName, email, companyName
- **Page 2** collects: dynamic planner contacts (fullName + email), primaryPocPhone, kickoff details, solutions
- **Backend** sends 3 hardcoded emails: internal to sam@, internal to snehdeep@, confirmation to `payload.email` (the submitter only). No emails go to planner contacts.

### Plan

#### 1. Frontend: "I am the Event Planner" Checkbox (Page 1 → Page 2 prefill)

**File: `src/pages/BuildRequest.tsx`**

- Add a new state: `const [isPlanner, setIsPlanner] = useState(false)`
- On Page 1, below the Company Name field, add a checkbox row: `"I am the Event Planner"`
- When the user navigates to Page 2 (`handleNext1`), if `isPlanner` is true, auto-populate `contacts[0]` (the Primary contact) with:
  - `fullName` = `${firstName} ${lastName}` from form1
  - `email` = `email` from form1
- The fields remain fully editable so the user can overtype them
- The prefill happens synchronously in the `handleNext1` callback before `setStep(2)` — no lag

#### 2. Backend: Deduplicated Email Triggers to All Contacts

**File: `supabase/functions/send-build-request/index.ts`**

Current email flow sends to exactly 3 recipients. The refactored flow:

```text
Step 1: Build a "Recipient Master List"
  - Internal team: sam@launchhouse.events, snehdeep@launchhouse.events → internal report email
  - Submitter: payload.email → confirmation email
  - All planner contacts: payload.contacts[*].email → planner notification email

Step 2: Deduplicate
  - Create a Set of all unique external emails (submitter + all planner contacts)
  - For each unique email, determine which templates they qualify for
  - If submitter email === a planner contact email → send ONE combined confirmation (not two separate emails)

Step 3: Send
  - Internal emails: always 2 (sam@ and snehdeep@) with the full report table
  - For each unique external recipient:
    - If they are the submitter AND a planner → send the confirmation template (which already covers both roles)
    - If they are only a planner (not the submitter) → send a new "planner notification" template informing them they've been listed as a contact
    - If they are only the submitter → send the existing confirmation template
  - Respect Resend's rate limit with 600ms delays between sends
```

**New planner notification email template** — a lightweight email saying:

> "Hi [Name], you've been listed as a planner contact for [Event Title] by [Submitter Name]. The LaunchHouse Events team will be in touch regarding the kick-off call."

Plus the Google Drive folder link if available.

#### 3. Database: Contacts Already Stored Correctly

The `build_requests.contacts` column is JSONB and already stores the full contacts array. No schema changes needed — the planner contact emails are already persisted and visible in the Ignition dashboard.

### Files to Edit

| File | Action |
|------|--------|
| `src/pages/BuildRequest.tsx` | Add `isPlanner` checkbox on Page 1; prefill contacts[0] on step transition |
| `supabase/functions/send-build-request/index.ts` | Refactor email sending: build recipient master list, deduplicate, send planner notifications to all contacts, add planner notification template |

### Technical Details

**Checkbox implementation:**
- Uses the existing `@radix-ui/react-checkbox` + `Checkbox` component from `src/components/ui/checkbox.tsx`
- Styled consistently with the form: placed in a `flex items-center gap-2` row with a label

**Prefill logic (no lag):**
```typescript
const handleNext1 = form1.handleSubmit(async (data) => {
  if (isPlanner) {
    const currentContacts = form2.getValues("contacts");
    currentContacts[0] = {
      fullName: `${data.firstName} ${data.lastName}`,
      email: data.email,
    };
    form2.setValue("contacts", currentContacts);
  }
  await upsertAbandonedForm(1);
  setStep(2);
});
```

**Deduplication algorithm (edge function):**
```typescript
// Build unique recipient map: email → { isSubmitter, plannerName? }
const recipientMap = new Map<string, { isSubmitter: boolean; plannerName: string }>();
recipientMap.set(payload.email.toLowerCase(), { isSubmitter: true, plannerName: "" });
for (const contact of payload.contacts) {
  const key = contact.email.toLowerCase();
  const existing = recipientMap.get(key);
  if (existing) {
    // Already in map (submitter) — mark but don't duplicate
    existing.plannerName = contact.fullName;
  } else {
    recipientMap.set(key, { isSubmitter: false, plannerName: contact.fullName });
  }
}
// Then iterate recipientMap to send appropriate template per recipient
```

**Rate limiting:** Each email send is followed by a 600ms sleep. With 2 internal + N external recipients, the function handles up to ~10 contacts comfortably within edge function timeout limits.

