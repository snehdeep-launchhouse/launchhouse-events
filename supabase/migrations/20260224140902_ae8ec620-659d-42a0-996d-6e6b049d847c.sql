CREATE POLICY "Allow public select on build_requests" ON build_requests FOR SELECT USING (true);
CREATE POLICY "Allow public select on quote_requests" ON quote_requests FOR SELECT USING (true);