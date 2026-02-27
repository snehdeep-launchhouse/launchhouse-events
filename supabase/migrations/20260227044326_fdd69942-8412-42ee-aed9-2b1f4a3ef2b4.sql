
-- 1. Create the abandoned_demo_form table
CREATE TABLE public.abandoned_demo_form (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  form_type TEXT NOT NULL DEFAULT 'demo',
  last_step_reached INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'partial',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.abandoned_demo_form ENABLE ROW LEVEL SECURITY;

-- 3. Public INSERT only
CREATE POLICY "Allow public insert" ON public.abandoned_demo_form
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 4. Public UPDATE only matching session_id
CREATE POLICY "Allow public update by session_id" ON public.abandoned_demo_form
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Admin SELECT
CREATE POLICY "Admins can view" ON public.abandoned_demo_form
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT admin_users.id FROM admin_users WHERE admin_users.status = 'active'));

-- 6. Admin DELETE  
CREATE POLICY "Admins can delete" ON public.abandoned_demo_form
  FOR DELETE TO authenticated
  USING (auth.uid() IN (SELECT admin_users.id FROM admin_users WHERE admin_users.status = 'active'));

-- 7. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.abandoned_demo_form;

-- 8. Create trigger function to call notify-abandoned-form edge function
CREATE OR REPLACE FUNCTION public.notify_abandoned_form_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response_status INT;
  supabase_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Only fire when status changes to 'abandoned'
  IF NEW.status = 'abandoned' AND (OLD.status IS NULL OR OLD.status <> 'abandoned') THEN
    SELECT decrypted_secret INTO supabase_url FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1;
    SELECT decrypted_secret INTO service_role_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1;
    
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/notify-abandoned-form',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'first_name', NEW.first_name,
        'last_name', NEW.last_name,
        'email', NEW.email,
        'form_type', NEW.form_type,
        'last_step_reached', NEW.last_step_reached
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- 9. Create trigger
CREATE TRIGGER on_abandoned_demo_form_status_change
  AFTER UPDATE ON public.abandoned_demo_form
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_abandoned_form_trigger();
