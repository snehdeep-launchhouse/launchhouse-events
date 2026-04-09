CREATE OR REPLACE FUNCTION public.update_abandoned_demo_by_session(
  p_session_id uuid,
  p_status text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_last_step_reached integer DEFAULT NULL,
  p_form_type text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_status IS NOT NULL AND p_status NOT IN ('partial', 'abandoned', 'completed') THEN
    RAISE EXCEPTION 'Invalid status value';
  END IF;

  UPDATE public.abandoned_demo_form
  SET
    status = COALESCE(p_status, status),
    first_name = COALESCE(p_first_name, first_name),
    last_name = COALESCE(p_last_name, last_name),
    email = COALESCE(p_email, email),
    last_step_reached = COALESCE(p_last_step_reached, last_step_reached),
    form_type = COALESCE(p_form_type, form_type),
    updated_at = now()
  WHERE session_id = p_session_id
    AND status = 'partial';
END;
$$;