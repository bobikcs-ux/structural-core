import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
  status: "healthy" | "stale" | "delayed" | "offline"
  showLabel?: boolean
}

const statusConfig = {
  healthy: {
    color: "bg-status-healthy",
    glow: "glow-green",
    label: "Healthy",
    pulseColor: "bg-status-healthy/50",
  },
  stale: {
    color: "bg-status-warning",
    glow: "glow-amber",
    label: "Stale",
    pulseColor: "bg-status-warning/50",
  },
  delayed: {
    color: "bg-status-warning",
    glow: "glow-amber",
    label: "Delayed",
    pulseColor: "bg-status-warning/50",
  },
  offline: {
    color: "bg-status-offline",
    glow: "glow-red",
    label: "Offline",
    pulseColor: "bg-status-offline/50",
  },
}

export function StatusIndicator({ status, showLabel = false }: StatusIndicatorProps) {
  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-2">
      <div className={cn("relative flex h-2.5 w-2.5 items-center justify-center", config.glow)}>
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            config.pulseColor
          )}
        />
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", config.color)} />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {config.label}
        </span>
      )}
    </div>
  )
}
