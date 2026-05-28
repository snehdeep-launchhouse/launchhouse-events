CREATE POLICY "Only admins can subscribe to realtime"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (public.is_active_admin());