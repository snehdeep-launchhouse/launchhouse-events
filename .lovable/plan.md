

## Fix: quote_requests (and build_requests) RLS Policies Blocking Ignition Reads

### Root Cause

All RLS policies on `quote_requests` and `build_requests` are **RESTRICTIVE** (Permissive: No). In PostgreSQL, restrictive policies ALL must pass, and at least one **permissive** policy must also exist and pass. Since there are zero permissive policies and conflicting restrictive ones (`USING(true)` alongside `USING(false)`), all SELECT queries return empty results — data never reaches Ignition.

**`quote_requests`** has:
- "Allow public select" — restrictive, USING(true)
- "No public read" — restrictive, USING(false) ← **blocks everything**

**`build_requests`** has:
- "Allow public select" — restrictive, USING(true)
- "No public access" — restrictive, USING(false) ← **blocks everything**

### Fix: Database Migration

Drop the conflicting deny-all policies and replace them with proper **permissive** admin-only SELECT policies that check the `admin_users` table.

```sql
-- quote_requests: drop conflicting policies
DROP POLICY IF EXISTS "No public read on quote_requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Allow public select on quote_requests" ON public.quote_requests;

-- quote_requests: add permissive admin-only SELECT
CREATE POLICY "Admins can view quote_requests"
  ON public.quote_requests FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.admin_users WHERE status = 'active'));

-- build_requests: drop conflicting policies
DROP POLICY IF EXISTS "No public access to build_requests" ON public.build_requests;
DROP POLICY IF EXISTS "Allow public select on build_requests" ON public.build_requests;

-- build_requests: add permissive admin-only SELECT
CREATE POLICY "Admins can view build_requests"
  ON public.build_requests FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.admin_users WHERE status = 'active'));
```

The INSERT policy on `quote_requests` (`Allow public insert`) remains untouched — public form submissions still work.

### No Code Changes Needed

The Ignition dashboard code (`AdminReport.tsx`) already queries these tables correctly. Once the RLS policies stop blocking reads, data will flow through immediately.

### Files Summary

| File | Action |
|------|--------|
| Database migration | Drop 4 conflicting policies, create 2 permissive admin-only SELECT policies |

