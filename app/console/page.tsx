"use client"

/**
 * Console Page - Admin System Logs & Health
 * System monitoring, health cards, and consensus metrics
 */

import { useState, useEffect } from "react"
import { 
  Terminal, 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Cpu,
  HardDrive
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

interface LogEntry {
  id: string
  timestamp: string
  level: "INFO" | "WARN" | "ERROR" | "DEBUG"
  source: string
  message: string
}

interface HealthMetric {
  name: string
  status: "healthy" | "degraded" | "offline"
  value: string
  icon: React.ElementType
}

// ============================================================================
// Mock Data
// ============================================================================

const INITIAL_LOGS: LogEntry[] = [
  { id: "1", timestamp: "2026-02-27T14:32:15Z", level: "INFO", source: "SRI_ENGINE", message: "Snapshot computed: SRI=0.5842" },
  { id: "2", timestamp: "2026-02-27T14:32:15Z", level: "INFO", source: "CRYPTO", message: "Ed25519 signature generated, key_id=bobikcs-core-2026" },
  { id: "3", timestamp: "2026-02-27T14:32:14Z", level: "DEBUG", source: "FRED_FETCH", message: "Fetched DGS10: 4.25%" },
  { id: "4", timestamp: "2026-02-27T14:32:14Z", level: "DEBUG", source: "FRED_FETCH", message: "Fetched DGS2: 4.10%" },
  { id: "5", timestamp: "2026-02-27T14:32:13Z", level: "INFO", source: "SSE_PULSE", message: "Broadcasting snapshot to 12 connected clients" },
  { id: "6", timestamp: "2026-02-27T14:30:00Z", level: "WARN", source: "RATE_LIMIT", message: "FRED API rate limit approaching (45/50 requests)" },
  { id: "7", timestamp: "2026-02-27T14:28:45Z", level: "INFO", source: "SUPABASE", message: "Snapshot persisted: id=snap_20260227_143215" },
  { id: "8", timestamp: "2026-02-27T14:25:00Z", level: "INFO", source: "CRON", message: "Scheduled job triggered: daily_snapshot" },
  { id: "9", timestamp: "2026-02-27T14:20:12Z", level: "ERROR", source: "VERIFICATION", message: "Client verification failed: signature mismatch (client_id=c_892)" },
  { id: "10", timestamp: "2026-02-27T14:15:00Z", level: "INFO", source: "SYSTEM", message: "Health check passed: all services operational" },
]

const HEALTH_METRICS: HealthMetric[] = [
  { name: "FRED API", status: "healthy", value: "45/50 req", icon: Wifi },
  { name: "Supabase", status: "healthy", value: "12ms latency", icon: Database },
  { name: "SSE Stream", status: "healthy", value: "12 clients", icon: Activity },
  { name: "Cron Jobs", status: "healthy", value: "On schedule", icon: Clock },
  { name: "CPU Usage", status: "healthy", value: "23%", icon: Cpu },
  { name: "Memory", status: "healthy", value: "512MB/1GB", icon: HardDrive },
]

// ============================================================================
// Main Component
// ============================================================================

export default function ConsolePage() {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS)
  const [filter, setFilter] = useState<string>("ALL")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [consensusPercent, setConsensusPercent] = useState(98.7)
  const [triggering, setTriggering] = useState(false)
  const [triggerResult, setTriggerResult] = useState<{ ok: boolean; message: string } | null>(null)

  // Manual trigger snapshot update
  const triggerSnapshot = async () => {
    setTriggering(true)
    setTriggerResult(null)
    
    try {
      const res = await fetch("/api/v1/snapshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET || "",
        },
      })
      
      if (res.ok) {
        const data = await res.json()
        setTriggerResult({ ok: true, message: `SRI=${data.sri?.toFixed(4)} @ ${data.timestamp}` })
        
        // Add log entry
        const newLog: LogEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          level: "INFO",
          source: "ADMIN",
          message: `Manual snapshot triggered: SRI=${data.sri?.toFixed(4)}`,
        }
        setLogs((prev) => [newLog, ...prev.slice(0, 49)])
      } else {
        const text = await res.text()
        setTriggerResult({ ok: false, message: text || "Failed to trigger" })
      }
    } catch (err) {
      setTriggerResult({ ok: false, message: err instanceof Error ? err.message : "Network error" })
    } finally {
      setTriggering(false)
    }
  }

  // Simulate log updates
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        level: Math.random() > 0.9 ? "WARN" : "INFO",
        source: ["SRI_ENGINE", "CRYPTO", "SSE_PULSE", "SUPABASE"][Math.floor(Math.random() * 4)],
        message: [
          "Heartbeat sent to connected clients",
          "Cache refreshed",
          "Metrics collected",
          "Health check passed",
        ][Math.floor(Math.random() * 4)],
      }
      setLogs((prev) => [newLog, ...prev.slice(0, 49)])
      
      // Fluctuate consensus slightly
      setConsensusPercent((prev) => {
        const delta = (Math.random() - 0.5) * 0.2
        return Math.min(100, Math.max(95, prev + delta))
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const filteredLogs = logs.filter((log) => 
    filter === "ALL" || log.level === filter
  )

  const getLevelColor = (level: string) => {
    switch (level) {
      case "INFO": return "text-[hsl(200,80%,50%)]"
      case "WARN": return "text-[hsl(43,25%,55%)]"
      case "ERROR": return "text-[hsl(0,72%,51%)]"
      case "DEBUG": return "text-[hsl(0,0%,50%)]"
      default: return "text-[hsl(0,0%,50%)]"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="w-4 h-4 text-[hsl(142,76%,46%)]" />
      case "degraded": return <AlertTriangle className="w-4 h-4 text-[hsl(43,25%,55%)]" />
      case "offline": return <XCircle className="w-4 h-4 text-[hsl(0,72%,51%)]" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(0,0%,2%)] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-full mb-6">
            <Terminal className="w-4 h-4 text-[hsl(43,25%,55%)]" />
            <span className="text-[10px] font-mono tracking-wider text-[hsl(0,0%,60%)]">
              ADMIN CONSOLE
            </span>
          </div>
          <h1 className="text-3xl font-mono font-bold text-[hsl(0,0%,90%)] mb-4">
            SYSTEM CONSOLE
          </h1>
          <p className="text-sm font-mono text-[hsl(0,0%,50%)]">
            Real-time system logs, health metrics, and consensus monitoring
          </p>
        </div>

        {/* Trigger Update Button */}
        <div className="mb-8 p-4 bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-mono text-[hsl(0,0%,90%)] mb-1">Manual Snapshot Trigger</h2>
              <p className="text-[10px] font-mono text-[hsl(0,0%,50%)]">
                Fetch fresh FRED data, compute SRI, sign with Ed25519, and persist to database
              </p>
            </div>
            <button
              onClick={triggerSnapshot}
              disabled={triggering}
              className="flex items-center gap-2 px-6 py-3 bg-[hsl(43,25%,55%)] text-[hsl(0,0%,2%)] font-mono text-sm font-semibold rounded hover:bg-[hsl(43,25%,45%)] transition-colors disabled:opacity-50"
            >
              {triggering ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              {triggering ? "PROCESSING..." : "TRIGGER UPDATE"}
            </button>
          </div>
          
          {triggerResult && (
            <div className={`mt-4 p-3 rounded border ${
              triggerResult.ok 
                ? "bg-[hsl(142,50%,40%)]/10 border-[hsl(142,50%,40%)]/20 text-[hsl(142,50%,50%)]"
                : "bg-[hsl(0,60%,45%)]/10 border-[hsl(0,60%,45%)]/20 text-[hsl(0,60%,55%)]"
            }`}>
              <div className="flex items-center gap-2">
                {triggerResult.ok ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span className="text-xs font-mono">{triggerResult.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Consensus */}
          <div className="col-span-2 bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[hsl(43,25%,55%)]" />
                <span className="text-[10px] font-mono text-[hsl(0,0%,50%)] uppercase tracking-wider">
                  Verification Consensus
                </span>
              </div>
              <span className="text-[9px] font-mono text-[hsl(142,76%,46%)]">OPERATIONAL</span>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-mono font-bold text-[hsl(43,25%,55%)]">
                {consensusPercent.toFixed(1)}%
              </span>
              <span className="text-xs font-mono text-[hsl(0,0%,40%)]">
                clients verified
              </span>
            </div>
            <div className="h-2 bg-[hsl(0,0%,10%)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[hsl(142,76%,46%)] transition-all duration-500"
                style={{ width: `${consensusPercent}%` }}
              />
            </div>
          </div>

          {/* Uptime */}
          <div className="bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg p-6">
            <div className="text-[10px] font-mono text-[hsl(0,0%,40%)] uppercase mb-2">Uptime</div>
            <div className="text-2xl font-mono font-bold text-[hsl(0,0%,90%)]">99.97%</div>
            <div className="text-[10px] font-mono text-[hsl(0,0%,40%)] mt-1">30-day average</div>
          </div>

          {/* Snapshots */}
          <div className="bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg p-6">
            <div className="text-[10px] font-mono text-[hsl(0,0%,40%)] uppercase mb-2">Snapshots</div>
            <div className="text-2xl font-mono font-bold text-[hsl(0,0%,90%)]">2,847</div>
            <div className="text-[10px] font-mono text-[hsl(0,0%,40%)] mt-1">Total signed</div>
          </div>
        </div>

        {/* Health Cards */}
        <div className="mb-8">
          <h2 className="text-sm font-mono text-[hsl(0,0%,50%)] uppercase tracking-wider mb-4">
            Service Health
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {HEALTH_METRICS.map((metric) => {
              const Icon = metric.icon
              return (
                <div
                  key={metric.name}
                  className="bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-4 h-4 text-[hsl(43,25%,55%)]" />
                    {getStatusIcon(metric.status)}
                  </div>
                  <div className="text-[10px] font-mono text-[hsl(0,0%,50%)] uppercase mb-1">
                    {metric.name}
                  </div>
                  <div className="text-sm font-mono text-[hsl(0,0%,90%)]">
                    {metric.value}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg overflow-hidden">
          {/* Log Header */}
          <div className="px-4 py-3 border-b border-[hsl(0,0%,12%)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[hsl(43,25%,55%)]" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[hsl(0,0%,50%)]">
                System Logs
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Level Filter */}
              <div className="flex gap-1">
                {["ALL", "INFO", "WARN", "ERROR", "DEBUG"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setFilter(level)}
                    className={`
                      px-2 py-1 text-[9px] font-mono rounded transition-all
                      ${filter === level
                        ? "bg-[hsl(45,90%,50%)]/10 text-[hsl(43,25%,55%)]"
                        : "text-[hsl(0,0%,40%)] hover:text-[hsl(0,0%,60%)]"
                      }
                    `}
                  >
                    {level}
                  </button>
                ))}
              </div>

              {/* Auto Refresh */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`
                  flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono transition-all
                  ${autoRefresh
                    ? "bg-[hsl(142,76%,46%)]/10 text-[hsl(142,76%,46%)]"
                    : "bg-[hsl(0,0%,8%)] text-[hsl(0,0%,40%)]"
                  }
                `}
              >
                <RefreshCw className={`w-3 h-3 ${autoRefresh ? "animate-spin" : ""}`} />
                {autoRefresh ? "LIVE" : "PAUSED"}
              </button>
            </div>
          </div>

          {/* Log Entries */}
          <div className="max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="px-4 py-2 border-b border-[hsl(0,0%,8%)] hover:bg-[hsl(0,0%,5%)] font-mono text-[11px]"
              >
                <div className="flex items-start gap-4">
                  <span className="text-[hsl(0,0%,35%)] w-44 flex-shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </span>
                  <span className={`w-12 flex-shrink-0 ${getLevelColor(log.level)}`}>
                    [{log.level}]
                  </span>
                  <span className="text-[hsl(43,25%,55%)] w-24 flex-shrink-0">
                    {log.source}
                  </span>
                  <span className="text-[hsl(0,0%,60%)] flex-1">
                    {log.message}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
