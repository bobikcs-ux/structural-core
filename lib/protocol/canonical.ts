import type { SystemMetrics } from "./types"

/**
 * Build the canonical payload object from aggregated metrics.
 * Keys are sorted alphabetically for deterministic serialization.
 */
export function buildCanonicalPayload(
  metrics: SystemMetrics,
  version: number = 1
) {
  return {
    active_nodes: metrics.active_nodes,
    consensus_ratio: metrics.consensus_ratio,
    index_value: metrics.index_value,
    reserve_ratio: metrics.reserve_ratio,
    version,
    volatility_band: metrics.volatility_band,
  }
}

/**
 * Deterministic JSON serialization with sorted keys.
 */
export function canonicalJSON(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, Object.keys(obj).sort())
}
