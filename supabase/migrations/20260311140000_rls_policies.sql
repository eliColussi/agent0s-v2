-- Enable Row Level Security and add public read policies.
-- The pipeline uses the service_role key which bypasses RLS entirely.
-- The frontend uses the anon key which needs an explicit read policy.

-- library_items — fully public read, write restricted to service_role
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON library_items
  FOR SELECT USING (true);

-- daily_digests — fully public read
ALTER TABLE daily_digests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON daily_digests
  FOR SELECT USING (true);

-- scrape_logs — no public access needed (admin-only)
ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;
