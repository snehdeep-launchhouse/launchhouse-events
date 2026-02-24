

## Smart Email Validation for Public Forms

### Scope

Three public forms need enhanced email validation:
1. **Build Request** (`src/pages/BuildRequest.tsx`) — primary email + POC contact emails
2. **Get A Quote** (`src/pages/GetAQuote.tsx`) — single email field
3. **Contact Section** (`src/components/ContactSection.tsx`) — single email field (no zod, uses basic state)

### Current State

- Build Request and Get A Quote already use `zod` with `.email()` — basic format check only, no domain validation.
- Contact Section uses raw `useState` with no validation beyond `type="email"`.

### Plan

**Step 1: Create a shared email validation utility** (`src/lib/email-validation.ts`)

- Export a strict regex that requires `name@domain.tld` where the TLD is at least 2 characters (catches `test@test`).
- Export a `validateEmail(value: string)` function returning `{ valid: boolean; message?: string }`.
- Export a custom zod `.refine()` helper for use in zod schemas.

```
Regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
```

**Step 2: Create a reusable `EmailInput` component** (`src/components/EmailInput.tsx`)

- Wraps the existing `Input` component.
- Accepts standard input props plus an optional `value` or react-hook-form `register` props.
- Shows real-time visual feedback:
  - Empty → neutral (no indicator)
  - Valid → green border + small green checkmark icon
  - Invalid → red border + helper text "Please enter a valid email address."
- All validation is client-side only; no API calls.

**Step 3: Update the three forms**

| Form | Change |
|------|--------|
| **BuildRequest** | Replace `.email()` in both `requestorSchema` and `pocContactSchema` with custom `.refine()` using the shared validator. Swap `<Input type="email">` for `<EmailInput>` on all email fields. |
| **GetAQuote** | Same zod `.refine()` swap. Swap `<Input>` for `<EmailInput>`. |
| **ContactSection** | Add inline validation using the shared `validateEmail` function on the email `onChange`/`onBlur`. Swap to `<EmailInput>`. |

**Step 4: Styling**

- Valid state: `ring-green-500 border-green-500` + a `CheckCircle2` icon (already imported in some files).
- Invalid state: `ring-destructive border-destructive` + error message text below.
- Transitions on border color for polish.

### Files to Create/Edit

| File | Action |
|------|--------|
| `src/lib/email-validation.ts` | **Create** — regex, validator, zod refine helper |
| `src/components/EmailInput.tsx` | **Create** — reusable input with live feedback |
| `src/pages/BuildRequest.tsx` | **Edit** — update zod schemas + swap input components |
| `src/pages/GetAQuote.tsx` | **Edit** — update zod schema + swap input component |
| `src/components/ContactSection.tsx` | **Edit** — add validation + swap input component |

### Technical Details

- Zero backend calls — purely client-side regex + visual UX.
- The `EmailInput` component uses `onBlur` to trigger validation (avoids noisy errors while typing) and re-validates on every change once the field has been "touched."
- Zod `.refine()` ensures the same regex runs at form submission time, providing a consistent double-check.

