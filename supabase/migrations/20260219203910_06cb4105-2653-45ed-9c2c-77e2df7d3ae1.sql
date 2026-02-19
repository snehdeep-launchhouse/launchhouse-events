
CREATE TABLE public.build_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- Page 1: Basic Info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,

  -- Page 2: Contact Info
  contacts JSONB NOT NULL DEFAULT '[]',
  primary_poc_phone TEXT,
  kickoff_timezone TEXT,
  kickoff_date_1 TEXT,
  kickoff_time_1 TEXT,
  kickoff_date_2 TEXT,
  kickoff_time_2 TEXT,
  chosen_solutions TEXT[] NOT NULL DEFAULT '{}',

  -- Page 3: Event Details
  account_number TEXT,
  planner_first_name TEXT,
  planner_last_name TEXT,
  planner_email TEXT,
  event_title TEXT NOT NULL,
  event_start_date TEXT,
  event_start_time TEXT,
  event_end_date TEXT,
  event_end_time TEXT,
  event_timezone TEXT,
  go_live_date TEXT,
  additional_info TEXT,

  -- Meta
  email_status TEXT NOT NULL DEFAULT 'pending'
);

-- Enable RLS (table is write-only from edge functions via service role, read via dashboard)
ALTER TABLE public.build_requests ENABLE ROW LEVEL SECURITY;

-- No public access — only service role (edge functions) can write
-- Admins view data via the backend dashboard
