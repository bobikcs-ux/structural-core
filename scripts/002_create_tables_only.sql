-- BOBIKCS // STRUCTURAL CORE -- Tables Only

CREATE TABLE IF NOT EXISTS public.global_index_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_height BIGINT NOT NULL DEFAULT 0,
  tx_throughput NUMERIC(12,2) NOT NULL DEFAULT 0,
  consensus_round BIGINT NOT NULL DEFAULT 0,
  reserves NUMERIC(18,4) NOT NULL DEFAULT 0,
  integrity NUMERIC(8,4) NOT NULL DEFAULT 99.9997,
  active_nodes INT NOT NULL DEFAULT 7,
  total_nodes INT NOT NULL DEFAULT 7,
  system_load NUMERIC(6,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.structural_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL DEFAULT 'INFO' CHECK (level IN ('INFO', 'WARN', 'CRIT', 'SYS')),
  module TEXT NOT NULL DEFAULT 'CORE',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.intel_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash TEXT NOT NULL,
  tx_type TEXT NOT NULL DEFAULT 'TRANSFER',
  entity TEXT NOT NULL DEFAULT 'VAULT_A',
  amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'PENDING', 'REJECTED')),
  governance_ts TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.structural_index_snapshot_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shock_magnitude NUMERIC(8,2) NOT NULL,
  duration INT NOT NULL,
  correlation_factor NUMERIC(8,2) NOT NULL,
  liquidity_floor NUMERIC(8,2) NOT NULL,
  reserve_ratio NUMERIC(8,2) NOT NULL,
  results JSONB,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETE', 'FAILED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
