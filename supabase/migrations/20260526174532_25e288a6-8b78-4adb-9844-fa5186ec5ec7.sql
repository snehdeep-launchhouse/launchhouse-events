
-- 1. Drop overly permissive UPDATE policies
DROP POLICY IF EXISTS "Public can upsert by session" ON public.abandoned_demo_form;
DROP POLICY IF EXISTS "Public can update own partial by token" ON public.abandoned_eb_forms;

-- 2. Create token-scoped RPC for abandoned_eb_forms
CREATE OR REPLACE FUNCTION public.update_abandoned_eb_by_token(
  p_token uuid,
  p_status text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_company_name text DEFAULT NULL,
  p_company text DEFAULT NULL,
  p_form_data jsonb DEFAULT NULL,
  p_last_page_visited integer DEFAULT NULL,
  p_completed boolean DEFAULT NULL
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

  UPDATE public.abandoned_eb_forms
  SET
    status = COALESCE(p_status, status),
    first_name = COALESCE(p_first_name, first_name),
    last_name = COALESCE(p_last_name, last_name),
    email = COALESCE(p_email, email),
    company_name = COALESCE(p_company_name, company_name),
    company = COALESCE(p_company, company),
    form_data = COALESCE(p_form_data, form_data),
    last_page_visited = COALESCE(p_last_page_visited, last_page_visited),
    completed = COALESCE(p_completed, completed),
    updated_at = now()
  WHERE submission_token = p_token
    AND status = 'partial';
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_abandoned_eb_by_token(uuid, text, text, text, text, text, text, jsonb, integer, boolean) TO anon, authenticated;

-- 3. Tighten EXECUTE privileges on internal helper functions
REVOKE EXECUTE ON FUNCTION public.notify_abandoned_form_trigger() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_active_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.check_own_admin_status(uuid) FROM PUBLIC, anon;

-- 4. Restrict Realtime channel subscriptions to active admins only
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins only realtime read" ON realtime.messages;
CREATE POLICY "Admins only realtime read"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (public.is_active_admin());
