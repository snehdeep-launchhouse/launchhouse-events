ALTER TABLE public.event_complexity_leads 
ADD COLUMN IF NOT EXISTS attendee_hub_selected boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS attendee_hub_features text[] NOT NULL DEFAULT '{}'::text[];