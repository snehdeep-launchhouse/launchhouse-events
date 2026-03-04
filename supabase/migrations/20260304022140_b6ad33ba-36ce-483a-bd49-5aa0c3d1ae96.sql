-- Revoke SELECT from anon on tables that should only be readable by admins
REVOKE SELECT ON public.build_requests FROM anon;
REVOKE SELECT ON public.demo_requests FROM anon;
REVOKE SELECT ON public.quote_requests FROM anon;

-- Also revoke other unnecessary privileges from anon on these tables
-- build_requests: anon should have NO access (edge functions use service_role)
REVOKE ALL ON public.build_requests FROM anon;

-- demo_requests: anon only needs INSERT (for the demo booking edge function fallback)
REVOKE SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.demo_requests FROM anon;

-- quote_requests: anon only needs INSERT
REVOKE SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.quote_requests FROM anon;

-- Also tighten abandoned tables: revoke DELETE/TRUNCATE from anon (only need INSERT+UPDATE)
REVOKE DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.abandoned_contact_requests FROM anon;
REVOKE DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.abandoned_demo_form FROM anon;
REVOKE DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.abandoned_eb_forms FROM anon;