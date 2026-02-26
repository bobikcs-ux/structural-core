export interface RegionPayload {
  region_id: string
  index: number
  status: "healthy" | "stale" | "delayed" | "offline"
  quality: number
  updated_at: string
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
