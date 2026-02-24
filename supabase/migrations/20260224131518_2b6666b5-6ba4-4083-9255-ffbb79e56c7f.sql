CREATE TABLE public.abandoned_eb_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  last_page_visited INTEGER NOT NULL DEFAULT 1,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.abandoned_eb_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.abandoned_eb_forms FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.abandoned_eb_forms FOR UPDATE TO anon USING (true) WITH CHECK (true);