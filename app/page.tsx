"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { MirrorModule } from "@/components/core/mirror-module"
import { VaultModule } from "@/components/core/vault-module"
import { DriftModule } from "@/components/core/drift-module"
import { CategoryModule } from "@/components/core/category-module"
import { LicensePanel } from "@/components/core/license-panel"
import { IntelFeed } from "@/components/core/intel-feed"
import { SystemMetrics } from "@/components/core/system-metrics"

/* ── Clock ── */
function useClock() {
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
  return time
}

/* ── Active View Tracking ── */
type ViewId = "scanner" | "network" | "archive" | "encryption"

const NAV_ITEMS: { id: ViewId; number: string; label: string }[] = [
  { id: "scanner", number: "01", label: "SCANNER" },
  { id: "network", number: "02", label: "NETWORK_MAP" },
  { id: "archive", number: "03", label: "ARCHIVE_LOGS" },
  { id: "encryption", number: "04", label: "ENCRYPTION" },
]

/* ── ASCII Progress Bar ── */
function generateProgressBar(val: number) {
  const filled = Math.round((val / 100) * 20)
  return "\u2588".repeat(filled) + "\u2591".repeat(20 - filled)
}

/* ── Page ── */
export default function Page() {
  const time = useClock()
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeView, setActiveView] = useState<ViewId>("scanner")
  const [indexValue, setIndexValue] = useState(72.4)

  const handleScanComplete = useCallback(() => {
    setRefreshKey((k) => k + 1)
    router.refresh()
  }, [router])

  return (
    <div className="min-h-dvh bg-background text-foreground font-mono flex flex-col overflow-hidden selection:bg-[#C9A66B]/30 selection:text-foreground">

      {/* ── HEADER ── */}
      <header className="h-16 border-b border-[#C9A66B]/10 flex items-center justify-between px-8 bg-background/80 backdrop-blur-md z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 border border-[#C9A66B] bg-[#C9A66B]" />
          <span className="text-sm font-bold tracking-tight text-foreground">
            BOBIKCS // STRUCTURAL CORE
          </span>
        </div>
        <div className="flex items-center gap-8">
          <span className="text-[10px] text-muted-foreground/40 hidden sm:inline">
            NODE_VERSION: 2.0.26
          </span>
          <span className="text-[10px] text-muted-foreground">
            SYSTEM_INDEX: <span className="text-[#C9A66B] tabular-nums">{indexValue}</span>
          </span>
          <span className="text-[10px] text-muted-foreground/40 hidden md:inline tabular-nums">
            {time || "--:--:--"}
          </span>
          <div className="w-2 h-2 rounded-full bg-[#C9A66B] animate-pulse" />
        </div>
      </header>

      <div className="flex flex-1 min-h-0">

        {/* ── SIDEBAR ── */}
        <aside className="w-64 border-r border-[#C9A66B]/10 p-6 flex-col gap-6 hidden lg:flex shrink-0">
          <div className="text-[10px] text-muted-foreground/20 tracking-[0.2em] mb-2">
            SYSTEM_NAVIGATION
          </div>

          <nav className="flex flex-col gap-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`text-left py-2 px-1 transition-all duration-300 ${
                    isActive
                      ? "text-[#C9A66B] text-[11px] tracking-[0.2em] uppercase opacity-100"
                      : "text-[11px] tracking-[0.2em] uppercase opacity-40 hover:opacity-100 hover:text-[#C9A66B]"
                  }`}
                >
                  {item.number} // {item.label}
                </button>
              )
            })}
          </nav>

          {/* License Pool -- bottom */}
          <div className="mt-auto">
            <div className="text-[9px] text-muted-foreground/20 mb-2 tracking-[0.15em]">
              LICENSE_POOL
            </div>
            <div className="text-[10px] text-muted-foreground/20 whitespace-pre font-mono leading-none">
              {generateProgressBar(63)}
            </div>
            <div className="text-[9px] text-muted-foreground/40 mt-1.5">
              UTILIZATION: <span className="text-[#C9A66B]/60">63%</span>
            </div>

            {/* System info */}
            <div className="mt-6 pt-4 border-t border-[#C9A66B]/10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground/30 tracking-widest uppercase">
                  Protocol
                </span>
                <span className="text-[9px] text-[#C9A66B]/50">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground/30 tracking-widest uppercase">
                  Encryption
                </span>
                <span className="text-[9px] text-[#C9A66B]/50">AES-256</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground/30 tracking-widest uppercase">
                  Clearance
                </span>
                <span className="text-[9px] text-[#C9A66B]/50">LEVEL 4</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 p-8 overflow-y-auto min-h-0">

          {/* Scanner View (default) */}
          {activeView === "scanner" && (
            <div className="flex flex-col gap-8 animate-fade-in">
              {/* Top Grid: Intel Feed + System Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Intel Feed -- 2/3 */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="text-xs font-bold border-l-2 border-[#C9A66B] pl-3 mb-2 tracking-wider">
                    LIVE_INTEL_FEED
                  </div>
                  <div className="border border-[#C9A66B]/10 bg-[#C9A66B]/[0.02]">
                    <IntelFeed className="p-5" />
                  </div>
                </div>

                {/* System Metrics -- 1/3 */}
                <div className="flex flex-col gap-4">
                  <div className="text-xs font-bold border-l-2 border-muted-foreground/20 pl-3 mb-2 tracking-wider">
                    SYSTEM_METRICS
                  </div>
                  <SystemMetrics indexValue={indexValue} />
                </div>
              </div>

              {/* Separator */}
              <div className="h-px bg-[#C9A66B]/10" />

              {/* Mirror Module (Scanner) */}
              <div>
                <div className="text-xs font-bold border-l-2 border-[#C9A66B] pl-3 mb-6 tracking-wider">
                  INTEGRITY_SCANNER
                </div>
                <MirrorModule onScanComplete={handleScanComplete} />
              </div>

              {/* Separator */}
              <div className="h-px bg-[#C9A66B]/10" />

              {/* Bottom Grid: Drift + Category */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-bold border-l-2 border-[#C9A66B]/60 pl-3 mb-6 tracking-wider">
                    DRIFT_ANALYSIS
                  </div>
                  <DriftModule refreshKey={refreshKey} />
                </div>
                <div>
                  <div className="text-xs font-bold border-l-2 border-[#C9A66B]/60 pl-3 mb-6 tracking-wider">
                    CATEGORY_FEED
                  </div>
                  <CategoryModule refreshKey={refreshKey} />
                </div>
              </div>

              {/* Separator */}
              <div className="h-px bg-[#C9A66B]/10" />

              {/* License */}
              <div>
                <div className="text-xs font-bold border-l-2 border-muted-foreground/20 pl-3 mb-6 tracking-wider">
                  LICENSE_STATUS
                </div>
                <div className="max-w-md">
                  <LicensePanel refreshKey={refreshKey} />
                </div>
              </div>
            </div>
          )}

          {/* Network Map View */}
          {activeView === "network" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="text-xs font-bold border-l-2 border-[#C9A66B] pl-3 tracking-wider">
                NETWORK_MAP
              </div>
              <div className="border border-[#C9A66B]/10 bg-[#C9A66B]/[0.02] p-8">
                <div className="text-[11px] text-muted-foreground/40 font-mono">
                  {">"} Network topology scanning...
                  <span className="inline-block w-1.5 h-3 bg-[#C9A66B]/40 ml-0.5 animate-pulse" />
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {["NODE_ALPHA", "NODE_BETA", "NODE_GAMMA", "NODE_DELTA", "NODE_EPSILON", "NODE_ZETA"].map((node) => (
                    <div key={node} className="border border-[#C9A66B]/10 p-4 flex flex-col gap-2">
                      <span className="text-[9px] text-muted-foreground/40 tracking-widest">{node}</span>
                      <span className="text-[11px] text-[#C9A66B]/60">ONLINE</span>
                      <div className="h-px bg-[#C9A66B]/10 mt-1" />
                      <span className="text-[9px] text-muted-foreground/30">LATENCY: {Math.floor(Math.random() * 30 + 5)}ms</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Archive Logs View */}
          {activeView === "archive" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="text-xs font-bold border-l-2 border-[#C9A66B] pl-3 tracking-wider">
                ARCHIVE_LOGS
              </div>
              <div className="border border-[#C9A66B]/10 bg-[#C9A66B]/[0.02] p-8">
                <VaultModule />
              </div>
            </div>
          )}

          {/* Encryption View */}
          {activeView === "encryption" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="text-xs font-bold border-l-2 border-[#C9A66B] pl-3 tracking-wider">
                ENCRYPTION_STATUS
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-[#C9A66B]/10 bg-[#C9A66B]/[0.02] p-6 flex flex-col gap-4">
                  <span className="text-[9px] text-muted-foreground/40 tracking-widest">ENCRYPTION_PROTOCOL</span>
                  <span className="text-3xl font-light text-[#C9A66B]">AES-256</span>
                  <div className="text-[10px] text-muted-foreground/20 whitespace-pre font-mono leading-none">
                    {generateProgressBar(98)}
                  </div>
                  <span className="text-[9px] text-emerald-500/50">ALL CHANNELS ENCRYPTED</span>
                </div>
                <div className="border border-[#C9A66B]/10 bg-[#C9A66B]/[0.02] p-6 flex flex-col gap-4">
                  <span className="text-[9px] text-muted-foreground/40 tracking-widest">KEY_ROTATION</span>
                  <span className="text-xl font-light text-foreground">AUTOMATED</span>
                  <span className="text-[9px] text-muted-foreground/40">LAST ROTATION: 2h 14m AGO</span>
                  <span className="text-[9px] text-[#C9A66B]/50">NEXT: IN 21h 46m</span>
                </div>
              </div>
              <div className="border border-[#C9A66B]/10 bg-[#C9A66B]/[0.02] p-6">
                <div className="text-xs font-bold border-l-2 border-muted-foreground/20 pl-3 mb-6 tracking-wider">
                  LICENSE_ALLOCATION
                </div>
                <div className="max-w-md">
                  <LicensePanel refreshKey={refreshKey} />
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-[#C9A66B]/10 flex items-center justify-between text-[11px] text-muted-foreground/30 tracking-wider">
            <span>{"(C)"} 2026 STRUCTURAL CORE -- Internal Secure Layer</span>
            <span className="hidden sm:inline">A BOBIKCS PROPRIETARY INSTRUMENT</span>
          </footer>
        </main>
      </div>
    </div>
  )
}
