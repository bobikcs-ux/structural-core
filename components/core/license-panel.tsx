"use client"

import { useEffect, useState, useCallback } from "react"
import { fetchActiveCount } from "@/app/actions/scanner"

const CAPACITY = 200
const LICENSE_ID = "SC-042-2026"
const EXPIRES = "2027-02-19"

export function LicensePanel({ refreshKey }: { refreshKey: number }) {
  const [active, setActive] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetchActiveCount()
    if (res.success) setActive(res.count ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  const pct = active !== null ? Math.min((active / CAPACITY) * 100, 100) : 0
  const isHighUtilization = pct > 85
  const accentColor = isHighUtilization ? "text-gold-bright" : "text-gold"
  const barColor = isHighUtilization ? "bg-gold-bright" : "bg-gold"
  const borderAccent = isHighUtilization ? "border-gold-bright/60" : "border-gold/40"

  return (
    <div className={`border ${borderAccent} bg-terminal-black`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${isHighUtilization ? "border-gold-bright/30" : "border-gold/20"}`}>
        <span className={`font-mono text-xs tracking-widest ${accentColor}`}>
          LICENSE
        </span>
        <span className={`font-mono text-xs ${accentColor}`}>ACTIVE</span>
      </div>

      {/* Fields */}
      <div className="px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-muted-foreground tracking-wider leading-relaxed">
            LICENSE ID
          </span>
          <span className="font-mono text-[11px] text-gold">
            {LICENSE_ID}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-muted-foreground tracking-wider">
            STATUS
          </span>
          <span className="font-mono text-[11px] text-gold">
            ACTIVE
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-muted-foreground tracking-wider">
            EXPIRES AT
          </span>
          <span className="font-mono text-[11px] text-foreground">
            {EXPIRES}
          </span>
        </div>

        {/* Capacity bar */}
        <div className="mt-2 pt-2 border-t border-terminal-line">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[11px] text-muted-foreground tracking-wider">
              CAPACITY
            </span>
            <span className={`font-mono text-[11px] ${accentColor}`}>
              {loading ? "---" : active} / {CAPACITY}
            </span>
          </div>
          <div className="h-1 bg-terminal-line">
            <div
              className={`h-1 ${barColor} transition-all duration-700`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Utilization % */}
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono text-[11px] text-muted-foreground tracking-wider">
              UTILIZATION
            </span>
            <span className={`font-mono text-[11px] ${accentColor}`}>
              {loading ? "---" : `${Math.round(pct)}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={`flex border-t ${isHighUtilization ? "border-gold-bright/30" : "border-gold/20"}`}>
        <button
          type="button"
          className={`flex-1 font-mono text-[11px] tracking-wider py-2.5 ${accentColor} border-r ${isHighUtilization ? "border-gold-bright/30" : "border-gold/20"}`}
        >
          REQUEST LICENSE
        </button>
        <button
          type="button"
          className="flex-1 font-mono text-[11px] tracking-wider py-2.5 text-muted-foreground"
        >
          RENEW
        </button>
      </div>
    </div>
  )
}
