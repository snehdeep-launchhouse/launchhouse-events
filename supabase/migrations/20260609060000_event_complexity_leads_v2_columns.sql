-- Phase 3: Add V2 calculator support to event_complexity_leads.
-- V1 inserts remain functional — only nullable columns are added; nothing existing is altered.

ALTER TABLE public.event_complexity_leads
ADD COLUMN IF NOT EXISTS v2_payload jsonb,
ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'v1';

UPDATE public.event_complexity_leads
SET source = 'v1'
WHERE source IS NULL;

CREATE INDEX IF NOT EXISTS event_complexity_leads_source_idx
ON public.event_complexity_leads (source);
