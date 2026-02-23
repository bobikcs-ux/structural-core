"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { fetchDriftData, type DriftData } from "@/app/actions/scanner"

/* ── Live SVG line chart ── */
function DriftGraph({ refreshKey = 0 }: { refreshKey?: number }) {
  const [points, setPoints] = useState<number[]>([50, 50, 50, 50, 50])
  const supabase = createClient()

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from("scan_results")
        .select("integrity_score")
        .order("created_at", { ascending: true })
        .limit(10)
      if (data && data.length > 0) {
        setPoints(data.map((d) => d.integrity_score ?? 50))
      }
    }
    fetchHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  // Build the SVG polyline from data points
  const width = 360
  const height = 100
  const step = points.length > 1 ? width / (points.length - 1) : width
  const pathSegments = points.map((p, i) => `${i * step},${height - p}`).join(" L ")
  const lastX = (points.length - 1) * step
  const lastY = height - points[points.length - 1]

  return (
    <div className="w-full h-32 bg-background/40 border border-[#C9A66B]/10 relative overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        {[25, 50, 75].map((y) => (
          <line
            key={y}
            x1="0"
            y1={height - y}
            x2={width}
            y2={height - y}
            stroke="#C9A66B"
            strokeOpacity="0.06"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
        ))}
        {/* Area fill */}
        <path
          d={`M 0,${height} L 0,${height - points[0]} L ${pathSegments} L ${lastX},${height} Z`}
          fill="url(#driftGradient)"
        />
        {/* Line */}
        <path
          d={`M 0,${height - points[0]} L ${pathSegments}`}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1.5"
          className="drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
        />
        {/* Pulse on last point */}
        <circle cx={lastX} cy={lastY} r="4" fill="#fbbf24" fillOpacity="0.15" className="animate-ping" />
        <circle cx={lastX} cy={lastY} r="2" fill="#fbbf24" />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="driftGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute top-2 right-2 text-[9px] text-amber-500/40 font-mono uppercase tracking-widest">
        Real-time Integrity Stream
      </div>
    </div>
  )
}

/* ── Blueprint SVG flow diagram ── */
function DriftDiagram({ quarterlyInput, driftDelta }: { quarterlyInput: number; driftDelta: number }) {
  const deltaText = driftDelta > 0 ? `+${driftDelta}` : String(driftDelta)
  return (
    <svg
      viewBox="0 0 400 50"
      className="w-full h-auto opacity-60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Drift calculation flow"
      role="img"
    >
      <rect x="4" y="8" width="80" height="34" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <text x="44" y="20" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">QUARTERLY</text>
      <text x="44" y="30" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">INPUT: {quarterlyInput}</text>

      <line x1="88" y1="25" x2="128" y2="25" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <polygon points="128,23 132,25 128,27" fill="#C9A66B" fillOpacity="0.4" />

      <rect x="136" y="8" width="80" height="34" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <text x="176" y="20" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">DRIFT</text>
      <text x="176" y="30" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">CALCULATION</text>

      <line x1="220" y1="25" x2="260" y2="25" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <polygon points="260,23 264,25 260,27" fill="#C9A66B" fillOpacity="0.4" />

      <rect x="268" y="8" width="80" height="34" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <text x="308" y="20" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">DELTA</text>
      <text x="308" y="30" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="7" fontFamily="monospace">{deltaText}</text>

      <line x1="352" y1="25" x2="392" y2="25" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <circle cx="396" cy="25" r="3" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
    </svg>
  )
}

/* ── Main Module ── */
export function DriftModule({ refreshKey = 0 }: { refreshKey?: number } = {}) {
  const [data, setData] = useState<DriftData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetchDriftData()
    if (res.success && res.data) setData(res.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  const quarterlyScans = data?.quarterlyScans ?? 0
  const driftDelta = data?.driftDelta ?? 0
  const quarters = data?.quarters ?? []

  const driftLabel = driftDelta > 0
    ? "STRENGTHENING"
    : driftDelta < 0
      ? "SOFTENING"
      : "NEUTRAL"

  return (
    <div className="flex flex-col gap-8">
      {/* Live SVG graph from real integrity scores */}
      <DriftGraph refreshKey={refreshKey} />

      {/* Blueprint flow diagram */}
      <div className="py-4">
        <DriftDiagram quarterlyInput={quarterlyScans} driftDelta={driftDelta} />
      </div>

      {/* Computed Metrics */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-muted-foreground tracking-wider leading-6">
            QUARTERLY INPUT
          </span>
          <span className="font-mono text-[11px] text-gold tracking-wider leading-6 tabular-nums">
            {loading ? "---" : `${quarterlyScans} SCANS`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-muted-foreground tracking-wider leading-6">
            DRIFT CALCULATION
          </span>
          <span className={`font-mono text-[11px] tracking-wider leading-6 tabular-nums ${
            driftDelta > 0 ? "text-gold" : driftDelta < 0 ? "text-destructive" : "text-foreground"
          }`}>
            {loading ? "---" : `${driftDelta > 0 ? "+" : ""}${driftDelta} vs LAST MONTH`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-muted-foreground tracking-wider leading-6">
            DRIFT LEVEL
          </span>
          <span className="font-mono text-[11px] text-gold tracking-wider leading-6">
            {loading ? "---" : driftLabel}
          </span>
        </div>
      </div>

      {/* Quarterly History */}
      <div className="pt-6 border-t border-terminal-line">
        <div className="font-mono text-[11px] text-muted-foreground tracking-widest mb-4 leading-6">
          LAST 4 QUARTERS
        </div>
        <div className="flex flex-col gap-3">
          {loading ? (
            <span className="font-mono text-[11px] text-muted-foreground">LOADING...</span>
          ) : quarters.length === 0 ? (
            <span className="font-mono text-[11px] text-muted-foreground">NO HISTORICAL DATA</span>
          ) : (
            quarters.map((q) => (
              <div key={q.label} className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                  {q.label}
                </span>
                <span className="font-mono text-[11px] text-foreground leading-relaxed tabular-nums">
                  {q.count} {q.count === 1 ? "SCAN" : "SCANS"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
