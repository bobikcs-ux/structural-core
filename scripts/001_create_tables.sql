-- ═══ BOBIKCS Protocol: Core Tables ═══

-- 1. signing_keys: Stores Ed25519 public keys for signature verification
CREATE TABLE IF NOT EXISTS signing_keys (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id            text UNIQUE NOT NULL,
  public_key_base64 text NOT NULL,
  algorithm         text NOT NULL DEFAULT 'Ed25519',
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  retired_at        timestamptz
);

-- Only one active key at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_only_one_active_key
  ON signing_keys (is_active)
  WHERE is_active = true;

-- 2. global_state_snapshots: Append-only signed state records
CREATE TABLE IF NOT EXISTS global_state_snapshots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version         int NOT NULL DEFAULT 1,
  index_value     numeric NOT NULL,
  consensus_ratio numeric NOT NULL,
  reserve_ratio   numeric NOT NULL,
  volatility_band numeric NOT NULL,
  active_nodes    int NOT NULL,
  integrity_hash  text NOT NULL,
  signature       text NOT NULL,
  public_key_id   text NOT NULL,
  calculated_at   timestamptz NOT NULL,
  CONSTRAINT chk_index_value CHECK (index_value BETWEEN 0 AND 100)
);

-- Append-only enforcement (one snapshot per timestamp)
CREATE UNIQUE INDEX IF NOT EXISTS idx_snapshot_timestamp
  ON global_state_snapshots (calculated_at);

-- Performance: fetch latest snapshots quickly
CREATE INDEX IF NOT EXISTS idx_snapshot_latest
  ON global_state_snapshots (calculated_at DESC);

-- 3. system_events: Raw metric events from nodes
CREATE TABLE IF NOT EXISTS system_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type   text NOT NULL,
  metric_key   text NOT NULL,
  metric_value numeric NOT NULL,
  node_id      text,
  recorded_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for the 60-second aggregation window
CREATE INDEX IF NOT EXISTS idx_events_recorded_at
  ON system_events (recorded_at DESC);

-- 4. Aggregation view: last 60 seconds of metrics
CREATE OR REPLACE VIEW current_system_metrics AS
SELECT
  AVG(CASE WHEN metric_key = 'index_value'     THEN metric_value END) AS index_value,
  AVG(CASE WHEN metric_key = 'consensus_ratio' THEN metric_value END) AS consensus_ratio,
  AVG(CASE WHEN metric_key = 'reserve_ratio'   THEN metric_value END) AS reserve_ratio,
  AVG(CASE WHEN metric_key = 'volatility_band' THEN metric_value END) AS volatility_band,
  COUNT(DISTINCT node_id)                                              AS active_nodes
FROM system_events
WHERE recorded_at >= now() - interval '60 seconds';
