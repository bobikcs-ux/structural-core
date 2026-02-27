import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardGrid } from "@/components/dashboard/dashboard-grid"
import { StatusSummary } from "@/components/dashboard/status-summary"
import type { IntegrityRecord, DriftData } from "@/lib/types"

// Generate mock drift data for demonstration
function generateDriftData(regionId: string): DriftData {
  // Seeded random based on region ID for consistency
  const seed = regionId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000
    return x - Math.floor(x)
  }

  const generateTrend = (days: number, baseChange: number): number[] => {
    const data: number[] = []
    let value = 100
    for (let i = 0; i < days; i++) {
      const change = (random(i) - 0.5) * 2 + baseChange / days
      value += change
      data.push(value)
    }
    return data
  }

  const change30d = (random(1) - 0.5) * 10
  const change90d = (random(2) - 0.5) * 15

  return {
    trend_30d: generateTrend(30, change30d),
    trend_90d: generateTrend(90, change90d),
    change_30d: change30d,
    change_90d: change90d,
  }
}

// Fallback mock data for development/demo
function getMockData(): IntegrityRecord[] {
  return [
    {
      id: "1",
      payload: {
        region_id: "NA-EAST-1",
        index: 2847.32,
        status: "healthy",
        quality: 0.98,
        updated_at: new Date(Date.now() - 120000).toISOString(),
      },
      integrity_hash: "sha256:8f14e45f...b983c1d2",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      payload: {
        region_id: "NA-WEST-2",
        index: 1923.87,
        status: "healthy",
        quality: 0.95,
        updated_at: new Date(Date.now() - 300000).toISOString(),
      },
      integrity_hash: "sha256:7c82fa6c...a2e4f1b3",
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      payload: {
        region_id: "EU-CENTRAL-1",
        index: 3156.44,
        status: "stale",
        quality: 0.87,
        updated_at: new Date(Date.now() - 1800000).toISOString(),
      },
      integrity_hash: "sha256:9b2c5e8a...d4f6a2c1",
      created_at: new Date().toISOString(),
    },
    {
      id: "4",
      payload: {
        region_id: "EU-WEST-1",
        index: 2654.91,
        status: "healthy",
        quality: 0.99,
        updated_at: new Date(Date.now() - 60000).toISOString(),
      },
      integrity_hash: "sha256:1a3b5c7d...e9f1a2b3",
      created_at: new Date().toISOString(),
    },
    {
      id: "5",
      payload: {
        region_id: "AP-SOUTH-1",
        index: 1478.23,
        status: "delayed",
        quality: 0.82,
        updated_at: new Date(Date.now() - 2400000).toISOString(),
      },
      integrity_hash: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "6",
      payload: {
        region_id: "AP-EAST-1",
        index: 2103.56,
        status: "healthy",
        quality: 0.94,
        updated_at: new Date(Date.now() - 180000).toISOString(),
      },
      integrity_hash: "sha256:4d6f8a1b...c3e5f7a9",
      created_at: new Date().toISOString(),
    },
    {
      id: "7",
      payload: {
        region_id: "SA-EAST-1",
        index: 987.65,
        status: "offline",
        quality: 0.0,
        updated_at: new Date(Date.now() - 7200000).toISOString(),
      },
      integrity_hash: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "8",
      payload: {
        region_id: "ME-SOUTH-1",
        index: 1567.89,
        status: "healthy",
        quality: 0.91,
        updated_at: new Date(Date.now() - 240000).toISOString(),
      },
      integrity_hash: "sha256:2b4d6f8a...1c3e5f79",
      created_at: new Date().toISOString(),
    },
  ]
}

async function getIntegrityData(): Promise<IntegrityRecord[]> {
  try {
    const supabase = await createClient()
    
    // Query the regions table directly and transform to expected format
    const { data, error } = await supabase
      .from("regions")
      .select("id, region_id, region_name, index_value, status, quality, integrity_hash, trend_30d, trend_90d, updated_at, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Supabase error:", error)
      return getMockData()
    }

    if (!data || data.length === 0) {
      console.log("[v0] No data from Supabase, using mock data")
      return getMockData()
    }

    // Transform the regions data to match IntegrityRecord format
    const transformedData: IntegrityRecord[] = data.map((row) => ({
      id: row.id,
      payload: {
        region_id: row.region_id,
        region_name: row.region_name,
        index: Number(row.index_value),
        status: row.status as "healthy" | "stale" | "delayed" | "offline",
        quality: Number(row.quality),
        updated_at: row.updated_at,
        trend_30d: row.trend_30d?.map(Number) || [],
        trend_90d: row.trend_90d?.map(Number) || [],
      },
      integrity_hash: row.integrity_hash,
      created_at: row.created_at,
    }))

    return transformedData
  } catch (error) {
    console.error("[v0] Failed to fetch data:", error)
    return getMockData()
  }
}

export const dynamic = "force-dynamic"
export const revalidate = 30

export default async function DashboardPage() {
  const records = await getIntegrityData()

  // Generate drift data for each region
  const driftDataMap: Record<string, DriftData> = {}
  records.forEach((record) => {
    driftDataMap[record.payload.region_id] = generateDriftData(record.payload.region_id)
  })

  // Calculate stats
  const healthyCount = records.filter((r) => r.payload.status === "healthy").length
  const staleCount = records.filter((r) => r.payload.status === "stale").length
  const delayedCount = records.filter((r) => r.payload.status === "delayed").length
  const offlineCount = records.filter((r) => r.payload.status === "offline").length
  const verifiedCount = records.filter((r) => !!r.integrity_hash).length

  // Format last updated time
  const now = new Date()
  const lastUpdated = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        totalRegions={records.length}
        healthyCount={healthyCount}
        verifiedCount={verifiedCount}
        lastUpdated={lastUpdated}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Status Summary */}
          <StatusSummary
            healthy={healthyCount}
            stale={staleCount}
            delayed={delayedCount}
            offline={offlineCount}
          />

          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Regional Indices</h2>
              <p className="text-xs text-muted-foreground">
                Live market data with integrity verification
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Auto-refresh: 30s
              </span>
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-healthy" />
            </div>
          </div>

          {/* Grid */}
          <DashboardGrid records={records} driftDataMap={driftDataMap} />

          {/* Footer */}
          <footer className="border-t border-border pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Structural Core v1.0 | Prediction Market Integrity System
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}
