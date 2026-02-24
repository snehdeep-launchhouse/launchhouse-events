-- Drop the restrictive policy and recreate as permissive
DROP POLICY IF EXISTS "Authenticated can check own admin status" ON public.admin_users;

CREATE POLICY "Authenticated can check own admin status"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);