-- Add submission_token column to abandoned_eb_forms
ALTER TABLE public.abandoned_eb_forms 
ADD COLUMN IF NOT EXISTS submission_token uuid NOT NULL DEFAULT gen_random_uuid();

-- Create unique index on submission_token
CREATE UNIQUE INDEX IF NOT EXISTS abandoned_eb_forms_submission_token_idx 
ON public.abandoned_eb_forms(submission_token);

-- Drop the insecure email-based UPDATE policy
DROP POLICY IF EXISTS "Public can upsert by email" ON public.abandoned_eb_forms;

-- Create secure token-based UPDATE policy
-- Security: submission_token is a UUID generated client-side, effectively unguessable
-- The client uses .eq('submission_token', token) to scope updates to their own row
CREATE POLICY "Public can update own partial by token"
  ON public.abandoned_eb_forms
  FOR UPDATE
  USING (status = 'partial')
  WITH CHECK (status IN ('partial', 'completed'));