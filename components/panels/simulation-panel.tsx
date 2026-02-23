"use client"

import { useState, useCallback } from "react"
import { runStructuralSnapshot, useSimulationRuns } from "@/lib/hooks"

interface SimParams {
  shockMagnitude: number
  epochs: number
  correlationFactor: number
  liquidityFloor: number
  reserveRatio: number
}

interface SimResult {
  id: string
  verdict: string
  survival_rate: number
  max_drawdown: number
  recovery_epochs: number
  curve: number[]
}

function WireframeChart({ data, label }: { data: number[]; label: string }) {
  if (!data || data.length === 0) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const h = 64
  const w = 300

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / range) * (h - 8) - 4
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="border border-border p-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[8px] text-muted tracking-wider uppercase">{label}</span>
        <span className="text-[8px] text-gold tabular-nums">{data[data.length - 1]?.toFixed(2)}</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: `${h}px` }} role="img" aria-label={`${label} chart`}>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={0} y1={h - f * (h - 8) - 4} x2={w} y2={h - f * (h - 8) - 4} stroke="#1a1a1a" strokeWidth="0.5" />
        ))}
        <polyline points={points} fill="none" stroke="#C9A66B" strokeWidth="1" />
        {data.map((v, i) => {
          if (i % 3 !== 0) return null
          const x = (i / (data.length - 1)) * w
          const y = h - ((v - min) / range) * (h - 8) - 4
          return <circle key={i} cx={x} cy={y} r="1.5" fill="#C9A66B" />
        })}
      </svg>
    </div>
  )
}

function verdictColor(v: string) {
  switch (v) {
    case "STABLE": return "text-[#4a7a3a]"
    case "CRITICAL": return "text-[#8b2020]"
    case "STRESSED": return "text-gold"
    default: return "text-foreground"
  }
}

export function SimulationPanel() {
  const [params, setParams] = useState<SimParams>({
    shockMagnitude: 7,
    epochs: 30,
    correlationFactor: 4,
    liquidityFloor: 0.5,
    reserveRatio: 0.8,
  })
  const [result, setResult] = useState<SimResult | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: pastRuns, mutate } = useSimulationRuns()

  const handleRun = useCallback(async () => {
    setRunning(true)
    setError(null)
    try {
      const res = await runStructuralSnapshot(params)
      setResult(res)
      mutate()
    } catch (err) {
      setError(err instanceof Error ? err.message : "RPC FAILURE")
    } finally {
      setRunning(false)
    }
  }, [params, mutate])

  const paramFields: { key: keyof SimParams; label: string; min: number; max: number; step: number }[] = [
    { key: "shockMagnitude", label: "SHOCK MAG", min: 1, max: 50, step: 1 },
    { key: "epochs", label: "EPOCHS", min: 4, max: 100, step: 1 },
    { key: "correlationFactor", label: "CORR FACTOR", min: 0, max: 20, step: 0.1 },
    { key: "liquidityFloor", label: "LIQ FLOOR", min: 0, max: 1, step: 0.01 },
    { key: "reserveRatio", label: "RESERVE %", min: 0.01, max: 2, step: 0.01 },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Parameter input bar */}
      <div className="border-b border-border bg-surface shrink-0">
        <div className="px-2 py-1 border-b border-border">
          <span className="text-[9px] text-muted tracking-wider uppercase">
            PARAMETRIC STRESS TEST // SIMULATION LABORATORY // SUPABASE RPC
          </span>
        </div>
        <div className="flex items-end gap-1 p-2 flex-wrap">
          {paramFields.map((f) => (
            <div key={f.key} className="flex flex-col">
              <label className="text-[8px] text-muted tracking-wider uppercase mb-0.5">{f.label}</label>
              <input
                type="number"
                min={f.min}
                max={f.max}
                step={f.step}
                value={params[f.key]}
                onChange={(e) => setParams((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
                className="w-[72px] text-[10px] tabular-nums"
              />
            </div>
          ))}
          <button
            onClick={handleRun}
            disabled={running}
            className={`border border-gold text-gold text-[10px] tracking-wider uppercase px-4 py-1 font-medium ${
              running ? "opacity-50" : "hover:bg-gold hover:text-background"
            }`}
          >
            {running ? "RUNNING..." : "EXECUTE"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] text-[#8b2020] tracking-wider uppercase">ERROR: {error}</span>
        </div>
      ) : !result ? (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-[10px] text-muted tracking-wider uppercase">AWAITING PARAMETERS</div>
              <div className="text-[9px] text-border-strong mt-1">CONFIGURE AND EXECUTE TO BEGIN STRESS TEST</div>
            </div>
          </div>
          {/* Past runs table */}
          {pastRuns && pastRuns.length > 0 && (
            <div className="border-t border-border shrink-0">
              <div className="px-2 py-1 border-b border-border bg-surface">
                <span className="text-[9px] text-muted tracking-wider uppercase">PREVIOUS RUNS // {pastRuns.length}</span>
              </div>
              <div className="max-h-[120px] overflow-y-auto">
                <table>
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th>SHOCK</th>
                      <th>EPOCHS</th>
                      <th>VERDICT</th>
                      <th>SURVIVAL</th>
                      <th>DRAWDOWN</th>
                      <th>RECOVERY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastRuns.map((run: Record<string, string | number>) => (
                      <tr key={run.id as string} className="hover:bg-surface-raised">
                        <td className="tabular-nums">{String(run.shock_magnitude)}</td>
                        <td className="tabular-nums">{String(run.epochs)}</td>
                        <td className={`font-semibold ${verdictColor(run.result_verdict as string)}`}>
                          {run.result_verdict as string}
                        </td>
                        <td className="text-gold tabular-nums">{Number(run.result_survival_rate).toFixed(2)}%</td>
                        <td className="tabular-nums">{Number(run.result_max_drawdown).toFixed(2)}%</td>
                        <td className="tabular-nums">{String(run.result_recovery_epochs)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Verdict summary */}
          <div className="grid grid-cols-4 border-b border-border">
            <div className="border-r border-border p-1.5">
              <div className="text-[8px] text-muted tracking-wider uppercase">VERDICT</div>
              <div className={`text-[14px] font-semibold ${verdictColor(result.verdict)}`}>{result.verdict}</div>
            </div>
            <div className="border-r border-border p-1.5">
              <div className="text-[8px] text-muted tracking-wider uppercase">SURVIVAL</div>
              <div className="text-[14px] text-gold font-semibold tabular-nums">{result.survival_rate.toFixed(2)}%</div>
            </div>
            <div className="border-r border-border p-1.5">
              <div className="text-[8px] text-muted tracking-wider uppercase">MAX DRAWDOWN</div>
              <div className="text-[14px] text-gold font-semibold tabular-nums">{result.max_drawdown.toFixed(2)}%</div>
            </div>
            <div className="p-1.5">
              <div className="text-[8px] text-muted tracking-wider uppercase">RECOVERY EPOCHS</div>
              <div className="text-[14px] text-gold font-semibold tabular-nums">{result.recovery_epochs}</div>
            </div>
          </div>

          {/* Wireframe curve chart */}
          <div className="border-b border-border">
            <WireframeChart data={result.curve} label="STRUCTURAL INTEGRITY CURVE" />
          </div>

          {/* Curve data table */}
          <table>
            <thead className="sticky top-0 z-10">
              <tr>
                <th>EPOCH</th>
                <th>INTEGRITY VALUE</th>
                <th>DELTA</th>
              </tr>
            </thead>
            <tbody>
              {result.curve.map((v, i) => (
                <tr key={i} className="hover:bg-surface-raised">
                  <td className="text-muted tabular-nums">{String(i + 1).padStart(3, "0")}</td>
                  <td className="text-gold tabular-nums">{v.toFixed(2)}</td>
                  <td className="tabular-nums">
                    {i > 0 ? (
                      <span className={v - result.curve[i - 1] >= 0 ? "text-[#4a7a3a]" : "text-[#8b2020]"}>
                        {(v - result.curve[i - 1] >= 0 ? "+" : "")}{(v - result.curve[i - 1]).toFixed(2)}
                      </span>
                    ) : "---"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
