"use client"

import { useEffect, useState, useCallback } from "react"
import {
  fetchGlobalStructuralIndex,
  fetchActiveCount,
  type SystemBarData,
} from "@/app/actions/scanner"

const CAPACITY = 200

export function SystemBar({ refreshKey }: { refreshKey: number }) {
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
  }, [load, refreshKey])

  const indexDisplay = loading ? "--" : String(data?.index ?? 0)
  const statusText = loading ? "---" : (data?.status ?? "NO DATA")
  const utilDisplay = loading ? "--%" : `${utilization ?? 0}%`

  return (
    <div className="border-b border-[#C9A66B]/20 bg-background/80 backdrop-blur-sm">
      <div className="px-6 py-1.5 flex items-center justify-between font-mono text-[11px] tracking-widest text-muted-foreground">
        <div className="flex items-center gap-4 md:gap-6">
          <span>
            GLOBAL INDEX:{" "}
            <span className="text-gold tabular-nums">{indexDisplay}</span>
          </span>
          <span className="hidden sm:inline">
            SYSTEM STATUS:{" "}
            <span className={
              statusText === "STRUCTURAL STABILITY"
                ? "text-gold"
                : statusText === "CRITICAL EROSION"
                  ? "text-gold-bright"
                  : "text-foreground"
            }>{statusText}</span>
          </span>
        </div>
        <span>
          UTILIZATION:{" "}
          <span className="text-gold tabular-nums">{utilDisplay}</span>
        </span>
      </div>
    </div>
  )
}
