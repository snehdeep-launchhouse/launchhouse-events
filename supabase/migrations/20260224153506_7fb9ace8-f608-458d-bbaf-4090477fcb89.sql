-- Allow authenticated users to check if they are in admin_users
CREATE POLICY "Authenticated can check own admin status"
  ON public.admin_users
  FOR SELECT
  USING (auth.uid() = id);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;