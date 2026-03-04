-- Fix INSERT policy to target anon and authenticated explicitly
DROP POLICY IF EXISTS "Allow public insert" ON public.abandoned_contact_requests;
CREATE POLICY "Allow public insert" ON public.abandoned_contact_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Also fix the same issue on abandoned_demo_form
DROP POLICY IF EXISTS "Allow public insert" ON public.abandoned_demo_form;
CREATE POLICY "Allow public insert" ON public.abandoned_demo_form
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- And abandoned_eb_forms
DROP POLICY IF EXISTS "Allow public insert" ON public.abandoned_eb_forms;
CREATE POLICY "Allow public insert" ON public.abandoned_eb_forms
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- And demo_requests
DROP POLICY IF EXISTS "Allow public insert" ON public.demo_requests;
CREATE POLICY "Allow public insert" ON public.demo_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- And quote_requests
DROP POLICY IF EXISTS "Allow public insert on quote_requests" ON public.quote_requests;
CREATE POLICY "Allow public insert on quote_requests" ON public.quote_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);