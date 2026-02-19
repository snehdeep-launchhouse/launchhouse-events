
-- Deny all access from anonymous/authenticated users (service role bypasses RLS automatically)
CREATE POLICY "No public access to build_requests"
ON public.build_requests
FOR ALL
USING (false);
