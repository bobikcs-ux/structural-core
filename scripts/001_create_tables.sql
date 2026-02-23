-- BOBIKCS // STRUCTURAL CORE -- Database Schema
-- Sovereign Intelligence Platform -- Deterministic Tables

-- 1. Global Index Snapshots (Dashboard / INDEX)
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

-- 2. Structural Events (Scanner / Realtime log)
CREATE TABLE IF NOT EXISTS public.structural_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL DEFAULT 'INFO' CHECK (level IN ('INFO', 'WARN', 'CRIT', 'SYS')),
  module TEXT NOT NULL DEFAULT 'CORE',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Intel Audit Log (Archive / Transaction ledger)
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

-- 4. Structural Index Snapshot Runs (Simulation Lab)
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

-- RPC: run_structural_snapshot
-- Executes a deterministic stress test and stores results
CREATE OR REPLACE FUNCTION public.run_structural_snapshot(
  p_run_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  run_record structural_index_snapshot_runs%ROWTYPE;
  results JSONB := '[]'::JSONB;
  epoch_result JSONB;
  baseline NUMERIC := 100;
  shock NUMERIC;
  stress NUMERIC;
  yield_val NUMERIC;
  drawdown NUMERIC;
  recovery NUMERIC;
  verdict TEXT;
  i INT;
BEGIN
  SELECT * INTO run_record FROM structural_index_snapshot_runs WHERE id = p_run_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Run not found');
  END IF;

  UPDATE structural_index_snapshot_runs SET status = 'RUNNING' WHERE id = p_run_id;

  FOR i IN 1..run_record.duration LOOP
    shock := run_record.shock_magnitude * sin((i * 0.5) + 1) * (1 + run_record.correlation_factor * 0.1);
    stress := GREATEST(0, LEAST(100, 50 + shock * 3 + ((i * 17) % 30) - 15));
    yield_val := baseline * (1 - stress / 200) * (run_record.reserve_ratio / 100);
    drawdown := GREATEST(0, stress - run_record.liquidity_floor);
    baseline := baseline * (1 - drawdown * 0.001);
    recovery := GREATEST(0, 100 - drawdown * 1.5);

    IF stress > 75 THEN verdict := 'FAIL';
    ELSIF stress > 55 THEN verdict := 'MARGINAL';
    ELSE verdict := 'PASS';
    END IF;

    epoch_result := jsonb_build_object(
      'epoch', i,
      'stress', ROUND(stress::NUMERIC, 2),
      'yield', ROUND(yield_val::NUMERIC, 2),
      'drawdown', ROUND(drawdown::NUMERIC, 2),
      'recovery', ROUND(recovery::NUMERIC, 2),
      'verdict', verdict
    );
    results := results || epoch_result;
  END LOOP;

  UPDATE structural_index_snapshot_runs 
  SET results = results, status = 'COMPLETE', completed_at = now() 
  WHERE id = p_run_id;

  RETURN results;
END;
$$;

-- Enable Realtime on structural_events for live scanner feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.structural_events;
