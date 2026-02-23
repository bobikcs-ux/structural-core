"use client"

import { useState, useCallback } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { runStructuralSnapshot } from "@/lib/hooks"

const REGIONS = [
  "North America", "Europe", "Asia Pacific", "Middle East",
  "Latin America", "Sub-Saharan Africa", "Central Asia", "Oceania", "Global Aggregate",
]

const SHOCK_TYPES = [
  "Liquidity Crisis", "Sovereign Default", "Currency Collapse",
  "Systemic Contagion", "Governance Failure", "Reserve Depletion",
]

interface SimResult {
  id: string
  verdict: string
  survival_rate: number
  max_drawdown: number
  recovery_epochs: number
  curve: number[]
}

function verdictColor(v: string) {
  if (v === "STABLE") return "text-success"
  if (v === "CRITICAL") return "text-danger"
  return "text-gold"
}

function WireframeChart({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const h = 120
  const w = 600

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / range) * (h - 16) - 8
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: "120px" }} role="img" aria-label="Structural integrity curve">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={0} y1={h - f * (h - 16) - 8} x2={w} y2={h - f * (h - 16) - 8} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
      ))}
      <polyline points={points} fill="none" stroke="#C9A66B" strokeWidth="1.5" />
      {data.map((v, i) => {
        if (i % Math.max(1, Math.floor(data.length / 15)) !== 0) return null
        const x = (i / (data.length - 1)) * w
        const y = h - ((v - min) / range) * (h - 16) - 8
        return <circle key={i} cx={x} cy={y} r="2" fill="#C9A66B" />
      })}
    </svg>
  )
}

export default function SimulationsPage() {
  const [region, setRegion] = useState("Global Aggregate")
  const [shockType, setShockType] = useState("Liquidity Crisis")
  const [magnitude, setMagnitude] = useState(5)
  const [duration, setDuration] = useState(30)
  const [result, setResult] = useState<SimResult | null>(null)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleRun = useCallback(async () => {
    setRunning(true)
    setProgress(0)
    setError(null)

    // Animate progress bar
    const steps = 20
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + (100 / steps), 95))
    }, 100)

    try {
      const res = await runStructuralSnapshot({
        shockMagnitude: magnitude,
        epochs: duration,
        correlationFactor: SHOCK_TYPES.indexOf(shockType) + 1,
        liquidityFloor: 0.5,
        reserveRatio: 0.8,
      })
      clearInterval(interval)
      setProgress(100)
      setResult(res)
    } catch (err) {
      clearInterval(interval)
      setProgress(0)
      setError(err instanceof Error ? err.message : "Simulation failed")
    } finally {
      setRunning(false)
    }
  }, [magnitude, duration, shockType])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 pt-24 md:pt-28 pb-16 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-[10px] text-gold tracking-[0.2em] uppercase mb-2">Simulation Engine</div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-2 text-balance">
            Institutional Stress Test
          </h1>
          <p className="text-sm text-muted mb-10 max-w-lg">
            Configure simulation parameters and execute a deterministic structural stress test
            against the selected region and shock profile.
          </p>

          {/* Form */}
          <div className="border border-border p-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[10px] text-muted tracking-wider uppercase mb-1.5">Target Region</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-surface border border-border text-foreground text-sm px-3 py-2 outline-none focus:border-gold"
                >
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-muted tracking-wider uppercase mb-1.5">Shock Type</label>
                <select
                  value={shockType}
                  onChange={(e) => setShockType(e.target.value)}
                  className="w-full bg-surface border border-border text-foreground text-sm px-3 py-2 outline-none focus:border-gold"
                >
                  {SHOCK_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[10px] text-muted tracking-wider uppercase mb-1.5">
                  Magnitude: <span className="text-gold font-mono">{(magnitude / 10).toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={magnitude}
                  onChange={(e) => setMagnitude(Number(e.target.value))}
                  className="w-full accent-gold h-px bg-border appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:rounded-none
                    [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-muted tracking-wider uppercase mb-1.5">Duration (Days)</label>
                <input
                  type="number"
                  min="5"
                  max="365"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-surface border border-border text-foreground text-sm px-3 py-2 outline-none focus:border-gold font-mono tabular-nums"
                />
              </div>
            </div>

            <button
              onClick={handleRun}
              disabled={running}
              className={`text-xs tracking-wider uppercase px-6 py-2.5 font-medium transition-colors ${
                running
                  ? "bg-surface text-muted border border-border"
                  : "bg-gold text-background hover:bg-gold-dim"
              }`}
            >
              {running ? "Executing Simulation..." : "Run Simulation"}
            </button>

            {/* Progress bar */}
            {running && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted tracking-wider uppercase">Processing</span>
                  <span className="text-[10px] text-gold font-mono tabular-nums">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-px bg-border">
                  <div
                    className="h-full bg-gold transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="border border-danger p-4 mb-8">
              <span className="text-sm text-danger">Error: {error}</span>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="border border-border">
              <div className="p-4 border-b border-border">
                <div className="text-[10px] text-gold tracking-[0.2em] uppercase mb-1">Simulation Result</div>
                <div className="text-xs text-muted">
                  {region} / {shockType} / Magnitude {(magnitude / 10).toFixed(1)} / {duration} Days
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
                <div className="bg-background p-5">
                  <div className="text-[10px] text-muted tracking-wider uppercase mb-1">Projected Delta</div>
                  <div className={`text-xl font-semibold font-mono ${verdictColor(result.verdict)}`}>
                    {result.verdict}
                  </div>
                </div>
                <div className="bg-background p-5">
                  <div className="text-[10px] text-muted tracking-wider uppercase mb-1">Reserve Impact</div>
                  <div className="text-xl font-semibold font-mono text-foreground tabular-nums">
                    {result.max_drawdown.toFixed(2)}%
                  </div>
                </div>
                <div className="bg-background p-5">
                  <div className="text-[10px] text-muted tracking-wider uppercase mb-1">Stability Rating</div>
                  <div className="text-xl font-semibold font-mono text-gold tabular-nums">
                    {result.survival_rate.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-background p-5">
                  <div className="text-[10px] text-muted tracking-wider uppercase mb-1">Recovery Period</div>
                  <div className="text-xl font-semibold font-mono text-foreground tabular-nums">
                    {result.recovery_epochs}d
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border">
                <div className="text-[10px] text-muted tracking-wider uppercase mb-3">Structural Integrity Curve</div>
                <WireframeChart data={result.curve} />
              </div>

              <div className="p-4 border-t border-border">
                <button className="text-xs tracking-wider uppercase px-4 py-2 border border-border text-muted hover:text-foreground hover:bg-surface transition-colors">
                  Download Institutional Report (PDF)
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
