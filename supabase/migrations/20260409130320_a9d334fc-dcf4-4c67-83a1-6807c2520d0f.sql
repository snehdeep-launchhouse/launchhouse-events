-- Grant table-level permissions for abandoned_demo_form
GRANT SELECT, INSERT, UPDATE ON public.abandoned_demo_form TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.abandoned_demo_form TO authenticated;

-- Also ensure abandoned_contact_requests has proper grants (RPC uses SECURITY DEFINER but direct INSERT needs grant)
GRANT INSERT ON public.abandoned_contact_requests TO anon;
GRANT INSERT ON public.abandoned_contact_requests TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.abandoned_contact_requests TO authenticated;