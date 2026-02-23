CREATE TABLE IF NOT EXISTS clearance_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  aum TEXT NOT NULL,
  risk_domain TEXT NOT NULL,
  intended_use TEXT NOT NULL,
  email TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE clearance_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts on clearance_requests"
  ON clearance_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);
