
-- Make quote_requests columns nullable for simplified contact form
ALTER TABLE quote_requests
  ALTER COLUMN event_type DROP NOT NULL,
  ALTER COLUMN event_type_new_or_clone DROP NOT NULL,
  ALTER COLUMN registration_types_count DROP NOT NULL,
  ALTER COLUMN sessions_count DROP NOT NULL,
  ALTER COLUMN event_launch_date DROP NOT NULL;

ALTER TABLE quote_requests
  ALTER COLUMN event_type SET DEFAULT '',
  ALTER COLUMN event_type_new_or_clone SET DEFAULT '',
  ALTER COLUMN registration_types_count SET DEFAULT '',
  ALTER COLUMN sessions_count SET DEFAULT '',
  ALTER COLUMN event_launch_date SET DEFAULT '';

-- Create abandoned_contact_requests table
CREATE TABLE public.abandoned_contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  business_email text NOT NULL,
  last_active_step integer NOT NULL DEFAULT 1,
  captured_data jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'partial',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.abandoned_contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.abandoned_contact_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.abandoned_contact_requests
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete" ON public.abandoned_contact_requests
  FOR DELETE USING (true);

CREATE POLICY "Admins can view" ON public.abandoned_contact_requests
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE status = 'active'
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.abandoned_contact_requests;
