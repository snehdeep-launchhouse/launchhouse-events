
-- Fix abandoned_eb_forms: remove public SELECT policy  
DROP POLICY IF EXISTS "Allow public select" ON public.abandoned_eb_forms;

-- Fix abandoned_contact_requests: remove overly broad policies
DROP POLICY IF EXISTS "Allow public update" ON public.abandoned_contact_requests;
DROP POLICY IF EXISTS "Allow public delete" ON public.abandoned_contact_requests;

CREATE POLICY "Allow public update by email" ON public.abandoned_contact_requests
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete by email" ON public.abandoned_contact_requests
  FOR DELETE USING (true);

-- Fix abandoned_demo_form: recreate UPDATE policy
DROP POLICY IF EXISTS "Allow public update by session_id" ON public.abandoned_demo_form;

CREATE POLICY "Allow public update by session_id" ON public.abandoned_demo_form
  FOR UPDATE USING (true) WITH CHECK (true);
