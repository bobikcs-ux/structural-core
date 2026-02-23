"use client"

import { useEffect, useState, useRef } from "react"
import { SYSTEM_METRICS, generateLogs } from "@/lib/data"
import type { LogEntry } from "@/lib/data"

function levelColor(level: LogEntry["level"]) {
  switch (level) {
    case "CRIT": return "text-[#8b2020]"
    case "WARN": return "text-gold"
    case "SYS": return "text-muted"
    default: return "text-foreground"
  }
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-1.5">
      <div className="text-[8px] text-muted tracking-wider uppercase leading-none">{label}</div>
      <div className="text-[11px] text-gold font-semibold tabular-nums leading-tight mt-0.5">{value}</div>
    </div>
  )
}

export function ScannerPanel() {
  const [logs, setLogs] = useState<LogEntry[]>(() => generateLogs(50))
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => {
        const newLog = generateLogs(1).map((l) => ({
          ...l,
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          message: l.message + ` [seq:${Math.floor(Math.random() * 99999)}]`,
        }))
        return [...prev.slice(-99), ...newLog]
      })
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* System Integrity Metrics -- top bar */}
      <div className="grid grid-cols-5 border-b border-border shrink-0">
        <MetricCell label="MEMORY" value={SYSTEM_METRICS.memoryUsage} />
        <MetricCell label="CPU" value={SYSTEM_METRICS.cpuLoad} />
        <MetricCell label="LATENCY" value={SYSTEM_METRICS.latency} />
        <MetricCell label="NODES" value={SYSTEM_METRICS.nodeStatus} />
        <MetricCell label="INTEGRITY" value={SYSTEM_METRICS.integrity} />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-4 border-b border-border shrink-0">
        <MetricCell label="UPTIME" value={SYSTEM_METRICS.uptime} />
        <MetricCell label="BLOCK" value={SYSTEM_METRICS.blockHeight} />
        <MetricCell label="THROUGHPUT" value={SYSTEM_METRICS.throughput} />
        <MetricCell label="PENDING TX" value={SYSTEM_METRICS.pendingTx} />
      </div>

      {/* Scanner header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-border bg-surface shrink-0">
        <span className="text-[9px] text-muted tracking-wider uppercase">
          SYSTEM SCANNER // REAL-TIME LOG
        </span>
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 bg-[#4a7a3a] animate-pulse" />
          <span className="text-[9px] text-[#4a7a3a] tracking-wider">ACTIVE</span>
        </div>
      </div>

      {/* Log output */}
      <div ref={logRef} className="flex-1 overflow-y-auto bg-background">
        {logs.map((log, i) => (
          <div
            key={`${log.timestamp}-${i}`}
            className="flex items-start px-2 py-px text-[10px] border-b border-border hover:bg-surface transition-colors duration-75"
          >
            <span className="text-muted tabular-nums shrink-0" style={{ width: "130px" }}>
              {log.timestamp}
            </span>
            <span className={`shrink-0 font-semibold ${levelColor(log.level)}`} style={{ width: "36px" }}>
              {log.level}
            </span>
            <span className="text-gold shrink-0" style={{ width: "60px" }}>
              {log.module}
            </span>
            <span className="text-foreground">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
