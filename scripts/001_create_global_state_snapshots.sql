-- ============================================================
-- PHASE 1 — global_state_snapshots table
-- Append-only snapshot chain with hash integrity
-- ============================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.global_state_snapshots (
  id              uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  calculated_at   timestamptz    NOT NULL DEFAULT now(),
  structural_index numeric       NOT NULL,
  consensus_ratio  numeric       NOT NULL,
  reserve_ratio    numeric       NOT NULL,
  throughput_1m    numeric       NOT NULL,
  error_rate_1h    numeric       NOT NULL,
  total_events_1h  integer       NOT NULL,
  state_hash       text          NOT NULL,
  previous_hash    text          NULL
);

-- 2. Index for fast latest-row lookups
CREATE INDEX IF NOT EXISTS idx_global_state_snapshots_calculated_at
  ON public.global_state_snapshots (calculated_at DESC);

-- 3. Enable RLS
ALTER TABLE public.global_state_snapshots ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- SELECT: allow anon and authenticated reads
CREATE POLICY "anon_select_global_state_snapshots"
  ON public.global_state_snapshots
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT: only service_role can insert
CREATE POLICY "service_role_insert_global_state_snapshots"
  ON public.global_state_snapshots
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Explicit DENY for UPDATE and DELETE (no policies = denied by default with RLS on,
-- but we add explicit restrictive policies for clarity)
CREATE POLICY "deny_update_global_state_snapshots"
  ON public.global_state_snapshots
  FOR UPDATE
  USING (false);

CREATE POLICY "deny_delete_global_state_snapshots"
  ON public.global_state_snapshots
  FOR DELETE
  USING (false);

-- 5. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_state_snapshots;
