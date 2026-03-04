

## Test Results and Fix Plan

### Issues Found

**1. `abandoned_contact_requests` INSERT fails (401 RLS violation)**

The code in `ContactUsPanel.tsx` (line 246-264) and `GetAQuote.tsx` (line 130-152) tries to:
1. `.select("id")` to find existing rows -- fails because anonymous users have no SELECT permission
2. `.insert({...}).select("id").single()` -- the INSERT itself works, but the chained `.select("id")` requires SELECT permission, causing the entire operation to fail with 401

The `abandoned_demo_form` table works because its INSERT code (line 135-146) uses plain `.insert()` without `.select()`.

**Fix**: Add a SELECT policy for anonymous users scoped to matching their own `business_email`, or change the code to not require SELECT on insert (remove `.select("id").single()` and use a different tracking approach).

The simpler and more secure approach: change the frontend code to use `.upsert()` with `onConflict: "business_email"` (there's already a unique constraint implied by the upsert pattern) and remove the need for SELECT entirely.

**2. `GetAQuote.tsx` still uses `.delete()` instead of `.update()`**

Line 164-167 in `GetAQuote.tsx` still calls `.delete()` on `abandoned_contact_requests`, but the previous migration removed public DELETE access. This was fixed in `ContactUsPanel.tsx` but missed in `GetAQuote.tsx`.

**3. `build_requests` table has no INSERT policy**

The schema shows "Can't INSERT records" for `build_requests`. The Build Request form submissions go through the edge function (`send-build-request`) which uses `SUPABASE_SERVICE_ROLE_KEY`, so this works. Not a bug -- just noting it.

**4. `demo_requests` INSERT works via edge function**

Same pattern as build_requests -- the `book-demo` edge function handles the insert with service role key.

---

### Changes Required

**A. Fix `ContactUsPanel.tsx` abandoned contact tracking (lines ~240-267)**
- Remove the SELECT-then-INSERT pattern
- Replace with a single `.upsert()` call using `onConflict: "business_email"` 
- Remove `.select("id").single()` from the insert
- Track the row by `business_email` instead of `id`

**B. Fix `GetAQuote.tsx` abandoned contact tracking (lines ~120-170)**
- Apply the same upsert pattern fix as ContactUsPanel
- Fix line 164-167: change `.delete()` to `.update({ status: "completed" })`

**C. Database: Add unique constraint on `abandoned_contact_requests.business_email`**
- Required for the `onConflict` upsert to work
- Run migration: `ALTER TABLE public.abandoned_contact_requests ADD CONSTRAINT abandoned_contact_requests_business_email_key UNIQUE (business_email);`

### No other forms are broken
- Contact Us panel Step 1 -> Step 2 auto-advance works
- Build Request form loads and renders correctly
- Request Demo panel (uses `abandoned_demo_form` with session-based tracking) works -- INSERT returned 201, UPDATE returned 204
- The 401 errors on `abandoned_contact_requests` are silent failures (caught by try/catch), so the user experience is not blocked, but lead tracking data is lost

