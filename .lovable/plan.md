

## Security Re-scan Results and Fix Plan

The scan found **10 errors** and **12 warnings** remaining. Here is what needs to be fixed and how.

---

### Errors to Fix

**1. Overly permissive UPDATE/DELETE policies (3 tables)**

The previous migration left `USING (true)` on UPDATE and DELETE policies, meaning any anonymous user can modify/delete any row.

| Table | Issue | Fix |
|-------|-------|-----|
| `abandoned_contact_requests` | UPDATE `USING (true)`, DELETE `USING (true)` | Remove public DELETE entirely. Scope UPDATE so users can only update rows matching their own `business_email` (the column used as identifier in frontend upsert logic). Add admin-only DELETE. |
| `abandoned_demo_form` | UPDATE `USING (true)` | Scope UPDATE to rows matching the caller's `session_id` (frontend passes `session_id` for all updates). |
| `abandoned_eb_forms` | UPDATE `USING (true)` | Scope UPDATE to rows matching the caller's `email` (frontend uses `onConflict: "email"` upsert). Also remove the duplicate INSERT policy (`Public can submit forms`). |

**2. SELECT policies using `{public}` role instead of `{authenticated}`**

Several SELECT policies (on `abandoned_contact_requests`, `demo_requests`, `build_requests`, `quote_requests`) are granted to the `public` role even though they restrict via `auth.uid()` checks. Since `auth.uid()` is always null for anonymous users, these effectively block anonymous reads -- but best practice is to restrict the role to `authenticated` to make intent explicit and satisfy the scanner.

All six admin-only SELECT policies will be recreated with `TO authenticated` instead of `TO public`.

---

### Warnings to Fix

**3. "RLS Policy Always True" (10 findings)**

- The INSERT `WITH CHECK (true)` policies on form submission tables are **intentional** (public users must submit forms). These are acceptable.
- The UPDATE `USING (true)` findings are addressed by Error fix #1 above.

**4. "Leaked Password Protection Disabled"**

Enable leaked password protection via the auth configuration tool. This checks passwords against known breach databases.

**5. "Admin User List Could Be Enumerated" (low risk)**

The current policy `auth.uid() = id` only lets authenticated users check their own row -- this is minimal and necessary for the admin invite acceptance flow. No change needed.

---

### Implementation: Single SQL Migration

One migration will:
1. Drop and recreate UPDATE/DELETE policies on all three abandoned tables with proper scoping
2. Drop the duplicate INSERT policy on `abandoned_eb_forms`
3. Recreate all admin SELECT policies with `TO authenticated` role
4. Enable leaked password protection via auth config tool

### Frontend Changes

- `ContactUsPanel.tsx`: The `deleteAbandoned` function calls `.delete().eq("business_email", email)` on `abandoned_contact_requests`. Since we're removing public DELETE, this call will fail silently (which is acceptable -- it's a cleanup convenience, not critical). Alternatively, mark the row as `completed` instead of deleting. Will update this to use `.update({ status: "completed" })` instead.

---

### Summary of Changes

| Area | Files/Resources | Change |
|------|----------------|--------|
| Database migration | New migration SQL | Fix 8 RLS policies across 6 tables |
| Auth config | Auth settings | Enable leaked password protection |
| Frontend | `ContactUsPanel.tsx` | Replace `.delete()` with `.update({ status: "completed" })` for abandoned contact cleanup |

