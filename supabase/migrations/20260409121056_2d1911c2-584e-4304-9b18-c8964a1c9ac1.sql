-- Create secure RPC function for token-based updates
CREATE OR REPLACE FUNCTION public.update_abandoned_contact_by_token(
  p_token uuid,
  p_status text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_business_email text DEFAULT NULL,
  p_captured_data jsonb DEFAULT NULL,
  p_last_active_step integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow valid status transitions
  IF p_status IS NOT NULL AND p_status NOT IN ('partial', 'completed') THEN
    RAISE EXCEPTION 'Invalid status value';
  END IF;

  UPDATE public.abandoned_contact_requests
  SET
    status = COALESCE(p_status, status),
    first_name = COALESCE(p_first_name, first_name),
    last_name = COALESCE(p_last_name, last_name),
    business_email = COALESCE(p_business_email, business_email),
    captured_data = COALESCE(p_captured_data, captured_data),
    last_active_step = COALESCE(p_last_active_step, last_active_step),
    updated_at = now()
  WHERE submission_token = p_token
    AND status = 'partial';
END;
$$;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.update_abandoned_contact_by_token TO anon;
GRANT EXECUTE ON FUNCTION public.update_abandoned_contact_by_token TO authenticated;

-- Drop the old overly permissive UPDATE policy
DROP POLICY IF EXISTS "Public can update own partial by token" ON public.abandoned_contact_requests;

-- Create a restrictive UPDATE policy (admins only for direct updates)
CREATE POLICY "Only admins can directly update abandoned contacts"
ON public.abandoned_contact_requests
FOR UPDATE
TO authenticated
USING (is_active_admin())
WITH CHECK (is_active_admin());