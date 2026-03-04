-- Add explicit default-deny SELECT policies for anon on tables that lack them
-- This provides defense-in-depth alongside the revoked grants

-- build_requests: already has admin SELECT, add explicit deny for anon
CREATE POLICY "Deny public select on build_requests"
  ON public.build_requests FOR SELECT TO anon
  USING (false);

-- demo_requests: already has admin SELECT, add explicit deny for anon
CREATE POLICY "Deny public select on demo_requests"
  ON public.demo_requests FOR SELECT TO anon
  USING (false);

-- quote_requests: already has admin SELECT, add explicit deny for anon
CREATE POLICY "Deny public select on quote_requests"
  ON public.quote_requests FOR SELECT TO anon
  USING (false);

-- abandoned_contact_requests: already has admin SELECT, add explicit deny for anon
CREATE POLICY "Deny public select on abandoned_contacts"
  ON public.abandoned_contact_requests FOR SELECT TO anon
  USING (false);

-- abandoned_demo_form: already has admin SELECT, add explicit deny for anon
CREATE POLICY "Deny public select on abandoned_demos"
  ON public.abandoned_demo_form FOR SELECT TO anon
  USING (false);

-- abandoned_eb_forms: add explicit deny for anon
CREATE POLICY "Deny public select on abandoned_eb"
  ON public.abandoned_eb_forms FOR SELECT TO anon
  USING (false);