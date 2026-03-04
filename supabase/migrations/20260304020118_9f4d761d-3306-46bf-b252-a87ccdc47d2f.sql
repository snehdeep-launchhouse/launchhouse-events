-- Grant necessary privileges to anon and authenticated roles on abandoned_contact_requests
GRANT INSERT, UPDATE ON public.abandoned_contact_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.abandoned_contact_requests TO authenticated;

-- Also ensure grants exist on abandoned_demo_form  
GRANT INSERT, UPDATE ON public.abandoned_demo_form TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.abandoned_demo_form TO authenticated;

-- And abandoned_eb_forms
GRANT INSERT, UPDATE ON public.abandoned_eb_forms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.abandoned_eb_forms TO authenticated;

-- Ensure grants on other tables that public users need to INSERT into
GRANT INSERT ON public.demo_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demo_requests TO authenticated;

-- Admin users table
GRANT SELECT, UPDATE ON public.admin_users TO authenticated;

-- Build requests and quote requests (read-only for authenticated admins)
GRANT SELECT ON public.build_requests TO authenticated;
GRANT INSERT ON public.quote_requests TO anon;
GRANT SELECT ON public.quote_requests TO authenticated;