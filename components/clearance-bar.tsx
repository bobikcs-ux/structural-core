"use client"

import { useEffect, useState } from "react"
import { useConnectionHealth } from "@/lib/hooks"

export function ClearanceBar() {
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState("--:--:--")
  const { data: health } = useConnectionHealth()

  useEffect(() => {
    setMounted(true)
    function tick() {
      const now = new Date()
      setTime(now.toISOString().replace("T", " // ").slice(0, 24) + "Z")
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const connected = mounted ? !!health?.connected : false
  const latencyMs = mounted && health ? health.latency : 0
  const elapsed = mounted && health ? Date.now() - health.lastUpdate : Infinity
  const statusLabel = !mounted ? "---" : connected && elapsed < 10000 ? "LIVE" : connected && elapsed < 30000 ? "DELAYED" : "OFFLINE"
  const statusDot = statusLabel === "LIVE" ? "bg-success animate-pulse" : statusLabel === "DELAYED" ? "bg-gold" : "bg-danger"
  const statusText = statusLabel === "LIVE" ? "text-success" : statusLabel === "DELAYED" ? "text-gold" : "text-danger"

  return (
    <header
      className="flex items-center justify-between border-b border-border px-3 shrink-0"
      style={{ height: "28px", backgroundColor: "#0A0A0A" }}
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
        <span className="flex items-center gap-1.5">
          <span className={`inline-block w-1.5 h-1.5 ${mounted ? statusDot : "bg-muted"}`} />
          <span className={`text-[9px] tracking-wider uppercase ${mounted ? statusText : "text-muted"}`}>
            {statusLabel}
          </span>
        </span>
        {mounted && health && (
          <>
            <span className="text-border-strong">|</span>
            <span className="text-[9px] text-muted tabular-nums">{latencyMs}ms</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[9px] text-muted tracking-wider">
          NODE: PRIMARY
        </span>
        <span className="text-border-strong">|</span>
        <span className="text-[9px] text-gold tabular-nums" suppressHydrationWarning>
          {mounted ? time : "--:--:--"}
        </span>
      </div>
    </header>
  )
}
