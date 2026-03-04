-- Grant DELETE on admin_users to authenticated
GRANT DELETE ON public.admin_users TO authenticated;

-- Add master-admin-only SELECT policy
CREATE POLICY "Master admin can view all users"
ON public.admin_users FOR SELECT TO authenticated
USING (auth.uid() = 'b426c88b-14a2-46ed-93f3-08cb00282b83'::uuid);

-- Add master-admin-only DELETE policy
CREATE POLICY "Master admin can delete users"
ON public.admin_users FOR DELETE TO authenticated
USING (auth.uid() = 'b426c88b-14a2-46ed-93f3-08cb00282b83'::uuid);