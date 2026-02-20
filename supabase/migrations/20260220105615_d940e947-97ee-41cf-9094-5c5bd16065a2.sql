
-- Create the quote number sequence
CREATE SEQUENCE IF NOT EXISTS public.quote_number_seq START WITH 1 INCREMENT BY 1 NO MAXVALUE CACHE 1;

-- Create the quote_requests table (completely separate from build_requests)
CREATE TABLE public.quote_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number integer NOT NULL DEFAULT nextval('public.quote_number_seq') UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  event_type_new_or_clone text NOT NULL,
  event_type text NOT NULL,
  cvent_technologies text[] NOT NULL DEFAULT '{}',
  cvent_technologies_other text,
  registration_types_count text NOT NULL,
  sessions_count text NOT NULL,
  registration_options text[] NOT NULL DEFAULT '{}',
  event_launch_date text NOT NULL,
  email_status text NOT NULL DEFAULT 'pending',
  email_sent_at timestamptz,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Public INSERT allowed (no auth required — same pattern as build_requests)
CREATE POLICY "Allow public insert on quote_requests"
  ON public.quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No public SELECT — only service role (used by edge function) can read
CREATE POLICY "No public read on quote_requests"
  ON public.quote_requests
  AS RESTRICTIVE
  FOR SELECT
  USING (false);
