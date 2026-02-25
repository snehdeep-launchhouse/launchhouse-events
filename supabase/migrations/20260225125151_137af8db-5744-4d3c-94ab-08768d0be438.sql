
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
