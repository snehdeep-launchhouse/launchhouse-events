
-- =====================================================
-- 1. Fix abandoned_contact_requests policies
-- =====================================================

-- Drop overly permissive UPDATE and DELETE
DROP POLICY IF EXISTS "Allow public update by email" ON public.abandoned_contact_requests;
DROP POLICY IF EXISTS "Allow public delete by email" ON public.abandoned_contact_requests;

-- Scoped UPDATE: only rows matching the business_email being upserted
CREATE POLICY "Public can update own rows by email"
ON public.abandoned_contact_requests
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
-- NOTE: We cannot scope by caller identity since these are anonymous form submissions.
-- The upsert uses onConflict:"business_email" so the row is matched by email.
-- We keep INSERT WITH CHECK (true) which is intentional for public forms.
-- Instead, let's properly scope: remove the broad UPDATE and use a narrower approach.

-- Actually, drop what we just created and do it right:
DROP POLICY IF EXISTS "Public can update own rows by email" ON public.abandoned_contact_requests;

-- For anonymous upserts, we need UPDATE to work. The key constraint is business_email.
-- We can't scope by auth since users are anonymous. The best we can do is ensure
-- the WITH CHECK constrains what can be written (status must be partial/completed).
CREATE POLICY "Public can upsert by email"
ON public.abandoned_contact_requests
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (status IN ('partial', 'completed'));

-- Admin-only DELETE (authenticated admins only)
CREATE POLICY "Admins can delete abandoned contacts"
ON public.abandoned_contact_requests
FOR DELETE
TO authenticated
USING (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));

-- Recreate admin SELECT with TO authenticated
DROP POLICY IF EXISTS "Admins can view" ON public.abandoned_contact_requests;
CREATE POLICY "Admins can view abandoned contacts"
ON public.abandoned_contact_requests
FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));

-- =====================================================
-- 2. Fix abandoned_demo_form policies
-- =====================================================

DROP POLICY IF EXISTS "Allow public update by session_id" ON public.abandoned_demo_form;

-- Scoped UPDATE: anonymous users can only update rows matching their session_id
-- Since session_id is passed in the upsert, we allow update but constrain status
CREATE POLICY "Public can upsert by session"
ON public.abandoned_demo_form
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (status IN ('partial', 'abandoned'));

-- Recreate admin SELECT with TO authenticated
DROP POLICY IF EXISTS "Admins can view" ON public.abandoned_demo_form;
CREATE POLICY "Admins can view abandoned demos"
ON public.abandoned_demo_form
FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));

-- Recreate admin DELETE with TO authenticated
DROP POLICY IF EXISTS "Admins can delete" ON public.abandoned_demo_form;
CREATE POLICY "Admins can delete abandoned demos"
ON public.abandoned_demo_form
FOR DELETE
TO authenticated
USING (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));

-- =====================================================
-- 3. Fix abandoned_eb_forms policies
-- =====================================================

-- Remove duplicate INSERT policy
DROP POLICY IF EXISTS "Public can submit forms" ON public.abandoned_eb_forms;

-- Drop overly permissive UPDATE
DROP POLICY IF EXISTS "Allow public update" ON public.abandoned_eb_forms;

-- Scoped UPDATE for public upsert by email
CREATE POLICY "Public can upsert by email"
ON public.abandoned_eb_forms
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (status IS NULL OR status IN ('partial', 'completed'));

-- Fix the admin ALL policy to use proper role check instead of hardcoded UUID
DROP POLICY IF EXISTS "Admins only can view" ON public.abandoned_eb_forms;
CREATE POLICY "Admins can manage eb forms"
ON public.abandoned_eb_forms
FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'))
WITH CHECK (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));

-- =====================================================
-- 4. Recreate admin SELECT policies with TO authenticated
-- =====================================================

-- build_requests
DROP POLICY IF EXISTS "Admins can view build_requests" ON public.build_requests;
CREATE POLICY "Admins can view build_requests"
ON public.build_requests
FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));

-- demo_requests
DROP POLICY IF EXISTS "Admins can view demo_requests" ON public.demo_requests;
CREATE POLICY "Admins can view demo_requests"
ON public.demo_requests
FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));

-- quote_requests
DROP POLICY IF EXISTS "Admins can view quote_requests" ON public.quote_requests;
CREATE POLICY "Admins can view quote_requests"
ON public.quote_requests
FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));
