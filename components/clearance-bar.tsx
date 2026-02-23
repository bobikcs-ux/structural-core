"use client"

import { useEffect, useState } from "react"

function getTimestamp() {
  const now = new Date()
  return now.toISOString().replace("T", " // ").slice(0, 24) + "Z"
}

export function ClearanceBar() {
  const [time, setTime] = useState(getTimestamp())

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimestamp()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header
      className="flex items-center justify-between border-b border-border px-3 py-1 bg-surface shrink-0"
      style={{ height: "28px" }}
    >
      <div className="flex items-center gap-3">
        <span className="text-gold font-semibold text-[10px] tracking-[0.15em] uppercase">
          BOBIKCS // STRUCTURAL CORE
        </span>
        <span className="text-border-strong">|</span>
        <span className="text-muted text-[9px] tracking-wider uppercase">
          CLEARANCE: SOVEREIGN
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[9px] text-muted tracking-wider">
          NODE: PRIMARY
        </span>
        <span className="text-border-strong">|</span>
        <span className="text-[9px] text-gold tabular-nums">
          {time}
        </span>
      </div>
    </header>
  )
}
