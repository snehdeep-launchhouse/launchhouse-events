-- Revoke unnecessary SELECT grant from anon on abandoned form tables
-- (anon only needs INSERT and UPDATE, not SELECT)
REVOKE SELECT ON public.abandoned_contact_requests FROM anon;
REVOKE SELECT ON public.abandoned_demo_form FROM anon;
REVOKE SELECT ON public.abandoned_eb_forms FROM anon;