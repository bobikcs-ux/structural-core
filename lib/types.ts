// ============================================================================
// Financial Integrity Dashboard Types
// ============================================================================

export interface RegionPayload {
  region_id: string
  region_name?: string
  index: number
  status: "healthy" | "stale" | "delayed" | "offline"
  quality: number
  updated_at: string
  trend_30d?: number[]
  trend_90d?: number[]
}

export interface IntegrityRecord {
  id: string
  payload: RegionPayload
  integrity_hash: string | null
  created_at: string
}

export interface DriftData {
  trend_30d: number[]
  trend_90d: number[]
  change_30d: number
  change_90d: number
}

// ============================================================================
// BOBIKCS SRI PROTOCOL v3.0 Types
// ============================================================================

/**
 * Structural Reserve Index - Core data structure for prediction market integrity
 */
export interface StructuralReserveIndex {
  reserve_index: number
  timestamp: string
  source: "FRED" | "MANUAL" | "COMPUTED"
  metadata?: Record<string, unknown>
}

/**
 * Signed API response envelope for cryptographic verification
 */
export interface SignedApiResponse<T = unknown> {
  data: T
  signature: string
  signed_at: string
  key_id: string
  integrity_hash: string
}

/**
 * FRED API data point structure
 */
export interface FredObservation {
  date: string
  value: string
}

/**
 * FRED API response structure
 */
export interface FredApiResponse {
  realtime_start: string
  realtime_end: string
  observation_start: string
  observation_end: string
  units: string
  output_type: number
  file_type: string
  order_by: string
  sort_order: string
  count: number
  offset: number
  limit: number
  observations: FredObservation[]
}

/**
 * Global index snapshot stored in Supabase
 */
export interface GlobalIndexSnapshot {
  id: string
  reserve_index: number
  integrity_hash: string
  signed_payload: SignedApiResponse<StructuralReserveIndex>
  source: "FRED" | "MANUAL" | "COMPUTED"
  fred_series_id?: string
  created_at: string
  updated_at: string
}

/**
 * Structural event for audit logging
 */
export interface StructuralEvent {
  id: string
  event_type: "INDEX_UPDATE" | "SIGNATURE_VERIFIED" | "SIGNATURE_FAILED" | "KEY_ROTATION" | "SYSTEM_ERROR"
  event_data: Record<string, unknown>
  created_at: string
}

/**
 * Verification status for UI display
 */
export type VerificationStatus = "verified" | "unverified" | "failed" | "pending"

/**
 * Dashboard card data with verification info
 */
export interface VerifiedRegionData extends IntegrityRecord {
  verification_status: VerificationStatus
  verified_at?: string
}
