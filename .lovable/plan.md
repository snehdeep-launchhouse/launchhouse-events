

## Diagnosis: Why Abandoned EB Forms Report Stopped Updating

### Root Cause

The MX validation fix we just deployed introduced a **side effect** on abandoned form tracking. Here's the chain:

1. The abandoned form upsert (`upsertAbandonedForm`) only runs inside `handleNext1` — the Step 1 form submit handler
2. The "Next" button is now disabled when `emailVerification === "invalid"`
3. Users who enter emails with invalid domains (or any email that fails MX lookup) **can never click Next**, so `upsertAbandonedForm` is **never called**
4. Result: the Abandoned EB Forms report gets zero new entries from users who drop off at Step 1 with problematic emails — which is precisely the audience you want to track

### Edge Function Audit

All five edge functions are healthy and responding correctly:

| Function | Status | Notes |
|----------|--------|-------|
| `verify-email-domain` | Working | Returns `valid: true` for gmail.com, `valid: false` for bogus domains |
| `send-build-request` | Working | DB insert + Drive + emails all functional |
| `send-quote-request` | Working | No errors in logs |
| `invite-admin` | Working | No errors in logs |
| `send-reset-password` | Working | No errors in logs |

Database has 8 existing partial records — data integrity is intact. Realtime is enabled on the table. RLS policies are permissive and correctly configured.

### Fix

Decouple abandoned form tracking from form progression. Track the partial submission on **email blur** (after basic format validation passes) rather than waiting for the user to click "Next."

### Changes

#### `src/pages/BuildRequest.tsx`

1. **Add an `onBlur` callback to the email field** that saves partial data immediately after the user finishes typing their email — regardless of MX validation outcome
2. The existing `upsertAbandonedForm(1)` call inside `handleNext1` stays as-is (updates the record when the user actually proceeds)
3. Guard the blur-triggered upsert with basic format validation only (no MX check needed for tracking)

### Technical Details

Add a new handler in `BuildRequest.tsx`:

```typescript
const handleEmailBlurTracking = useCallback(() => {
  const data1 = form1.getValues();
  // Only track if email has valid format (don't track garbage input)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data1.email && emailRegex.test(data1.email) && data1.firstName && data1.lastName) {
    upsertAbandonedForm(1);
  }
}, []);
```

Then pass an `onBlur` prop to the `EmailInput` on Step 1 that calls this handler. The `EmailInput` component already forwards standard input props, so this requires no changes to `EmailInput.tsx`.

### Files Summary

| File | Change |
|------|--------|
| `src/pages/BuildRequest.tsx` | Add blur-triggered abandoned form tracking on the email field |

No edge function changes needed — all are functioning correctly.

