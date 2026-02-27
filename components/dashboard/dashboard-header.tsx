import { Activity, RefreshCw, Shield, Clock } from "lucide-react"

interface DashboardHeaderProps {
  totalRegions: number
  healthyCount: number
  verifiedCount: number
  lastUpdated: string
}

export function DashboardHeader({
  totalRegions,
  healthyCount,
  verifiedCount,
  lastUpdated,
}: DashboardHeaderProps) {
  const healthRate = totalRegions > 0 ? (healthyCount / totalRegions) * 100 : 0
  const verificationRate = totalRegions > 0 ? (verifiedCount / totalRegions) * 100 : 0

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                Structural Core
              </h1>
              <p className="text-xs text-muted-foreground">Financial Integrity Dashboard</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6">
            {/* Regions */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{totalRegions}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Regions
                </p>
              </div>
            </div>

            {/* Health Rate */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-status-healthy/10">
                <RefreshCw className="h-4 w-4 text-status-healthy" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{healthRate.toFixed(0)}%</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Healthy
                </p>
              </div>
            </div>

            {/* Verification Rate */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {verificationRate.toFixed(0)}%
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Verified
                </p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{lastUpdated}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Updated
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
