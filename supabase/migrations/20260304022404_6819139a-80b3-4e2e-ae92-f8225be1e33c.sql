-- Create a security definer function to check admin status
-- This removes the need for authenticated users to have direct SELECT on admin_users
CREATE OR REPLACE FUNCTION public.check_own_admin_status(user_id uuid)
RETURNS TABLE(id uuid, status text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.id, au.status
  FROM public.admin_users au
  WHERE au.id = user_id;
$$;

-- Remove the broad "Authenticated can check own admin status" SELECT policy
DROP POLICY IF EXISTS "Authenticated can check own admin status" ON public.admin_users;

-- Add an explicit deny SELECT for anon
CREATE POLICY "Deny anon select on admin_users"
  ON public.admin_users FOR SELECT TO anon
  USING (false);