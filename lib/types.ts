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
// BOBIKCS SRI PROTOCOL v3.0 - Database Types (matching exact schema)
// ============================================================================

/**
 * signing_keys table
 * Stores public keys for signature verification with key rotation support
 */
export interface SigningKey {
  id: string                    // uuid
  key_id: string                // e.g. 'BOBIKCS-SRI-2026-V1'
  public_key_base64: string     // raw 32-byte tweetnacl public key, base64
  algorithm: string             // 'Ed25519'
  is_active: boolean
  created_at: string            // timestamptz
  retired_at: string | null     // NULL = still valid
}

/**
 * fred_raw_data table
 * Append-only storage for raw FRED API data
 */
export interface FredRawData {
  id: string                    // uuid
  fetched_at: string            // timestamptz
  dgs10: number                 // 10-Year Treasury Yield
  dgs2: number                  // 2-Year Treasury Yield
  cpiaucsl: number              // CPI (current month)
  cpi_12m_ago: number           // CPI (12 months prior)
  fedfunds: number              // Federal Funds Rate
  m2sl: number                  // M2 Money Supply (current)
  m2sl_12m_ago: number          // M2 (12 months prior)
  payload_hash: string          // SHA-256 of raw JSON payload before parsing
}

/**
 * global_state_snapshots table
 * Append-only chain of signed SRI snapshots
 */
export interface GlobalStateSnapshot {
  id: string                    // uuid
  version: number               // always 1 for now
  
  // SRI Components (all 0–1)
  sri_value: number
  spread_score: number
  inflation_score: number
  rate_score: number
  liquidity_score: number
  
  // Chain integrity
  prev_hash: string             // 'GENESIS' for first record, else integrity_hash of previous
  fred_data_hash: string        // payload_hash from fred_raw_data row
  
  // Cryptographic fields
  integrity_hash: string        // SHA-256(canonical_string) as lowercase hex
  signature: string             // nacl.sign.detached → base64
  public_key_id: string         // FK → signing_keys.key_id
  
  calculated_at: string         // timestamptz - ISO 8601, no ms, Z suffix
}

/**
 * Insert type for global_state_snapshots (without auto-generated fields)
 */
export interface GlobalStateSnapshotInsert {
  version: number
  sri_value: number
  spread_score: number
  inflation_score: number
  rate_score: number
  liquidity_score: number
  prev_hash: string
  fred_data_hash: string
  integrity_hash: string
  signature: string
  public_key_id: string
  calculated_at: string
}

/**
 * Insert type for fred_raw_data (without auto-generated fields)
 */
export interface FredRawDataInsert {
  dgs10: number
  dgs2: number
  cpiaucsl: number
  cpi_12m_ago: number
  fedfunds: number
  m2sl: number
  m2sl_12m_ago: number
  payload_hash: string
}

// ============================================================================
// FRED API Types
// ============================================================================

/**
 * FRED API single observation
 */
export interface FredObservation {
  date: string
  value: string                 // FRED returns values as strings
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
 * FRED series IDs used for SRI calculation
 */
export type FredSeriesId = 
  | "DGS10"      // 10-Year Treasury Constant Maturity Rate
  | "DGS2"       // 2-Year Treasury Constant Maturity Rate
  | "CPIAUCSL"   // Consumer Price Index for All Urban Consumers
  | "FEDFUNDS"   // Federal Funds Effective Rate
  | "M2SL"       // M2 Money Stock

// ============================================================================
// SRI Snapshot Type (for client-side verification)
// ============================================================================

/**
 * SRISnapshot - Client-facing snapshot format for verification
 * This is the shape returned by /api/v1/pulse and /api/v1/snapshot
 */
export interface SRISnapshot {
  id: string
  version: number
  sri_value: number
  spread_score: number
  inflation_score: number
  rate_score: number
  liquidity_score: number
  prev_hash: string
  fred_data_hash: string
  integrity_hash: string
  signature: string
  public_key_id: string
  calculated_at: string  // "2026-02-25T08:00:00Z" — no ms
  _source?: "live" | "fallback"  // Data provenance indicator
  _benchmarks?: {  // Present when using fallback data
    FED_FUNDS: number
    CPI_INFLATION: number
    YIELD_SPREAD: number
    M2_GROWTH: number
  }
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Signed API response envelope for public endpoints
 */
export interface SignedApiResponse<T = unknown> {
  data: T
  signature: string
  integrity_hash: string
  signed_at: string
  key_id: string
}

/**
 * Public SRI data returned by API
 */
export interface PublicSRIData {
  sri_value: number
  spread_score: number
  inflation_score: number
  rate_score: number
  liquidity_score: number
  calculated_at: string
  version: number
}

// ============================================================================
// UI State Types
// ============================================================================

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

/**
 * SRI Dashboard display data
 */
export interface SRIDashboardData {
  current: GlobalStateSnapshot | null
  history: GlobalStateSnapshot[]
  verification_status: VerificationStatus
  last_updated: string | null
}

/**
 * Event types for audit logging (future use)
 */
export type StructuralEventType = 
  | "INDEX_UPDATE" 
  | "SIGNATURE_VERIFIED" 
  | "SIGNATURE_FAILED" 
  | "KEY_ROTATION" 
  | "SYSTEM_ERROR"
