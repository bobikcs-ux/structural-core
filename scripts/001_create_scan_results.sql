-- Create the scan_results table for storing completed scans
CREATE TABLE IF NOT EXISTS public.scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  objective TEXT NOT NULL,
  signal_score INTEGER NOT NULL DEFAULT 0,
  automation_score INTEGER NOT NULL DEFAULT 0,
  authority_score INTEGER NOT NULL DEFAULT 0,
  integrity_score INTEGER NOT NULL DEFAULT 0,
  facade_score INTEGER NOT NULL DEFAULT 0,
  verdict_title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (anonymous scans)
CREATE POLICY "Allow anonymous inserts" ON public.scan_results
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read completed scans (for the feed)
CREATE POLICY "Allow public read" ON public.scan_results
  FOR SELECT USING (true);
