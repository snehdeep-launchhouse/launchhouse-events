
CREATE OR REPLACE FUNCTION public.notify_abandoned_form_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  response_status INT;
  supabase_url TEXT;
  service_role_key TEXT;
BEGIN
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
$function$;
