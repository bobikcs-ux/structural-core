"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { generateReportPDF } from "@/lib/pdf-engine"

const REPORTS = [
  {
    title: "Monthly Structural Risk Report",
    version: "v2026.02",
    timestamp: "2026-02-01 00:00:00Z",
    hash: "0x7a3f8e2b1c4d5a6f9e0b3c7d",
    category: "Monthly",
  },
  {
    title: "Quarterly Integrity Review -- Q4 2025",
    version: "v2025.Q4",
    timestamp: "2026-01-15 00:00:00Z",
    hash: "0x9b4c1d3e5f6a7b8c0d2e4f6a",
    category: "Quarterly",
  },
  {
    title: "Regional Outlook -- Asia Pacific",
    version: "v2026.02-APAC",
    timestamp: "2026-02-10 00:00:00Z",
    hash: "0x2c5d6e7f8a9b0c1d3e4f5a6b",
    category: "Regional",
  },
  {
    title: "Monthly Structural Risk Report",
    version: "v2026.01",
    timestamp: "2026-01-01 00:00:00Z",
    hash: "0x3d6e7f8a9b0c1d2e4f5a6b7c",
    category: "Monthly",
  },
  {
    title: "Regional Outlook -- Europe",
    version: "v2026.01-EU",
    timestamp: "2026-01-20 00:00:00Z",
    hash: "0x4e7f8a9b0c1d2e3f5a6b7c8d",
    category: "Regional",
  },
  {
    title: "Quarterly Integrity Review -- Q3 2025",
    version: "v2025.Q3",
    timestamp: "2025-10-15 00:00:00Z",
    hash: "0x5f8a9b0c1d2e3f4a6b7c8d9e",
    category: "Quarterly",
  },
  {
    title: "Annual Governance Audit Report",
    version: "v2025.ANNUAL",
    timestamp: "2026-01-31 00:00:00Z",
    hash: "0x6a9b0c1d2e3f4a5b7c8d9e0f",
    category: "Annual",
  },
  {
    title: "Regional Outlook -- Latin America",
    version: "v2025.12-LATAM",
    timestamp: "2025-12-15 00:00:00Z",
    hash: "0x7b0c1d2e3f4a5b6c8d9e0f1a",
    category: "Regional",
  },
]

function categoryColor(c: string) {
  if (c === "Monthly") return "text-gold"
  if (c === "Quarterly") return "text-foreground"
  if (c === "Annual") return "text-success"
  return "text-muted"
}

export default function ReportsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 pt-24 md:pt-28 pb-16 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-[10px] text-gold tracking-[0.2em] uppercase mb-2">Archive</div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-2 text-balance">
            Reports & Publications
          </h1>
          <p className="text-sm text-muted mb-10 max-w-lg">
            Institutional risk reports, integrity reviews, and regional outlooks.
            Each document is integrity-verified with a cryptographic hash.
          </p>

          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="border border-border">
              <div className="grid grid-cols-[1fr_120px_180px_220px_100px] border-b border-border bg-surface">
                <div className="px-4 py-3 text-[10px] text-muted tracking-wider uppercase font-medium">Title</div>
                <div className="px-4 py-3 text-[10px] text-muted tracking-wider uppercase font-medium">Version</div>
                <div className="px-4 py-3 text-[10px] text-muted tracking-wider uppercase font-medium">Timestamp</div>
                <div className="px-4 py-3 text-[10px] text-muted tracking-wider uppercase font-medium">Integrity Hash</div>
                <div className="px-4 py-3 text-[10px] text-muted tracking-wider uppercase font-medium text-right">Action</div>
              </div>
              {REPORTS.map((report, i) => (
                <div key={i} className="grid grid-cols-[1fr_120px_180px_220px_100px] border-b border-border last:border-b-0 hover:bg-surface transition-colors">
                  <div className="px-4 py-3">
                    <div className="text-sm text-foreground">{report.title}</div>
                    <div className={`text-[10px] tracking-wider uppercase mt-0.5 ${categoryColor(report.category)}`}>
                      {report.category}
                    </div>
                  </div>
                  <div className="px-4 py-3 text-xs text-muted font-mono self-center">{report.version}</div>
                  <div className="px-4 py-3 text-xs text-muted font-mono tabular-nums self-center">{report.timestamp}</div>
                  <div className="px-4 py-3 text-xs text-gold font-mono self-center">{report.hash}</div>
                  <div className="px-4 py-3 self-center text-right">
                    <button
                      onClick={() => generateReportPDF(report)}
                      className="text-[10px] tracking-wider uppercase px-3 py-1 border border-border text-muted hover:text-foreground hover:bg-surface transition-colors"
                    >
                      PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-px bg-border border border-border">
            {REPORTS.map((report, i) => (
              <div key={i} className="bg-background p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-sm text-foreground">{report.title}</div>
                    <div className={`text-[10px] tracking-wider uppercase mt-0.5 ${categoryColor(report.category)}`}>
                      {report.category} -- {report.version}
                    </div>
                  </div>
                  <button
                    onClick={() => generateReportPDF(report)}
                    className="text-[10px] tracking-wider uppercase px-3 py-1 border border-border text-muted hover:text-foreground shrink-0"
                  >
                    PDF
                  </button>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-muted">
                  <span className="font-mono tabular-nums">{report.timestamp}</span>
                </div>
                <div className="text-[10px] text-gold font-mono mt-1">{report.hash}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
