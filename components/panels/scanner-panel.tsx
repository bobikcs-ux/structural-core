"use client"

import { useEffect, useRef } from "react"
import { useStructuralEvents, useLatestSnapshot, useConnectionHealth } from "@/lib/hooks"

function severityColor(severity: string) {
  switch (severity) {
    case "HIGH": return "text-[#8b2020]"
    case "MEDIUM": return "text-gold"
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
  const { data: events, error } = useStructuralEvents(100)
  const { data: snapshot } = useLatestSnapshot()
  const { data: health } = useConnectionHealth()
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [events])

  const memUsage = snapshot?.system_load
    ? `${(snapshot.system_load.reduce((a: number, b: number) => a + b, 0) / snapshot.system_load.length).toFixed(1)}%`
    : "---"

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* System Integrity Metrics -- top bar */}
      <div className="grid grid-cols-5 border-b border-border shrink-0">
        <MetricCell label="MEMORY" value={memUsage} />
        <MetricCell label="LATENCY" value={health ? `${health.latency}ms` : "---"} />
        <MetricCell label="NODES" value={snapshot ? `${snapshot.active_nodes} ONLINE` : "---"} />
        <MetricCell label="CONSENSUS" value={snapshot ? `${(Number(snapshot.consensus_ratio) * 100).toFixed(2)}%` : "---"} />
        <MetricCell label="INTEGRITY" value={snapshot?.integrity_hash ?? "---"} />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-4 border-b border-border shrink-0">
        <MetricCell label="BLOCK" value={snapshot ? Number(snapshot.block_height).toLocaleString() : "---"} />
        <MetricCell label="THROUGHPUT" value={snapshot ? `${Number(snapshot.throughput_tps).toLocaleString()} TPS` : "---"} />
        <MetricCell label="RESERVE" value={snapshot ? Number(snapshot.reserve_index).toFixed(4) : "---"} />
        <MetricCell label="DB LINK" value={health?.connected ? "ACTIVE" : "SEVERED"} />
      </div>

      {/* Scanner header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-border bg-surface shrink-0">
        <span className="text-[9px] text-muted tracking-wider uppercase">
          SYSTEM SCANNER // REAL-TIME LOG // SUPABASE
        </span>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-1.5 h-1.5 ${error ? "bg-[#8b2020]" : "bg-[#4a7a3a]"} animate-pulse`} />
          <span className={`text-[9px] tracking-wider ${error ? "text-[#8b2020]" : "text-[#4a7a3a]"}`}>
            {error ? "ERROR" : "ACTIVE"}
          </span>
        </div>
      </div>

      {/* Log output */}
      {error ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] text-[#8b2020] tracking-wider uppercase">CRITICAL: LINK SEVERED</span>
        </div>
      ) : (
        <div ref={logRef} className="flex-1 overflow-y-auto bg-background">
          {(events ?? []).map((evt: Record<string, string>) => (
            <div
              key={evt.id}
              className="flex items-start px-2 py-px text-[10px] border-b border-border hover:bg-surface"
            >
              <span className="text-muted tabular-nums shrink-0" style={{ width: "130px" }}>
                {new Date(evt.created_at).toISOString().replace("T", " ").slice(0, 19)}
              </span>
              <span className={`shrink-0 font-semibold ${severityColor(evt.severity)}`} style={{ width: "50px" }}>
                {evt.severity}
              </span>
              <span className="text-gold shrink-0" style={{ width: "80px" }}>
                {evt.event_type}
              </span>
              <span className="text-muted shrink-0" style={{ width: "80px" }}>
                {evt.source_node}
              </span>
              <span className="text-foreground">{evt.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
