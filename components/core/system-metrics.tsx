"use client"

import { useEffect, useState, useCallback } from "react"
import {
  fetchGlobalStructuralIndex,
  fetchActiveCount,
  type SystemBarData,
} from "@/app/actions/scanner"

const CAPACITY = 200

function generateProgressBar(val: number) {
  const filled = Math.round((val / 100) * 20)
  return "\u2588".repeat(filled) + "\u2591".repeat(20 - filled)
}

export function SystemMetrics({ indexValue }: { indexValue: number }) {
  const [data, setData] = useState<SystemBarData | null>(null)
  const [utilization, setUtilization] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [gsiRes, countRes] = await Promise.all([
      fetchGlobalStructuralIndex(),
      fetchActiveCount(),
    ])
    if (gsiRes.success && gsiRes.data) setData(gsiRes.data)
    if (countRes.success && countRes.count !== undefined) {
      setUtilization(Math.round((countRes.count / CAPACITY) * 100))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const displayIndex = loading ? "--" : String(data?.index ?? indexValue)
  const statusText = loading ? "---" : (data?.status ?? "NO DATA")

  return (
    <div className="flex flex-col gap-4">
      {/* Global Stability Index */}
      <div className="border border-[#C9A66B]/10 bg-[#C9A66B]/[0.02] p-4 flex flex-col gap-2">
        <span className="text-[9px] text-muted-foreground/40 tracking-widest">
          GLOBAL_STABILITY_INDEX
        </span>
        <span className="text-3xl font-light text-[#C9A66B] tabular-nums">
          {displayIndex}
        </span>
        <div className="text-[10px] text-muted-foreground/20 whitespace-pre font-mono leading-none">
          {generateProgressBar(Number(displayIndex) || 0)}
        </div>
      </div>

      {/* Threat Detection */}
      <div className="border border-[#C9A66B]/10 bg-[#C9A66B]/[0.02] p-4 flex flex-col gap-2">
        <span className="text-[9px] text-muted-foreground/40 tracking-widest">
          ACTIVE_THREAT_DETECTION
        </span>
        <span className="text-xl font-light text-foreground">
          MINIMAL
        </span>
        <span className="text-[9px] text-emerald-500/50">
          NO INCIDENTS IN LAST 24H
        </span>
      </div>

      {/* System Status */}
      <div className="border border-[#C9A66B]/10 bg-[#C9A66B]/[0.02] p-4 flex flex-col gap-2">
        <span className="text-[9px] text-muted-foreground/40 tracking-widest">
          SYSTEM_STATUS
        </span>
        <span className={`text-sm font-bold tracking-wider ${
          statusText === "STRUCTURAL STABILITY"
            ? "text-[#C9A66B]"
            : statusText === "CRITICAL EROSION"
              ? "text-red-400/70"
              : "text-foreground"
        }`}>
          {statusText}
        </span>
        <span className="text-[9px] text-muted-foreground/40">
          UTILIZATION: <span className="text-[#C9A66B]/60 tabular-nums">{utilization ?? "--"}%</span>
        </span>
      </div>
    </div>
  )
}
