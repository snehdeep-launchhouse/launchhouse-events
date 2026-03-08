CREATE TABLE public.event_complexity_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  event_date date,
  complexity_level text,
  starting_price text,
  cvent_products text,
  event_length text,
  sessions text,
  registration_paths text,
  contact_types text,
  registration_rules text,
  hotel_required text,
  languages text,
  integrations text,
  speaker_management text,
  appointment_scheduling text,
  website_pages text,
  branding_level text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.event_complexity_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts"
  ON public.event_complexity_leads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Deny public select"
  ON public.event_complexity_leads
  FOR SELECT
  USING (false);

CREATE POLICY "Admins can view leads"
  ON public.event_complexity_leads
  FOR SELECT
  USING (auth.uid() IN (SELECT admin_users.id FROM admin_users WHERE admin_users.status = 'active'));