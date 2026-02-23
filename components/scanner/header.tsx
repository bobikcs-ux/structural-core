"use client"

import { useEffect, useState } from "react"

export function ScannerHeader() {
  const [time, setTime] = useState("")

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="shrink-0 border-b border-terminal-line">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 border border-gold bg-gold" />
          <h1 className="font-mono text-sm font-bold tracking-widest text-gold">
            MONOLITH <span className="text-muted-foreground">//</span> SCANNER
          </h1>
        </div>
        <div className="flex items-center gap-6 font-mono text-xs text-muted-foreground">
          <span className="hidden sm:inline">SYS:NOMINAL</span>
          <span className="text-gold">{time || "--:--:--"}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 border-t border-terminal-line px-6 py-2 font-mono text-xs text-muted-foreground">
        <span>MODULE: INTEGRITY_ASSESSMENT</span>
        <span className="hidden sm:inline text-terminal-line">|</span>
        <span className="hidden sm:inline">PROTOCOL: STRUCTURAL_ANALYSIS</span>
        <span className="text-terminal-line">|</span>
        <span className="text-gold">STATUS: ACTIVE</span>
      </div>
    </header>
  )
}
