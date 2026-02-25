

## Fix: Restore MX Record Validation

### Root Cause Analysis

The edge function `verify-email-domain` works correctly server-side — I tested it and it properly returns `{ valid: false }` for bogus domains like `nonexistent12345.com`.

The bug has **two causes**:

1. **Fail-open pattern in `email-validation.ts`**: Lines 64-68 and 76-79 catch any error from `supabase.functions.invoke` and return `{ valid: true }`. If the client-side call fails (network, CORS, auth header mismatch), the domain is silently accepted as valid.

2. **Forms don't block submission when domain is invalid**: All three forms (ContactSection, GetAQuote, BuildRequest) only disable the submit button when `emailVerification === "verifying"`. They never check for `emailVerification === "invalid"`, meaning a user can submit even after MX validation fails.

### Changes

#### 1. `src/lib/email-validation.ts` — Fail closed instead of open

- Change both error catch blocks (lines 64-68 and 76-79) to return `{ valid: false, message: "..." }` instead of `{ valid: true }`
- Update the error message constant to: `"This email domain is invalid or cannot receive mail"`

#### 2. `src/components/EmailInput.tsx` — No changes needed

The EmailInput component already correctly shows errors and reports status via `onVerificationChange`. It works as designed.

#### 3. `src/components/ContactSection.tsx` — Block submit on invalid domain

- Add `emailVerification === "invalid"` to the submit button's `disabled` condition
- Add a guard in `handleSubmit` to return early if `emailVerification !== "valid"` and the email is non-trusted

#### 4. `src/pages/GetAQuote.tsx` — Block submit on invalid domain

- Add `emailVerification === "invalid"` to the submit button's `disabled` condition (line ~586)
- The form already uses zod validation, but add a guard in the submit handler as a server-side backstop

#### 5. `src/pages/BuildRequest.tsx` — Block submit on invalid domain

- Add `emailVerification === "invalid"` to the Next button's `disabled` condition (line ~400)
- Also audit the planner contact EmailInput fields on page 2 — they currently don't track verification status. Add verification tracking for those fields too so bogus planner emails are also rejected.

### Files Summary

| File | Change |
|------|--------|
| `src/lib/email-validation.ts` | Fail closed on errors; update error message |
| `src/components/ContactSection.tsx` | Disable submit when `emailVerification === "invalid"` |
| `src/pages/GetAQuote.tsx` | Disable submit when `emailVerification === "invalid"` |
| `src/pages/BuildRequest.tsx` | Disable submit when `emailVerification === "invalid"`; track planner email verification |

### Technical Details

**email-validation.ts error handling change:**
```typescript
// BEFORE (fail open):
if (error) {
  console.error("Domain verification error:", error);
  return { valid: true };  // ← BUG: accepts bogus domains on error
}

// AFTER (fail closed):
if (error) {
  console.error("Domain verification error:", error);
  return { valid: false, message: DOMAIN_INVALID_MESSAGE };
}
```

**Submit button pattern (all forms):**
```typescript
// BEFORE:
disabled={emailVerification === "verifying"}

// AFTER:
disabled={emailVerification === "verifying" || emailVerification === "invalid"}
```

**Error message update:**
```typescript
export const DOMAIN_INVALID_MESSAGE = "This email domain is invalid or cannot receive mail.";
```

