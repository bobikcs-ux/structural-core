import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const MONITORING = [
  { label: "Global Structural Index", desc: "Aggregate structural integrity across all monitored regions and sovereign entities." },
  { label: "Regional Stability Metrics", desc: "Granular risk decomposition by jurisdiction, updated at each UTC epoch boundary." },
  { label: "Volatility Drift", desc: "Expression-level volatility tracking with deterministic drift detection." },
  { label: "Governance Integrity", desc: "Consensus validation and audit hash verification across the governance layer." },
]

const ARCHITECTURE = [
  { label: "UTC-Based Snapshot Invariants", desc: "All structural snapshots are anchored to UTC epoch boundaries. No ambiguity. No drift." },
  { label: "Expression-Level Uniqueness", desc: "Every data point carries a unique deterministic expression hash for full traceability." },
  { label: "Integrity Hash Verification", desc: "Cryptographic integrity verification at every checkpoint ensures immutability of the audit trail." },
  { label: "Consensus Validation Model", desc: "Multi-node consensus across the structural network with configurable quorum thresholds." },
]

const REGIONS = [
  { region: "North America", index: "97.42", volatility: "0.0031", status: "Stable" },
  { region: "Europe", index: "94.18", volatility: "0.0058", status: "Stable" },
  { region: "Asia Pacific", index: "91.33", volatility: "0.0087", status: "Elevated" },
  { region: "Middle East", index: "89.71", volatility: "0.0102", status: "Elevated" },
  { region: "Latin America", index: "86.94", volatility: "0.0134", status: "Elevated" },
  { region: "Sub-Saharan Africa", index: "83.22", volatility: "0.0178", status: "Critical" },
]

function statusColor(s: string) {
  if (s === "Stable") return "text-success"
  if (s === "Critical") return "text-danger"
  return "text-gold"
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-28 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-[10px] text-gold tracking-[0.2em] uppercase mb-4">
            Institutional Structural Risk Infrastructure
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-foreground leading-tight text-balance">
            BOBIKCS
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted max-w-xl leading-relaxed">
            Deterministic structural intelligence for institutional oversight.
            Sovereign-grade risk monitoring, simulation, and governance verification.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/clearance"
              className="text-xs tracking-wider uppercase px-5 py-2.5 bg-gold text-background font-medium hover:bg-gold-dim transition-colors"
            >
              Request Clearance
            </Link>
            <Link
              href="/intelligence"
              className="text-xs tracking-wider uppercase px-5 py-2.5 border border-border text-foreground font-medium hover:bg-surface transition-colors"
            >
              View Intelligence
            </Link>
          </div>
        </div>
      </section>

      {/* Section 1: What We Monitor */}
      <section className="py-16 md:py-24 px-6 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <div className="text-[10px] text-gold tracking-[0.2em] uppercase mb-2">Capabilities</div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-10 text-balance">
            What We Monitor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
            {MONITORING.map((item) => (
              <div key={item.label} className="bg-background p-6 md:p-8">
                <div className="text-sm font-medium text-foreground tracking-wide">{item.label}</div>
                <p className="mt-2 text-xs text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Deterministic Architecture */}
      <section className="py-16 md:py-24 px-6 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <div className="text-[10px] text-gold tracking-[0.2em] uppercase mb-2">Architecture</div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-10 text-balance">
            Deterministic Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ARCHITECTURE.map((item, i) => (
              <div key={item.label} className="border border-border p-6">
                <div className="text-[10px] text-muted tracking-wider uppercase mb-2 font-mono">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="text-sm font-medium text-foreground">{item.label}</div>
                <p className="mt-2 text-xs text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Regional Intelligence Framework */}
      <section className="py-16 md:py-24 px-6 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <div className="text-[10px] text-gold tracking-[0.2em] uppercase mb-2">Regional Coverage</div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-10 text-balance">
            Regional Intelligence Framework
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {REGIONS.map((r) => (
              <div key={r.region} className="bg-background p-5">
                <div className="text-xs text-muted tracking-wider uppercase mb-3">{r.region}</div>
                <div className="text-2xl font-semibold text-foreground tabular-nums font-mono">{r.index}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-muted font-mono tabular-nums">VOL {r.volatility}</span>
                  <span className={`text-[10px] tracking-wider uppercase font-medium ${statusColor(r.status)}`}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Governance & Audit Integrity */}
      <section className="py-16 md:py-24 px-6 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <div className="text-[10px] text-gold tracking-[0.2em] uppercase mb-2">Governance</div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-10 text-balance">
            Governance & Audit Integrity
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
            {[
              { label: "Integrity Hash", value: "0xAE7F...3B21" },
              { label: "Last Verified", value: "2026-02-23 08:14Z" },
              { label: "Node Consensus", value: "99.87%" },
              { label: "System Status", value: "OPERATIONAL" },
            ].map((item) => (
              <div key={item.label} className="bg-background p-5">
                <div className="text-[10px] text-muted tracking-wider uppercase mb-2">{item.label}</div>
                <div className="text-sm font-medium text-foreground font-mono">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
