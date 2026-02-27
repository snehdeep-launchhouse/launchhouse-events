CREATE TABLE public.demo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  business_email text NOT NULL,
  selected_products text[] NOT NULL DEFAULT '{}',
  scheduled_date date NOT NULL,
  scheduled_time text NOT NULL,
  additional_attendees text[] DEFAULT '{}',
  google_event_id text,
  google_meet_link text,
  google_event_link text,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.demo_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view demo_requests" ON public.demo_requests
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active')
  );