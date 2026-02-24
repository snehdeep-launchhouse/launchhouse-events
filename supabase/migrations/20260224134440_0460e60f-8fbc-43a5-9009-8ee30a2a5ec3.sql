
DROP POLICY IF EXISTS "Allow public insert" ON abandoned_eb_forms;
DROP POLICY IF EXISTS "Allow public update" ON abandoned_eb_forms;

CREATE POLICY "Allow public insert" ON abandoned_eb_forms FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update" ON abandoned_eb_forms FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
