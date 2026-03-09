
-- 1. Add submission_token column with auto-generated UUID
ALTER TABLE public.abandoned_contact_requests
  ADD COLUMN IF NOT EXISTS submission_token UUID NOT NULL DEFAULT gen_random_uuid();

-- 2. Drop the insecure UPDATE policy
DROP POLICY IF EXISTS "Public can upsert by email" ON public.abandoned_contact_requests;

-- 3. Create secure token-bound UPDATE policy
-- Anonymous users can only update rows where:
--   a) status is still 'partial' (not completed/abandoned)
--   b) they supply the correct submission_token via query filter
CREATE POLICY "Public can update own partial by token"
  ON public.abandoned_contact_requests
  FOR UPDATE
  USING (
    status = 'partial'
    AND submission_token = (
      SELECT (current_setting('request.headers', true)::jsonb ->> 'x-submission-token')::uuid
    )
  )
  WITH CHECK (
    status = ANY (ARRAY['partial'::text, 'completed'::text])
  );
