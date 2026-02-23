"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useRealtimeEvents, useHeartbeat, useConnectionHealth } from "@/lib/hooks"

const BASE_REGIONS = [
  { region: "North America", baseIndex: 97.42, baseVol: 0.0031, status: "Stable" },
  { region: "Europe", baseIndex: 94.18, baseVol: 0.0058, status: "Stable" },
  { region: "Asia Pacific", baseIndex: 91.33, baseVol: 0.0087, status: "Elevated" },
  { region: "Middle East", baseIndex: 89.71, baseVol: 0.0102, status: "Elevated" },
  { region: "Latin America", baseIndex: 86.94, baseVol: 0.0134, status: "Elevated" },
  { region: "Sub-Saharan Africa", baseIndex: 83.22, baseVol: 0.0178, status: "Critical" },
  { region: "Central Asia", baseIndex: 88.04, baseVol: 0.0112, status: "Elevated" },
  { region: "Oceania", baseIndex: 95.87, baseVol: 0.0042, status: "Stable" },
]

function statusColor(s: string) {
  if (s === "Critical") return "text-red-500"
  if (s === "Elevated") return "text-amber-500"
  return "text-green-500"
}

// Generate a deterministic-looking jitter from event count
function jitter(base: number, seed: number, range: number) {
  const sin = Math.sin(seed * 9.3 + base * 2.7)
  return base + sin * range
}

export default function ScannerPage() {
  useHeartbeat(5000)
  const { events, channelStatus } = useRealtimeEvents(50)
  const { data: health } = useConnectionHealth()
  const [highlightRow, setHighlightRow] = useState<number | null>(null)
  const [pulseAmplitude, setPulseAmplitude] = useState(0)
  const prevEventCount = useRef(0)
  const logRef = useRef<HTMLDivElement>(null)

  // Detect new events -> trigger pulse + row highlight
  useEffect(() => {
    if (events.length > prevEventCount.current && prevEventCount.current > 0) {
      setPulseAmplitude(1)
      const row = Math.floor(Math.random() * BASE_REGIONS.length)
      setHighlightRow(row)
      const t1 = setTimeout(() => setPulseAmplitude(0), 600)
      const t2 = setTimeout(() => setHighlightRow(null), 1200)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    prevEventCount.current = events.length
  }, [events.length])

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [events.length])

  // Reactive region data based on event count
  const regions = useMemo(() => {
    const seed = events.length
    return BASE_REGIONS.map((r) => ({
      ...r,
      index: jitter(r.baseIndex, seed, 0.15).toFixed(2),
      volatility: jitter(r.baseVol, seed + 1, 0.0003).toFixed(4),
    }))
  }, [events.length])

  // SVG Pulse waveform
  const pulsePoints = useMemo(() => {
    const pts: string[] = []
    const w = 600; const h = 60; const mid = h / 2
    for (let x = 0; x <= w; x += 2) {
      const norm = x / w
      const base = Math.sin(norm * Math.PI * 8) * 4
      const spike = pulseAmplitude * Math.exp(-Math.pow((norm - 0.5) * 6, 2)) * 20
      const y = mid - base - spike
      pts.push(`${x},${y.toFixed(1)}`)
    }
    return pts.join(" ")
  }, [pulseAmplitude])

  const wsColor = channelStatus === "CONNECTED" ? "text-green-500" : "text-amber-500"
  const wsDot = channelStatus === "CONNECTED" ? "bg-green-500 animate-pulse" : "bg-amber-500"

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 pt-20 md:pt-24 pb-16 px-6">
        <div className="mx-auto max-w-6xl">

          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <div className="text-[10px] text-gold tracking-[0.2em] uppercase mb-2">Real-Time Scanner</div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
                Structural Integrity Pulse
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className={`inline-block w-1.5 h-1.5 ${wsDot}`} />
                <span className={`text-[10px] tracking-wider uppercase font-mono ${wsColor}`}>
                  WS:{channelStatus}
                </span>
              </span>
              {health && (
                <span className="text-[10px] text-muted font-mono tabular-nums">
                  {health.latency}ms
                </span>
              )}
              <span className="text-[10px] text-muted font-mono tabular-nums">
                {events.length} events
              </span>
            </div>
          </div>

          {/* Structural Integrity Pulse SVG */}
          <div className="border border-border p-4 mb-8" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
            <div className="text-[10px] text-muted tracking-wider uppercase mb-2 font-mono">
              STRUCTURAL PULSE // {pulseAmplitude > 0 ? "EVENT DETECTED" : "MONITORING"}
            </div>
            <svg
              viewBox="0 0 600 60"
              className="w-full"
              style={{ height: "60px" }}
              aria-label="Structural integrity pulse waveform"
              role="img"
            >
              <line x1="0" y1="30" x2="600" y2="30" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              <polyline
                points={pulsePoints}
                fill="none"
                stroke={pulseAmplitude > 0 ? "#C9A66B" : "rgba(255,255,255,0.2)"}
                strokeWidth={pulseAmplitude > 0 ? "2" : "1"}
                style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
              />
            </svg>
          </div>

          {/* Regional Breakdown -- Reactive Table */}
          <div className="mb-8">
            <div className="text-[10px] text-gold tracking-[0.2em] uppercase mb-4">Regional Breakdown</div>

            {/* Desktop table */}
            <div className="hidden md:block border border-border">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                    <th className="text-left text-[10px] text-muted tracking-wider uppercase font-medium py-3 px-4 border-b border-border">Region</th>
                    <th className="text-right text-[10px] text-muted tracking-wider uppercase font-medium py-3 px-4 border-b border-border">Index</th>
                    <th className="text-right text-[10px] text-muted tracking-wider uppercase font-medium py-3 px-4 border-b border-border">Volatility</th>
                    <th className="text-right text-[10px] text-muted tracking-wider uppercase font-medium py-3 px-4 border-b border-border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {regions.map((r, i) => (
                    <tr
                      key={r.region}
                      className="border-b border-border last:border-b-0 transition-colors duration-700"
                      style={{
                        backgroundColor: highlightRow === i ? "rgba(201,166,107,0.08)" : "transparent",
                      }}
                    >
                      <td className="py-3 px-4 text-sm text-foreground">{r.region}</td>
                      <td className="py-3 px-4 text-sm text-foreground font-mono tabular-nums text-right">{r.index}</td>
                      <td className="py-3 px-4 text-sm text-muted font-mono tabular-nums text-right">{r.volatility}</td>
                      <td className={`py-3 px-4 text-xs tracking-wider uppercase font-medium text-right ${statusColor(r.status)}`}>
                        {r.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-px bg-border border border-border">
              {regions.map((r, i) => (
                <div
                  key={r.region}
                  className="p-4 transition-colors duration-700"
                  style={{
                    backgroundColor: highlightRow === i ? "rgba(201,166,107,0.08)" : "#000000",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">{r.region}</span>
                    <span className={`text-[10px] tracking-wider uppercase font-medium ${statusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-[10px] text-muted uppercase">Index</div>
                      <div className="text-lg font-mono tabular-nums text-foreground">{r.index}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted uppercase">Volatility</div>
                      <div className="text-sm font-mono tabular-nums text-muted">{r.volatility}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live event log */}
          <div className="border border-border">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
              <span className="text-[10px] text-muted tracking-wider uppercase font-mono">
                EVENT LOG // {channelStatus}
              </span>
              <span className="text-[10px] text-muted font-mono tabular-nums">
                {events.length} entries
              </span>
            </div>
            <div ref={logRef} className="overflow-y-auto font-mono text-[10px] leading-relaxed" style={{ maxHeight: "280px" }}>
              {events.map((evt, i) => {
                const ts = evt.created_at
                  ? new Date(evt.created_at).toISOString().replace("T", " ").slice(11, 19)
                  : "??:??:??"
                const sevColor = evt.severity === "HIGH" ? "text-red-500" : evt.severity === "MEDIUM" ? "text-amber-500" : "text-muted"
                return (
                  <div key={evt.id || i} className="flex items-start gap-3 px-4 py-1.5 border-b border-border hover:bg-surface transition-colors">
                    <span className="text-muted tabular-nums shrink-0">{ts}</span>
                    <span className={`shrink-0 tracking-wider uppercase ${sevColor}`}>[{evt.severity}]</span>
                    <span className="text-gold shrink-0">{evt.event_type}</span>
                    <span className="text-foreground truncate">{evt.message}</span>
                    <span className="text-muted ml-auto shrink-0">{evt.source_node}</span>
                  </div>
                )
              })}
              {events.length === 0 && (
                <div className="px-4 py-6 text-center text-muted">Waiting for events...</div>
              )}
            </div>
          </div>

        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
