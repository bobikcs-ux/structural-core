"use client"

import { useEffect, useState } from "react"
import { useConnectionHealth } from "@/lib/hooks"

export function ClearanceBar() {
  const [mounted, setMounted] = useState(false)
  const { data: health } = useConnectionHealth()

  useEffect(() => { setMounted(true) }, [])

  // Determine status
  const connected = !!health?.connected
  const elapsed = health ? Date.now() - health.lastUpdate : Infinity
  const statusLabel = !mounted ? "---" : connected && elapsed < 10000 ? "LIVE" : connected && elapsed < 30000 ? "DELAYED" : "OFFLINE"
  const dotClass = statusLabel === "LIVE" ? "bg-success animate-pulse" : statusLabel === "DELAYED" ? "bg-gold" : statusLabel === "OFFLINE" ? "bg-danger" : "bg-muted"
  const textClass = statusLabel === "LIVE" ? "text-success" : statusLabel === "DELAYED" ? "text-gold" : statusLabel === "OFFLINE" ? "text-danger" : "text-muted"

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
          <span className={`inline-block w-1.5 h-1.5 ${dotClass}`} />
          <span className={`text-[9px] tracking-wider uppercase ${textClass}`}>{statusLabel}</span>
          {mounted && health && (
            <>
              <span className="text-border-strong">|</span>
              <span className="text-[9px] text-muted tabular-nums">{health.latency}ms</span>
            </>
          )}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[9px] text-muted tracking-wider">NODE: PRIMARY</span>
        <span className="text-border-strong">|</span>
        <ClientClock />
      </div>
    </header>
  )
}

function ClientClock() {
  const [time, setTime] = useState("")

  useEffect(() => {
    function tick() {
      setTime(new Date().toISOString().replace("T", " // ").slice(0, 24) + "Z")
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="text-[9px] text-gold tabular-nums" suppressHydrationWarning>
      {time || "--:--:--"}
    </span>
  )
}
