"use client"

import { useEffect, useState } from "react"
import { useConnectionHealth } from "@/lib/hooks"

function getTimestamp() {
  const now = new Date()
  return now.toISOString().replace("T", " // ").slice(0, 24) + "Z"
}

function statusFromLatency(health: { connected: boolean; latency: number; lastUpdate: number } | undefined) {
  if (!health || !health.connected) return { label: "OFFLINE", color: "bg-danger text-danger" }
  const age = Date.now() - health.lastUpdate
  if (age < 10000) return { label: "LIVE", color: "bg-success text-success" }
  if (age < 15000) return { label: "DELAYED", color: "bg-gold text-gold" }
  return { label: "OFFLINE", color: "bg-danger text-danger" }
}

export function ClearanceBar() {
  const [time, setTime] = useState("")
  const [mounted, setMounted] = useState(false)
  const { data: health } = useConnectionHealth()
  const status = statusFromLatency(health)

  useEffect(() => {
    setMounted(true)
    setTime(getTimestamp())
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
        <span className="text-border-strong">|</span>
        <span className="flex items-center gap-1.5" suppressHydrationWarning>
          <span className={`inline-block w-1.5 h-1.5 ${mounted ? status.color.split(" ")[0] : "bg-muted"} ${mounted && status.label === "LIVE" ? "animate-pulse" : ""}`} />
          <span className={`text-[9px] tracking-wider uppercase ${mounted ? status.color.split(" ")[1] : "text-muted"}`} suppressHydrationWarning>
            {mounted ? status.label : "---"}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[9px] text-muted tracking-wider">
          NODE: PRIMARY
        </span>
        <span className="text-border-strong">|</span>
        <span className="text-[9px] text-gold tabular-nums" suppressHydrationWarning>
          {time}
        </span>
      </div>
    </header>
  )
}
