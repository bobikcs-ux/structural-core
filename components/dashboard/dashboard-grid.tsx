import { RegionCard } from "./region-card"
import type { IntegrityRecord, DriftData } from "@/lib/types"

interface DashboardGridProps {
  records: IntegrityRecord[]
  driftDataMap: Record<string, DriftData>
}

export function DashboardGrid({ records, driftDataMap }: DashboardGridProps) {
  if (records.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed border-border bg-card/50">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No regions available</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Data will appear once regions are configured
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {records.map((record) => (
        <RegionCard
          key={record.id}
          record={record}
          driftData={driftDataMap[record.payload.region_id]}
        />
      ))}
    </div>
  )
}
