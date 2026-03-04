-- Tighten UPDATE policies: only allow updating rows with status = 'partial'
-- This prevents modification of completed/abandoned records by anonymous users

-- abandoned_contact_requests
DROP POLICY IF EXISTS "Public can upsert by email" ON public.abandoned_contact_requests;
CREATE POLICY "Public can upsert by email" ON public.abandoned_contact_requests
  FOR UPDATE TO anon, authenticated
  USING (status = 'partial')
  WITH CHECK (status IN ('partial', 'completed'));

-- abandoned_demo_form
DROP POLICY IF EXISTS "Public can upsert by session" ON public.abandoned_demo_form;
CREATE POLICY "Public can upsert by session" ON public.abandoned_demo_form
  FOR UPDATE TO anon, authenticated
  USING (status = 'partial')
  WITH CHECK (status IN ('partial', 'abandoned'));

-- abandoned_eb_forms
DROP POLICY IF EXISTS "Public can upsert by email" ON public.abandoned_eb_forms;
CREATE POLICY "Public can upsert by email" ON public.abandoned_eb_forms
  FOR UPDATE TO anon, authenticated
  USING (status = 'partial')
  WITH CHECK ((status IS NULL) OR (status IN ('partial', 'completed')));