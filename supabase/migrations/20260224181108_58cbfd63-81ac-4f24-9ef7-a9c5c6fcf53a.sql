-- Allow invited users to mark themselves as accepted (invited -> active)
-- This is needed because non-master admins currently cannot UPDATE their own row.

DO $$
BEGIN
  -- Drop if it already exists (idempotent)
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_users'
      AND policyname = 'Users can accept invite'
  ) THEN
    EXECUTE 'DROP POLICY "Users can accept invite" ON public.admin_users';
  END IF;
END $$;

CREATE POLICY "Users can accept invite"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
  AND status = 'invited'
)
WITH CHECK (
  auth.uid() = id
  AND status = 'active'
);
