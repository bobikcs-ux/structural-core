"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useLatestSnapshot } from "@/lib/hooks"

const REGIONS = [
  { region: "North America", index: "97.42", volatility: "0.0031", trend: "+0.12", status: "Stable" },
  { region: "Europe", index: "94.18", volatility: "0.0058", trend: "-0.04", status: "Stable" },
  { region: "Asia Pacific", index: "91.33", volatility: "0.0087", trend: "-0.21", status: "Elevated" },
  { region: "Middle East", index: "89.71", volatility: "0.0102", trend: "+0.08", status: "Elevated" },
  { region: "Latin America", index: "86.94", volatility: "0.0134", trend: "-0.47", status: "Elevated" },
  { region: "Sub-Saharan Africa", index: "83.22", volatility: "0.0178", trend: "-0.63", status: "Critical" },
  { region: "Central Asia", index: "88.04", volatility: "0.0112", trend: "+0.03", status: "Elevated" },
  { region: "Oceania", index: "95.87", volatility: "0.0042", trend: "+0.06", status: "Stable" },
]

function statusColor(s: string) {
  if (s === "Stable") return "text-success"
  if (s === "Critical") return "text-danger"
  return "text-gold"
}

export default function IntelligencePage() {
  const { data: snapshot, isLoading } = useLatestSnapshot()

  const globalIndex = snapshot
    ? ((Number(snapshot.consensus_ratio) * 100 + Number(snapshot.reserve_index) * 50) / 1.5).toFixed(2)
    : "---"

  const lastSync = snapshot
    ? new Date(snapshot.created_at).toISOString().replace("T", " ").slice(0, 19) + "Z"
    : "---"

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 pt-24 md:pt-28 pb-16 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-[10px] text-gold tracking-[0.2em] uppercase mb-2">Public Intelligence</div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-8 text-balance">
            Global Structural Index
          </h1>

          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-border mb-12">
            <div className="bg-background p-5 md:col-span-2">
              <div className="text-[10px] text-muted tracking-wider uppercase mb-1">Global Structural Index</div>
              <div className="text-4xl md:text-5xl font-semibold text-foreground font-mono tabular-nums">
                {isLoading ? (
                  <span className="text-muted animate-pulse text-lg">SYNCING...</span>
                ) : globalIndex}
              </div>
            </div>
            <div className="bg-background p-5">
              <div className="text-[10px] text-muted tracking-wider uppercase mb-1">Volatility Band</div>
              <div className="text-lg font-mono tabular-nums text-gold">
                {snapshot ? `${(Number(snapshot.consensus_ratio) * 0.003 + 0.001).toFixed(4)}` : "---"}
              </div>
            </div>
            <div className="bg-background p-5">
              <div className="text-[10px] text-muted tracking-wider uppercase mb-1">Active Regions</div>
              <div className="text-lg font-mono tabular-nums text-foreground">
                {REGIONS.length}
              </div>
            </div>
            <div className="bg-background p-5">
              <div className="text-[10px] text-muted tracking-wider uppercase mb-1">Last Sync (UTC)</div>
              <div className="text-xs font-mono tabular-nums text-muted leading-relaxed mt-1">
                {lastSync}
              </div>
            </div>
          </div>

          {/* Integrity hash */}
          <div className="border border-border p-4 mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="text-[10px] text-muted tracking-wider uppercase mb-0.5">Integrity Hash</div>
              <div className="text-xs font-mono text-gold">{snapshot?.integrity_hash ?? "---"}</div>
            </div>
            <div className="text-[10px] text-muted tracking-wider uppercase">
              VERIFIED // {snapshot ? Number(snapshot.active_nodes) : "---"} NODES
            </div>
          </div>

          {/* Regional breakdown table */}
          <div>
            <div className="text-[10px] text-gold tracking-[0.2em] uppercase mb-4">Regional Breakdown</div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[10px] text-muted tracking-wider uppercase font-medium py-3 pr-4">Region</th>
                    <th className="text-right text-[10px] text-muted tracking-wider uppercase font-medium py-3 px-4">Index</th>
                    <th className="text-right text-[10px] text-muted tracking-wider uppercase font-medium py-3 px-4">Volatility</th>
                    <th className="text-right text-[10px] text-muted tracking-wider uppercase font-medium py-3 px-4">Trend</th>
                    <th className="text-right text-[10px] text-muted tracking-wider uppercase font-medium py-3 pl-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {REGIONS.map((r) => (
                    <tr key={r.region} className="border-b border-border hover:bg-surface transition-colors">
                      <td className="py-3 pr-4 text-sm text-foreground">{r.region}</td>
                      <td className="py-3 px-4 text-sm text-foreground font-mono tabular-nums text-right">{r.index}</td>
                      <td className="py-3 px-4 text-sm text-muted font-mono tabular-nums text-right">{r.volatility}</td>
                      <td className={`py-3 px-4 text-sm font-mono tabular-nums text-right ${r.trend.startsWith("-") ? "text-danger" : "text-success"}`}>
                        {r.trend}
                      </td>
                      <td className={`py-3 pl-4 text-xs tracking-wider uppercase font-medium text-right ${statusColor(r.status)}`}>
                        {r.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-px bg-border">
              {REGIONS.map((r) => (
                <div key={r.region} className="bg-background p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">{r.region}</span>
                    <span className={`text-[10px] tracking-wider uppercase font-medium ${statusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-[10px] text-muted uppercase">Index</div>
                      <div className="text-lg font-mono tabular-nums text-foreground">{r.index}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted uppercase">Vol</div>
                      <div className="text-sm font-mono tabular-nums text-muted">{r.volatility}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted uppercase">Trend</div>
                      <div className={`text-sm font-mono tabular-nums ${r.trend.startsWith("-") ? "text-danger" : "text-success"}`}>
                        {r.trend}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
