
-- Admin-only UPDATE/DELETE policies for lead/request tables

-- build_requests
CREATE POLICY "Admins can update build_requests" ON public.build_requests
  FOR UPDATE TO authenticated USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());
CREATE POLICY "Admins can delete build_requests" ON public.build_requests
  FOR DELETE TO authenticated USING (public.is_active_admin());

-- demo_requests
CREATE POLICY "Admins can update demo_requests" ON public.demo_requests
  FOR UPDATE TO authenticated USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());
CREATE POLICY "Admins can delete demo_requests" ON public.demo_requests
  FOR DELETE TO authenticated USING (public.is_active_admin());

-- event_complexity_leads
CREATE POLICY "Admins can update event_complexity_leads" ON public.event_complexity_leads
  FOR UPDATE TO authenticated USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());
CREATE POLICY "Admins can delete event_complexity_leads" ON public.event_complexity_leads
  FOR DELETE TO authenticated USING (public.is_active_admin());

-- quote_requests
CREATE POLICY "Admins can update quote_requests" ON public.quote_requests
  FOR UPDATE TO authenticated USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());
CREATE POLICY "Admins can delete quote_requests" ON public.quote_requests
  FOR DELETE TO authenticated USING (public.is_active_admin());

-- abandoned_demo_form (missing UPDATE policy)
CREATE POLICY "Admins can update abandoned_demos" ON public.abandoned_demo_form
  FOR UPDATE TO authenticated USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());
