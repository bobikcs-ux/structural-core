"use client"

import { useState, useCallback, useMemo } from "react"

interface SimResult {
  epoch: number
  stress: number
  yield: number
  drawdown: number
  recovery: number
  verdict: "PASS" | "FAIL" | "MARGINAL"
}

interface SimParams {
  shockMagnitude: number
  duration: number
  correlationFactor: number
  liquidityFloor: number
  reserveRatio: number
}

function runSimulation(params: SimParams): SimResult[] {
  const results: SimResult[] = []
  let baseline = 100

  for (let i = 0; i < params.duration; i++) {
    const shock = params.shockMagnitude * Math.sin((i * 0.5) + 1) * (1 + params.correlationFactor * 0.1)
    const stress = Math.max(0, Math.min(100, 50 + shock * 3 + ((i * 17) % 30) - 15))
    const yieldVal = baseline * (1 - stress / 200) * (params.reserveRatio / 100)
    const drawdown = Math.max(0, stress - params.liquidityFloor)
    baseline = baseline * (1 - drawdown * 0.001)
    const recovery = Math.max(0, 100 - drawdown * 1.5)

    let verdict: SimResult["verdict"] = "PASS"
    if (stress > 75) verdict = "FAIL"
    else if (stress > 55) verdict = "MARGINAL"

    results.push({
      epoch: i + 1,
      stress: Math.round(stress * 100) / 100,
      yield: Math.round(yieldVal * 100) / 100,
      drawdown: Math.round(drawdown * 100) / 100,
      recovery: Math.round(recovery * 100) / 100,
      verdict,
    })
  }
  return results
}

function WireframeChart({ data, dataKey }: { data: SimResult[]; dataKey: keyof SimResult }) {
  if (data.length === 0) return null

  const values = data.map((d) => Number(d[dataKey]))
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const h = 64
  const w = 300

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w
      const y = h - ((v - min) / range) * (h - 8) - 4
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="border border-border p-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[8px] text-muted tracking-wider uppercase">{String(dataKey).toUpperCase()}</span>
        <span className="text-[8px] text-gold tabular-nums">{values[values.length - 1]?.toFixed(2)}</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: `${h}px` }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={0} y1={h - f * (h - 8) - 4}
            x2={w} y2={h - f * (h - 8) - 4}
            stroke="#1a1a1a" strokeWidth="0.5"
          />
        ))}
        <polyline
          points={points}
          fill="none"
          stroke="#C9A66B"
          strokeWidth="1"
        />
        {values.map((v, i) => {
          if (i % 3 !== 0) return null
          const x = (i / (values.length - 1)) * w
          const y = h - ((v - min) / range) * (h - 8) - 4
          return <circle key={i} cx={x} cy={y} r="1.5" fill="#C9A66B" />
        })}
      </svg>
    </div>
  )
}

function verdictColor(v: SimResult["verdict"]) {
  switch (v) {
    case "PASS": return "text-[#4a7a3a]"
    case "FAIL": return "text-[#8b2020]"
    case "MARGINAL": return "text-gold"
  }
}

export function SimulationPanel() {
  const [params, setParams] = useState<SimParams>({
    shockMagnitude: 12,
    duration: 24,
    correlationFactor: 5,
    liquidityFloor: 30,
    reserveRatio: 80,
  })
  const [results, setResults] = useState<SimResult[]>([])
  const [hasRun, setHasRun] = useState(false)

  const handleRun = useCallback(() => {
    setResults(runSimulation(params))
    setHasRun(true)
  }, [params])

  const paramFields: { key: keyof SimParams; label: string; min: number; max: number }[] = [
    { key: "shockMagnitude", label: "SHOCK MAG", min: 1, max: 50 },
    { key: "duration", label: "EPOCHS", min: 4, max: 100 },
    { key: "correlationFactor", label: "CORR FACTOR", min: 0, max: 20 },
    { key: "liquidityFloor", label: "LIQ FLOOR", min: 0, max: 100 },
    { key: "reserveRatio", label: "RESERVE %", min: 10, max: 100 },
  ]

  const summary = useMemo(() => {
    if (results.length === 0) return null
    const passes = results.filter((r) => r.verdict === "PASS").length
    const fails = results.filter((r) => r.verdict === "FAIL").length
    const marginals = results.filter((r) => r.verdict === "MARGINAL").length
    const avgStress = results.reduce((a, r) => a + r.stress, 0) / results.length
    const maxDrawdown = Math.max(...results.map((r) => r.drawdown))
    return { passes, fails, marginals, avgStress, maxDrawdown }
  }, [results])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Parameter input bar */}
      <div className="border-b border-border bg-surface shrink-0">
        <div className="px-2 py-1 border-b border-border">
          <span className="text-[9px] text-muted tracking-wider uppercase">
            PARAMETRIC STRESS TEST // SIMULATION LABORATORY
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
                value={params[f.key]}
                onChange={(e) => setParams((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
                className="w-[72px] text-[10px] tabular-nums"
              />
            </div>
          ))}
          <button
            onClick={handleRun}
            className="border border-gold text-gold text-[10px] tracking-wider uppercase px-4 py-1 hover:bg-gold hover:text-background transition-colors duration-75 font-medium"
          >
            EXECUTE
          </button>
        </div>
      </div>

      {!hasRun ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-[10px] text-muted tracking-wider uppercase">AWAITING PARAMETERS</div>
            <div className="text-[9px] text-border-strong mt-1">CONFIGURE AND EXECUTE TO BEGIN STRESS TEST</div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Summary */}
          {summary && (
            <div className="grid grid-cols-5 border-b border-border">
              <div className="border-r border-border p-1.5">
                <div className="text-[8px] text-muted tracking-wider uppercase">PASS</div>
                <div className="text-[12px] text-[#4a7a3a] font-semibold tabular-nums">{summary.passes}</div>
              </div>
              <div className="border-r border-border p-1.5">
                <div className="text-[8px] text-muted tracking-wider uppercase">MARGINAL</div>
                <div className="text-[12px] text-gold font-semibold tabular-nums">{summary.marginals}</div>
              </div>
              <div className="border-r border-border p-1.5">
                <div className="text-[8px] text-muted tracking-wider uppercase">FAIL</div>
                <div className="text-[12px] text-[#8b2020] font-semibold tabular-nums">{summary.fails}</div>
              </div>
              <div className="border-r border-border p-1.5">
                <div className="text-[8px] text-muted tracking-wider uppercase">AVG STRESS</div>
                <div className="text-[12px] text-gold font-semibold tabular-nums">{summary.avgStress.toFixed(2)}</div>
              </div>
              <div className="p-1.5">
                <div className="text-[8px] text-muted tracking-wider uppercase">MAX DRAWDOWN</div>
                <div className="text-[12px] text-gold font-semibold tabular-nums">{summary.maxDrawdown.toFixed(2)}</div>
              </div>
            </div>
          )}

          {/* Wireframe charts */}
          <div className="grid grid-cols-2 gap-0 border-b border-border">
            <WireframeChart data={results} dataKey="stress" />
            <WireframeChart data={results} dataKey="drawdown" />
            <WireframeChart data={results} dataKey="yield" />
            <WireframeChart data={results} dataKey="recovery" />
          </div>

          {/* Results table */}
          <table>
            <thead className="sticky top-0 z-10">
              <tr>
                <th>EPOCH</th>
                <th>STRESS</th>
                <th>YIELD</th>
                <th>DRAWDOWN</th>
                <th>RECOVERY</th>
                <th>VERDICT</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.epoch} className="hover:bg-surface-raised transition-colors duration-75">
                  <td className="text-muted tabular-nums">{String(r.epoch).padStart(3, "0")}</td>
                  <td className="text-gold tabular-nums">{r.stress.toFixed(2)}</td>
                  <td className="tabular-nums">{r.yield.toFixed(2)}</td>
                  <td className="tabular-nums">{r.drawdown.toFixed(2)}</td>
                  <td className="tabular-nums">{r.recovery.toFixed(2)}</td>
                  <td className={`font-semibold ${verdictColor(r.verdict)}`}>{r.verdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
