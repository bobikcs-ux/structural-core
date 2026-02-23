"use client"

import { useEffect, useState } from "react"
import { useConnectionHealth } from "@/lib/hooks"

export function ClearanceBar() {
  const [mounted, setMounted] = useState(false)
  const { data: health } = useConnectionHealth()

  useEffect(() => { setMounted(true) }, [])

  return (
    <header
      className="flex items-center justify-between border-b border-border px-3 shrink-0"
      style={{ height: "28px", backgroundColor: "#0A0A0A" }}
      suppressHydrationWarning
    >
      <div className="flex items-center gap-3" suppressHydrationWarning>
        <span className="text-gold font-semibold text-[10px] tracking-[0.15em] uppercase">
          BOBIKCS // STRUCTURAL CORE
        </span>
        <span className="text-border-strong">|</span>
        <span className="text-muted text-[9px] tracking-wider uppercase">
          CLEARANCE: SOVEREIGN
        </span>
        <span className="text-border-strong">|</span>
        {mounted ? <LiveStatus health={health} /> : (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 bg-muted" />
            <span className="text-[9px] tracking-wider uppercase text-muted">---</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-3" suppressHydrationWarning>
        <span className="text-[9px] text-muted tracking-wider">NODE: PRIMARY</span>
        <span className="text-border-strong">|</span>
        <span className="text-[9px] text-gold tabular-nums" suppressHydrationWarning>
          {mounted ? <LiveClock /> : "--:--:--"}
        </span>
      </div>
    </header>
  )
}

function LiveClock() {
  const [time, setTime] = useState("--:--:--")
  useEffect(() => {
    function tick() {
      setTime(new Date().toISOString().replace("T", " // ").slice(0, 24) + "Z")
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return <span suppressHydrationWarning>{time}</span>
}

function LiveStatus({ health }: { health?: { connected: boolean; latency: number; lastUpdate: number } | null }) {
  const connected = !!health?.connected
  const elapsed = health ? Date.now() - health.lastUpdate : Infinity
  const label = connected && elapsed < 10000 ? "LIVE" : connected && elapsed < 30000 ? "DELAYED" : "OFFLINE"
  const dot = label === "LIVE" ? "bg-success animate-pulse" : label === "DELAYED" ? "bg-gold" : "bg-danger"
  const clr = label === "LIVE" ? "text-success" : label === "DELAYED" ? "text-gold" : "text-danger"

  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block w-1.5 h-1.5 ${dot}`} />
      <span className={`text-[9px] tracking-wider uppercase ${clr}`}>{label}</span>
      {health && (
        <>
          <span className="text-border-strong">|</span>
          <span className="text-[9px] text-muted tabular-nums">{health.latency}ms</span>
        </>
      )}
    </span>
  )
}
