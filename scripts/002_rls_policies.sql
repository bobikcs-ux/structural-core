-- ═══ BOBIKCS Protocol: Row Level Security ═══

-- ── global_state_snapshots: append-only, public read ──
ALTER TABLE global_state_snapshots ENABLE ROW LEVEL SECURITY;

-- Anyone can read snapshots (public verification)
CREATE POLICY "snapshots_public_read"
  ON global_state_snapshots FOR SELECT
  USING (true);

-- Only service_role can insert (cron job)
CREATE POLICY "snapshots_service_insert"
  ON global_state_snapshots FOR INSERT
  TO service_role
  WITH CHECK (true);

-- No updates allowed (append-only)
CREATE POLICY "snapshots_no_update"
  ON global_state_snapshots FOR UPDATE
  USING (false);

-- No deletes allowed (append-only)
CREATE POLICY "snapshots_no_delete"
  ON global_state_snapshots FOR DELETE
  USING (false);

-- ── signing_keys: public read, service_role write ──
ALTER TABLE signing_keys ENABLE ROW LEVEL SECURITY;

-- Anyone can read public keys (needed for client-side verification)
CREATE POLICY "signing_keys_public_read"
  ON signing_keys FOR SELECT
  USING (true);

-- Only service_role can insert keys
CREATE POLICY "signing_keys_service_insert"
  ON signing_keys FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only service_role can update (retire keys)
CREATE POLICY "signing_keys_service_update"
  ON signing_keys FOR UPDATE
  TO service_role
  USING (true);

-- No deletes
CREATE POLICY "signing_keys_no_delete"
  ON signing_keys FOR DELETE
  USING (false);

-- ── system_events: service_role only ──
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;

-- Service role can insert events
CREATE POLICY "events_service_insert"
  ON system_events FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Service role can read events (for aggregation view)
CREATE POLICY "events_service_read"
  ON system_events FOR SELECT
  TO service_role
  USING (true);

-- No updates
CREATE POLICY "events_no_update"
  ON system_events FOR UPDATE
  USING (false);

-- No deletes
CREATE POLICY "events_no_delete"
  ON system_events FOR DELETE
  USING (false);
