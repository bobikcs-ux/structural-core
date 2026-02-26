import { cn } from "@/lib/utils"

interface StatusSummaryProps {
  healthy: number
  stale: number
  delayed: number
  offline: number
}

export function StatusSummary({ healthy, stale, delayed, offline }: StatusSummaryProps) {
  const total = healthy + stale + delayed + offline
  const warningCount = stale + delayed

  const segments = [
    { count: healthy, color: "bg-status-healthy", label: "Healthy" },
    { count: warningCount, color: "bg-status-warning", label: "Warning" },
    { count: offline, color: "bg-status-offline", label: "Offline" },
  ].filter((s) => s.count > 0)

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          System Status
        </h3>
        <span className="text-xs text-muted-foreground">{total} regions</span>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-secondary">
        {segments.map((segment, index) => (
          <div
            key={segment.label}
            className={cn(segment.color, "transition-all duration-500")}
            style={{ width: `${(segment.count / total) * 100}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5">
            <div className={cn("h-2 w-2 rounded-full", segment.color)} />
            <span className="text-xs text-muted-foreground">
              {segment.count} {segment.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
