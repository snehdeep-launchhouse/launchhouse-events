CREATE OR REPLACE FUNCTION public.check_own_admin_status(user_id uuid)
RETURNS TABLE(id uuid, status text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.id, au.status
  FROM public.admin_users au
  WHERE au.id = user_id
    AND au.id = auth.uid();
$$;