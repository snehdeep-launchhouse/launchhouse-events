

## Real-Time DNS & MX Record Email Validation

### Approach

Create a backend function that performs DNS/MX lookups, then integrate it into the existing `EmailInput` component. The check fires `onBlur` after the existing regex passes, with a client-side cache for trusted domains.

### Architecture

```text
User types email → onBlur → regex check (client)
                              ↓ pass
                     domain in cache? → yes → use cached result
                              ↓ no
                     call verify-email edge function
                              ↓
                     DNS MX lookup via Deno.resolveDns()
                              ↓
                     return { valid, hasMx }
                              ↓
                     cache result + show UI feedback
```

No external API needed — Deno's built-in `Deno.resolveDns("domain", "MX")` performs MX lookups natively, so this is completely free with zero API keys.

### Files to Create/Edit

| File | Action |
|------|--------|
| `supabase/functions/verify-email-domain/index.ts` | **Create** — Edge function that extracts domain from email, runs `Deno.resolveDns(domain, "MX")`, returns `{ valid: boolean }` |
| `supabase/config.toml` | **Auto-updated** — adds `[functions.verify-email-domain]` with `verify_jwt = false` |
| `src/lib/email-validation.ts` | **Edit** — add `TRUSTED_DOMAINS` set (gmail.com, outlook.com, yahoo.com, hotmail.com, etc.), add `verifyEmailDomain(email)` async function that checks cache first then calls the edge function |
| `src/components/EmailInput.tsx` | **Edit** — add async MX verification on blur after regex passes; show spinner during check; show domain error if invalid; expose `domainValid` state to disable submit buttons |
| `src/pages/BuildRequest.tsx` | **Edit** — minor: disable submit while domain verification is pending |
| `src/pages/GetAQuote.tsx` | **Edit** — minor: disable submit while domain verification is pending |
| `src/components/ContactSection.tsx` | **Edit** — minor: disable submit while domain verification is pending |

### Technical Details

**Edge Function** (`verify-email-domain/index.ts`):
- Accepts `{ domain: string }` in the request body
- Validates the domain string format server-side
- Calls `Deno.resolveDns(domain, "MX")` — returns MX records or throws if none exist
- Returns `{ valid: true }` if MX records found, `{ valid: false, message: "..." }` otherwise
- Includes CORS headers for browser calls
- No JWT required (public forms)

**Trusted Domain Cache** (client-side):
- Hardcoded set: `gmail.com`, `outlook.com`, `yahoo.com`, `hotmail.com`, `icloud.com`, `aol.com`, `protonmail.com`, `live.com`, `msn.com`
- These skip the API call entirely and return valid immediately
- A runtime `Map<string, boolean>` caches results for domains already checked in the session

**EmailInput Component Changes**:
- New states: `verifying` (boolean), `domainError` (string | null)
- On blur: if regex valid → extract domain → check trusted set → if not trusted, call `verifyEmailDomain()` → update state
- UI during verification: replace the checkmark icon with a small `Loader2` spinner
- UI on domain failure: red border + message "This email domain appears to be invalid or inactive."
- Expose verification state via a callback prop `onVerificationChange?: (status: 'idle' | 'verifying' | 'valid' | 'invalid') => void` so parent forms can disable their submit buttons

**Form Integration**:
- Each form passes `onVerificationChange` to `EmailInput` and tracks verification status in local state
- Submit button gets `disabled={submitting || emailVerification !== 'valid'}` (only when the field has been touched)

