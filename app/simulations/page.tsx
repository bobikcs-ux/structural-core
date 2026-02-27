"use client"

/**
 * Simulations Page - Shock Analysis Form
 * Run stress tests on SRI components
 */

import { useState } from "react"
import { 
  FlaskConical, 
  Play, 
  RotateCcw,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Gauge
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

type ShockType = "YIELD_INVERSION" | "INFLATION_SPIKE" | "RATE_HIKE" | "LIQUIDITY_CRUNCH" | "CUSTOM"

interface SimulationParams {
  shockType: ShockType
  magnitude: number
  duration: number
  spreadDelta: number
  inflationDelta: number
  rateDelta: number
  liquidityDelta: number
}

interface SimulationResult {
  originalSri: number
  shockedSri: number
  delta: number
  riskChange: string
  components: {
    spread: { before: number; after: number }
    inflation: { before: number; after: number }
    rate: { before: number; after: number }
    liquidity: { before: number; after: number }
  }
}

// ============================================================================
// Constants
// ============================================================================

const SHOCK_PRESETS: Record<ShockType, Partial<SimulationParams>> = {
  YIELD_INVERSION: { spreadDelta: -0.3, inflationDelta: 0.05, rateDelta: 0.1, liquidityDelta: -0.1 },
  INFLATION_SPIKE: { spreadDelta: 0.1, inflationDelta: 0.4, rateDelta: 0.2, liquidityDelta: -0.15 },
  RATE_HIKE: { spreadDelta: 0.05, inflationDelta: -0.1, rateDelta: 0.35, liquidityDelta: -0.2 },
  LIQUIDITY_CRUNCH: { spreadDelta: 0.15, inflationDelta: 0.1, rateDelta: 0.15, liquidityDelta: -0.4 },
  CUSTOM: { spreadDelta: 0, inflationDelta: 0, rateDelta: 0, liquidityDelta: 0 },
}

const BASE_VALUES = {
  spread: 0.65,
  inflation: 0.55,
  rate: 0.45,
  liquidity: 0.70,
}

// ============================================================================
// Main Component
// ============================================================================

export default function SimulationsPage() {
  const [params, setParams] = useState<SimulationParams>({
    shockType: "YIELD_INVERSION",
    magnitude: 1.0,
    duration: 30,
    ...SHOCK_PRESETS.YIELD_INVERSION,
  })
  
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [running, setRunning] = useState(false)

  const handleShockTypeChange = (type: ShockType) => {
    setParams({
      ...params,
      shockType: type,
      ...SHOCK_PRESETS[type],
    })
    setResult(null)
  }

  const runSimulation = async () => {
    setRunning(true)
    await new Promise(r => setTimeout(r, 800))

    const magnitude = params.magnitude
    const before = {
      spread: BASE_VALUES.spread,
      inflation: BASE_VALUES.inflation,
      rate: BASE_VALUES.rate,
      liquidity: BASE_VALUES.liquidity,
    }
    
    const after = {
      spread: Math.max(0, Math.min(1, before.spread + (params.spreadDelta ?? 0) * magnitude)),
      inflation: Math.max(0, Math.min(1, before.inflation + (params.inflationDelta ?? 0) * magnitude)),
      rate: Math.max(0, Math.min(1, before.rate + (params.rateDelta ?? 0) * magnitude)),
      liquidity: Math.max(0, Math.min(1, before.liquidity + (params.liquidityDelta ?? 0) * magnitude)),
    }

    const originalSri = 0.35 * before.spread + 0.25 * before.inflation + 0.20 * before.rate + 0.20 * before.liquidity
    const shockedSri = 0.35 * after.spread + 0.25 * after.inflation + 0.20 * after.rate + 0.20 * after.liquidity
    const delta = shockedSri - originalSri

    let riskChange = "STABLE"
    if (delta < -0.1) riskChange = "HIGH RISK INCREASE"
    else if (delta < -0.05) riskChange = "MODERATE RISK INCREASE"
    else if (delta > 0.1) riskChange = "SIGNIFICANT IMPROVEMENT"
    else if (delta > 0.05) riskChange = "SLIGHT IMPROVEMENT"

    setResult({
      originalSri,
      shockedSri,
      delta,
      riskChange,
      components: {
        spread: { before: before.spread, after: after.spread },
        inflation: { before: before.inflation, after: after.inflation },
        rate: { before: before.rate, after: after.rate },
        liquidity: { before: before.liquidity, after: after.liquidity },
      },
    })
    setRunning(false)
  }

  const reset = () => {
    setParams({
      shockType: "YIELD_INVERSION",
      magnitude: 1.0,
      duration: 30,
      ...SHOCK_PRESETS.YIELD_INVERSION,
    })
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-[hsl(0,0%,2%)] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-full mb-6">
            <FlaskConical className="w-4 h-4 text-[hsl(45,90%,50%)]" />
            <span className="text-[10px] font-mono tracking-wider text-[hsl(0,0%,60%)]">
              STRESS TESTING
            </span>
          </div>
          <h1 className="text-3xl font-mono font-bold text-[hsl(45,20%,95%)] mb-4">
            SHOCK SIMULATIONS
          </h1>
          <p className="text-sm font-mono text-[hsl(0,0%,50%)]">
            Model macroeconomic scenarios and their impact on SRI
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Parameters Panel */}
          <div className="bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg p-6">
            <h2 className="text-sm font-mono text-[hsl(0,0%,50%)] uppercase tracking-wider mb-6">
              Simulation Parameters
            </h2>

            {/* Shock Type */}
            <div className="mb-6">
              <label className="text-[10px] font-mono text-[hsl(0,0%,40%)] uppercase mb-3 block">
                Shock Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(SHOCK_PRESETS) as ShockType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleShockTypeChange(type)}
                    className={`
                      px-3 py-2 text-[10px] font-mono rounded border transition-all
                      ${params.shockType === type
                        ? "bg-[hsl(45,90%,50%)]/10 border-[hsl(45,90%,50%)]/30 text-[hsl(45,90%,50%)]"
                        : "bg-[hsl(0,0%,3%)] border-[hsl(0,0%,10%)] text-[hsl(0,0%,50%)] hover:border-[hsl(0,0%,20%)]"
                      }
                    `}
                  >
                    {type.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Magnitude */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-mono text-[hsl(0,0%,40%)] uppercase">
                  Magnitude
                </label>
                <span className="text-sm font-mono text-[hsl(45,90%,50%)]">
                  {params.magnitude.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={params.magnitude}
                onChange={(e) => setParams({ ...params, magnitude: parseFloat(e.target.value) })}
                className="w-full h-2 bg-[hsl(0,0%,10%)] rounded-lg appearance-none cursor-pointer accent-[hsl(45,90%,50%)]"
              />
              <div className="flex justify-between text-[9px] font-mono text-[hsl(0,0%,30%)] mt-1">
                <span>0.1x</span>
                <span>3.0x</span>
              </div>
            </div>

            {/* Duration */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-mono text-[hsl(0,0%,40%)] uppercase">
                  Duration (Days)
                </label>
                <span className="text-sm font-mono text-[hsl(45,90%,50%)]">
                  {params.duration}d
                </span>
              </div>
              <input
                type="range"
                min="7"
                max="365"
                step="7"
                value={params.duration}
                onChange={(e) => setParams({ ...params, duration: parseInt(e.target.value) })}
                className="w-full h-2 bg-[hsl(0,0%,10%)] rounded-lg appearance-none cursor-pointer accent-[hsl(45,90%,50%)]"
              />
            </div>

            {/* Custom Deltas (only for CUSTOM type) */}
            {params.shockType === "CUSTOM" && (
              <div className="space-y-4 mb-6 p-4 bg-[hsl(0,0%,3%)] rounded border border-[hsl(0,0%,10%)]">
                <div className="text-[10px] font-mono text-[hsl(0,0%,40%)] uppercase mb-2">
                  Custom Component Deltas
                </div>
                {["spread", "inflation", "rate", "liquidity"].map((comp) => (
                  <div key={comp} className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-[hsl(0,0%,50%)] w-20 uppercase">
                      {comp}
                    </span>
                    <input
                      type="range"
                      min="-0.5"
                      max="0.5"
                      step="0.05"
                      value={params[`${comp}Delta` as keyof SimulationParams] as number}
                      onChange={(e) => setParams({ 
                        ...params, 
                        [`${comp}Delta`]: parseFloat(e.target.value) 
                      })}
                      className="flex-1 h-1.5 bg-[hsl(0,0%,10%)] rounded-lg appearance-none cursor-pointer accent-[hsl(45,90%,50%)]"
                    />
                    <span className="text-[10px] font-mono text-[hsl(45,90%,50%)] w-12 text-right">
                      {((params[`${comp}Delta` as keyof SimulationParams] as number) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={runSimulation}
                disabled={running}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[hsl(45,90%,50%)] text-[hsl(0,0%,2%)] font-mono text-sm font-medium rounded hover:bg-[hsl(45,90%,55%)] transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                {running ? "RUNNING..." : "RUN SIMULATION"}
              </button>
              <button
                onClick={reset}
                className="px-4 py-3 bg-[hsl(0,0%,8%)] border border-[hsl(0,0%,12%)] text-[hsl(0,0%,60%)] font-mono text-sm rounded hover:bg-[hsl(0,0%,10%)] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg p-6">
            <h2 className="text-sm font-mono text-[hsl(0,0%,50%)] uppercase tracking-wider mb-6">
              Simulation Results
            </h2>

            {!result ? (
              <div className="text-center py-16">
                <Gauge className="w-12 h-12 text-[hsl(0,0%,20%)] mx-auto mb-4" />
                <p className="text-xs font-mono text-[hsl(0,0%,40%)]">
                  Configure parameters and run simulation
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* SRI Comparison */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-[hsl(0,0%,3%)] rounded border border-[hsl(0,0%,10%)]">
                    <div className="text-[10px] font-mono text-[hsl(0,0%,40%)] mb-2">ORIGINAL</div>
                    <div className="text-2xl font-mono font-bold text-[hsl(45,20%,95%)]">
                      {result.originalSri.toFixed(4)}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-[hsl(0,0%,3%)] rounded border border-[hsl(0,0%,10%)]">
                    <div className="text-[10px] font-mono text-[hsl(0,0%,40%)] mb-2">SHOCKED</div>
                    <div className={`text-2xl font-mono font-bold ${
                      result.delta < 0 ? "text-[hsl(0,72%,51%)]" : "text-[hsl(142,76%,46%)]"
                    }`}>
                      {result.shockedSri.toFixed(4)}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-[hsl(0,0%,3%)] rounded border border-[hsl(0,0%,10%)]">
                    <div className="text-[10px] font-mono text-[hsl(0,0%,40%)] mb-2">DELTA</div>
                    <div className={`text-2xl font-mono font-bold flex items-center justify-center gap-1 ${
                      result.delta < 0 ? "text-[hsl(0,72%,51%)]" : "text-[hsl(142,76%,46%)]"
                    }`}>
                      {result.delta < 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                      {(result.delta * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className={`p-4 rounded border ${
                  result.delta < -0.05 
                    ? "bg-[hsl(0,72%,51%)]/10 border-[hsl(0,72%,51%)]/20" 
                    : result.delta > 0.05
                      ? "bg-[hsl(142,76%,46%)]/10 border-[hsl(142,76%,46%)]/20"
                      : "bg-[hsl(45,90%,50%)]/10 border-[hsl(45,90%,50%)]/20"
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${
                      result.delta < -0.05 ? "text-[hsl(0,72%,51%)]" : 
                      result.delta > 0.05 ? "text-[hsl(142,76%,46%)]" : 
                      "text-[hsl(45,90%,50%)]"
                    }`} />
                    <span className="text-sm font-mono text-[hsl(45,20%,95%)]">
                      {result.riskChange}
                    </span>
                  </div>
                </div>

                {/* Component Breakdown */}
                <div className="space-y-3">
                  <div className="text-[10px] font-mono text-[hsl(0,0%,40%)] uppercase">
                    Component Impact
                  </div>
                  {Object.entries(result.components).map(([name, values]) => {
                    const delta = values.after - values.before
                    return (
                      <div key={name} className="flex items-center gap-4">
                        <span className="text-[10px] font-mono text-[hsl(0,0%,50%)] w-20 uppercase">
                          {name}
                        </span>
                        <div className="flex-1 h-2 bg-[hsl(0,0%,10%)] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[hsl(45,90%,50%)] transition-all duration-500"
                            style={{ width: `${values.after * 100}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-mono w-16 text-right ${
                          delta < 0 ? "text-[hsl(0,72%,51%)]" : "text-[hsl(142,76%,46%)]"
                        }`}>
                          {delta > 0 ? "+" : ""}{(delta * 100).toFixed(1)}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
