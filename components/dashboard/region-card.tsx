import { TrendingUp, TrendingDown, Minus, Clock, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatusIndicator } from "./status-indicator"
import { VerifiedBadge } from "./verified-badge"
import { Sparkline } from "./sparkline"
import type { IntegrityRecord, DriftData } from "@/lib/types"

interface RegionCardProps {
  record: IntegrityRecord
  driftData?: DriftData
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

function getTrendColor(change: number): "green" | "amber" | "red" | "muted" {
  if (change > 2) return "green"
  if (change < -2) return "red"
  if (Math.abs(change) > 0.5) return "amber"
  return "muted"
}

function TrendIndicator({ change, label }: { change: number; label: string }) {
  const isPositive = change > 0
  const isNeutral = Math.abs(change) < 0.1

  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <div
        className={cn(
          "flex items-center gap-0.5 text-xs font-medium",
          isNeutral
            ? "text-muted-foreground"
            : isPositive
              ? "text-status-healthy"
              : "text-status-offline"
        )}
      >
        {isNeutral ? (
          <Minus className="h-3 w-3" />
        ) : isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>{isPositive ? "+" : ""}{change.toFixed(2)}%</span>
      </div>
    </div>
  )
}

export function RegionCard({ record, driftData }: RegionCardProps) {
  const { payload, integrity_hash } = record
  const isVerified = !!integrity_hash
  const statusColorClass =
    payload.status === "healthy"
      ? "border-status-healthy/20"
      : payload.status === "offline"
        ? "border-status-offline/20"
        : "border-status-warning/20"

  const glowClass =
    payload.status === "healthy"
      ? "glow-green"
      : payload.status === "offline"
        ? "glow-red"
        : "glow-amber"

  return (
    <article
      className={cn(
        "group relative rounded-lg border bg-card p-4 transition-all duration-300 hover:bg-secondary/50",
        statusColorClass,
        "hover:border-muted-foreground/30"
      )}
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <StatusIndicator status={payload.status} />
          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            {payload.region_id}
          </h3>
        </div>
        <VerifiedBadge isVerified={isVerified} hash={integrity_hash} />
      </header>

      {/* Index Value - Hero Section */}
      <div className={cn("my-4 rounded-md bg-secondary/50 p-3", glowClass)}>
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Index</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Activity className="h-3 w-3" />
            <span className="text-[10px]">{(payload.quality * 100).toFixed(0)}% quality</span>
          </div>
        </div>
        <p className="mt-1 font-mono text-3xl font-bold tracking-tighter text-foreground">
          {payload.index.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* Drift Analysis */}
      {driftData && (
        <div className="space-y-3 border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Drift Analysis
            </span>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <TrendIndicator change={driftData.change_30d} label="30D" />
              </div>
              <Sparkline
                data={driftData.trend_30d}
                width={100}
                height={20}
                color={getTrendColor(driftData.change_30d)}
              />
            </div>

            <div className="h-10 w-px bg-border" />

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <TrendIndicator change={driftData.change_90d} label="90D" />
              </div>
              <Sparkline
                data={driftData.trend_90d}
                width={100}
                height={20}
                color={getTrendColor(driftData.change_90d)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="text-[10px]">{formatTimestamp(payload.updated_at)}</span>
        </div>
        <StatusIndicator status={payload.status} showLabel />
      </footer>
    </article>
  )
}
