

## Block Generic Email Domains on All Forms

### Problem
The `TRUSTED_DOMAINS` set in `src/lib/email-validation.ts` currently **whitelists** generic providers (gmail.com, yahoo.com, etc.), letting them bypass MX verification. They need to be **blocked** instead, forcing users to submit with company email addresses.

### Changes

#### `src/lib/email-validation.ts`

1. Rename `TRUSTED_DOMAINS` to `BLOCKED_DOMAINS` and expand the list to cover more generic providers (e.g., `zoho.com`, `tutanota.com`, `fastmail.com`, `gmx.com`, `mail.com`, `inbox.com`, `pm.me`, `hey.com`, `proton.me`, etc.)

2. Add a new error message constant:
   ```
   GENERIC_DOMAIN_MESSAGE = "Please use your company email address. Generic email providers (Gmail, Yahoo, etc.) are not accepted."
   ```

3. In `verifyEmailDomain`, check `BLOCKED_DOMAINS` **first** and return `{ valid: false, message: GENERIC_DOMAIN_MESSAGE }` immediately — no MX check needed. Remove the old trusted-domain shortcut.

#### No other files change
The `EmailInput` component and all three forms (BuildRequest, GetAQuote, ContactSection) already use `verifyEmailDomain` and respect its result. The block will propagate automatically.

### Files

| File | Change |
|------|--------|
| `src/lib/email-validation.ts` | Flip trusted → blocked domain list, add generic-domain error message, reject blocked domains in `verifyEmailDomain` |

