export interface SystemMetrics {
  index_value: number
  consensus_ratio: number
  reserve_ratio: number
  volatility_band: number
  active_nodes: number
}

export interface GlobalStateSnapshot {
  id: string
  version: number
  index_value: number
  consensus_ratio: number
  reserve_ratio: number
  volatility_band: number
  active_nodes: number
  integrity_hash: string
  signature: string
  public_key_id: string
  calculated_at: string
}

export interface SigningKey {
  id: string
  key_id: string
  public_key_base64: string
  algorithm: string
  is_active: boolean
  created_at: string
  retired_at: string | null
}

export interface SystemEvent {
  id?: string
  event_type: string
  metric_key: string
  metric_value: number
  node_id?: string
  recorded_at?: string
}

export interface VerificationResult {
  valid: boolean
  snapshot_id: string
  integrity_hash: string
  public_key_id: string
  algorithm: string
  verified_at: string
}
