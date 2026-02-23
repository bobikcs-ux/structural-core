"use client"

import { useLatestSnapshot, useRecentEvents, useConnectionHealth } from "@/lib/hooks"

function severityColor(severity: string) {
  switch (severity) {
    case "HIGH": return "text-[#8b2020]"
    case "MEDIUM": return "text-gold"
    default: return "text-foreground"
  }
}

function MiniChart({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const h = 48
  const w = 200

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / range) * (h - 4) - 2
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: "48px" }} role="img" aria-label="System load chart">
      <polyline points={points} fill="none" stroke="#C9A66B" strokeWidth="1" />
      {data.map((v, i) => {
        if (i % 4 !== 0) return null
        const x = (i / (data.length - 1)) * w
        const y = h - ((v - min) / range) * (h - 4) - 2
        return <circle key={i} cx={x} cy={y} r="1.5" fill="#C9A66B" />
      })}
    </svg>
  )
}

export function DashboardPanel() {
  const { data: snapshot, error: snapError } = useLatestSnapshot()
  const { data: events, error: eventsError } = useRecentEvents(12)
  const { data: health } = useConnectionHealth()

  const isLoading = !snapshot && !snapError

  const metrics = snapshot ? [
    { label: "BLOCK HEIGHT", value: Number(snapshot.block_height).toLocaleString(), delta: `NODE: ${snapshot.active_nodes}` },
    { label: "TX THROUGHPUT", value: `${Number(snapshot.throughput_tps).toLocaleString()}/s`, delta: "TPS" },
    { label: "CONSENSUS", value: `${(Number(snapshot.consensus_ratio) * 100).toFixed(2)}%`, delta: "RATIO" },
    { label: "RESERVE INDEX", value: Number(snapshot.reserve_index).toFixed(4), delta: "CALIBRATED" },
    { label: "INTEGRITY", value: snapshot.integrity_hash, delta: "HASH" },
    { label: "ACTIVE NODES", value: String(snapshot.active_nodes), delta: "ONLINE" },
  ] : []

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Connection status */}
      <div className="flex items-center justify-between px-2 py-0.5 border-b border-border bg-surface shrink-0">
        <span className="text-[8px] text-muted tracking-wider uppercase">
          SUPABASE LINK // {health?.connected ? "CONNECTED" : "SEVERED"}
        </span>
        <span className="text-[8px] text-gold tabular-nums">
          {health ? `${health.latency}ms` : "---"}
        </span>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] text-muted tracking-wider uppercase animate-pulse">SYNCING // FETCHING SNAPSHOT...</span>
        </div>
      ) : snapError ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] text-[#8b2020] tracking-wider uppercase">CRITICAL: LINK SEVERED</span>
        </div>
      ) : (
        <>
          {/* Metrics grid */}
          <div className="grid grid-cols-3 border-b border-border shrink-0">
            {metrics.map((m) => (
              <div key={m.label} className="border-r border-b border-border p-2 last:border-r-0">
                <div className="text-[9px] text-muted tracking-wider uppercase">{m.label}</div>
                <div className="text-[14px] text-gold font-semibold tabular-nums leading-tight mt-0.5">{m.value}</div>
                <div className="text-[9px] text-muted tabular-nums">{m.delta}</div>
              </div>
            ))}
          </div>

          {/* Chart section */}
          <div className="border-b border-border p-2 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-muted tracking-wider uppercase">SYSTEM LOAD // EPOCH WINDOW</span>
              <span className="text-[9px] text-gold tabular-nums">LIVE</span>
            </div>
            <MiniChart data={snapshot?.system_load ?? []} />
          </div>

          {/* Recent activity log from Supabase */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-2 py-1 border-b border-border bg-surface shrink-0">
              <span className="text-[9px] text-muted tracking-wider uppercase">
                ACTIVITY LOG // {events?.length ?? 0} EVENTS {eventsError ? "// ERROR" : ""}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {(events ?? []).map((evt: Record<string, string>) => (
                <div
                  key={evt.id}
                  className="flex items-start gap-2 px-2 py-0.5 border-b border-border text-[10px]"
                >
                  <span className="text-muted tabular-nums shrink-0 w-[130px]">
                    {new Date(evt.created_at).toISOString().replace("T", " ").slice(0, 19)}
                  </span>
                  <span className={`shrink-0 w-[40px] font-semibold ${severityColor(evt.severity)}`}>
                    {evt.severity}
                  </span>
                  <span className="text-gold shrink-0 w-[70px]">{evt.event_type}</span>
                  <span className="text-muted shrink-0 w-[70px]">{evt.source_node}</span>
                  <span className="text-foreground truncate">{evt.message}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
