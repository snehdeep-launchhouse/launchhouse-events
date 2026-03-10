
-- 1. Create security definer function
CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
      AND status = 'active'
  )
$$;

-- 2. Refactor abandoned_contact_requests policies
DROP POLICY IF EXISTS "Admins can delete abandoned contacts" ON public.abandoned_contact_requests;
DROP POLICY IF EXISTS "Admins can view abandoned contacts" ON public.abandoned_contact_requests;

CREATE POLICY "Admins can view abandoned contacts" ON public.abandoned_contact_requests
  FOR SELECT TO authenticated USING (public.is_active_admin());

CREATE POLICY "Admins can delete abandoned contacts" ON public.abandoned_contact_requests
  FOR DELETE TO authenticated USING (public.is_active_admin());

-- 3. Refactor abandoned_demo_form policies
DROP POLICY IF EXISTS "Admins can view abandoned demos" ON public.abandoned_demo_form;
DROP POLICY IF EXISTS "Admins can delete abandoned demos" ON public.abandoned_demo_form;

CREATE POLICY "Admins can view abandoned demos" ON public.abandoned_demo_form
  FOR SELECT TO authenticated USING (public.is_active_admin());

CREATE POLICY "Admins can delete abandoned demos" ON public.abandoned_demo_form
  FOR DELETE TO authenticated USING (public.is_active_admin());

-- 4. Refactor abandoned_eb_forms policy
DROP POLICY IF EXISTS "Admins can manage eb forms" ON public.abandoned_eb_forms;

CREATE POLICY "Admins can manage eb forms" ON public.abandoned_eb_forms
  FOR ALL TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

-- 5. Refactor build_requests policy
DROP POLICY IF EXISTS "Admins can view build_requests" ON public.build_requests;

CREATE POLICY "Admins can view build_requests" ON public.build_requests
  FOR SELECT TO authenticated USING (public.is_active_admin());

-- 6. Refactor demo_requests policy
DROP POLICY IF EXISTS "Admins can view demo_requests" ON public.demo_requests;

CREATE POLICY "Admins can view demo_requests" ON public.demo_requests
  FOR SELECT TO authenticated USING (public.is_active_admin());

-- 7. Refactor event_complexity_leads policy
DROP POLICY IF EXISTS "Admins can view leads" ON public.event_complexity_leads;

CREATE POLICY "Admins can view leads" ON public.event_complexity_leads
  FOR SELECT TO authenticated USING (public.is_active_admin());

-- 8. Refactor quote_requests policy
DROP POLICY IF EXISTS "Admins can view quote_requests" ON public.quote_requests;

CREATE POLICY "Admins can view quote_requests" ON public.quote_requests
  FOR SELECT TO authenticated USING (public.is_active_admin());
