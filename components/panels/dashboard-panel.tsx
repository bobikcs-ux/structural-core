"use client"

import { useEffect, useState, useMemo } from "react"
import { DASHBOARD_METRICS, generateMetrics, generateLogs } from "@/lib/data"
import type { LogEntry, MetricPoint } from "@/lib/data"

function MiniChart({ data }: { data: MetricPoint[] }) {
  const max = Math.max(...data.map((d) => d.v))
  const min = Math.min(...data.map((d) => d.v))
  const range = max - min || 1
  const h = 48
  const w = 200

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((d.v - min) / range) * (h - 4) - 2
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: "48px" }}>
      <polyline
        points={points}
        fill="none"
        stroke="#C9A66B"
        strokeWidth="1"
      />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * w
        const y = h - ((d.v - min) / range) * (h - 4) - 2
        return i % 4 === 0 ? (
          <circle key={i} cx={x} cy={y} r="1.5" fill="#C9A66B" />
        ) : null
      })}
    </svg>
  )
}

function levelColor(level: LogEntry["level"]) {
  switch (level) {
    case "CRIT": return "text-[#8b2020]"
    case "WARN": return "text-gold"
    case "SYS": return "text-muted"
    default: return "text-foreground"
  }
}

export function DashboardPanel() {
  const metrics = useMemo(() => generateMetrics(40), [])
  const [logs, setLogs] = useState<LogEntry[]>(() => generateLogs(8))

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => {
        const newLogs = generateLogs(1).map((l) => ({
          ...l,
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        }))
        return [...prev.slice(-7), ...newLogs]
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Metrics grid */}
      <div className="grid grid-cols-3 border-b border-border shrink-0">
        {DASHBOARD_METRICS.map((m) => (
          <div key={m.label} className="border-r border-b border-border p-2 last:border-r-0">
            <div className="text-[9px] text-muted tracking-wider uppercase">{m.label}</div>
            <div className="text-[14px] text-gold font-semibold tabular-nums leading-tight mt-0.5">
              {m.value}
            </div>
            <div className="text-[9px] text-muted tabular-nums">{m.delta}</div>
          </div>
        ))}
      </div>

      {/* Chart section */}
      <div className="border-b border-border p-2 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] text-muted tracking-wider uppercase">SYSTEM LOAD // 40-EPOCH WINDOW</span>
          <span className="text-[9px] text-gold tabular-nums">LIVE</span>
        </div>
        <MiniChart data={metrics} />
      </div>

      {/* Recent activity log */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-2 py-1 border-b border-border bg-surface shrink-0">
          <span className="text-[9px] text-muted tracking-wider uppercase">ACTIVITY LOG // LATEST</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {logs.map((log, i) => (
            <div
              key={`${log.timestamp}-${i}`}
              className="flex items-start gap-2 px-2 py-0.5 border-b border-border text-[10px]"
            >
              <span className="text-muted tabular-nums shrink-0 w-[130px]">{log.timestamp}</span>
              <span className={`shrink-0 w-[32px] font-semibold ${levelColor(log.level)}`}>{log.level}</span>
              <span className="text-gold shrink-0 w-[56px]">{log.module}</span>
              <span className="text-foreground truncate">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
