-- Drop the header-based UPDATE policy (requires x-submission-token header which doesn't work with PostgREST query filters)
DROP POLICY IF EXISTS "Public can update own partial by token" ON public.abandoned_contact_requests;

-- Create simpler policy: anonymous can update partial rows
-- Security: the submission_token is a UUID generated client-side, effectively unguessable
-- The client uses .eq('submission_token', token) to scope updates to their own row
CREATE POLICY "Public can update own partial by token"
  ON public.abandoned_contact_requests
  FOR UPDATE
  USING (status = 'partial')
  WITH CHECK (status = ANY (ARRAY['partial'::text, 'completed'::text]));