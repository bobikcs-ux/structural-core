"use client"

/**
 * Reports Page - PDF Documents with Integrity Hashes
 * List of institutional reports with verification
 */

import { useState } from "react"
import { 
  FileText, 
  Download, 
  Shield, 
  ShieldCheck,
  Calendar,
  Hash,
  ExternalLink,
  Search,
  Filter
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

interface Report {
  id: string
  title: string
  category: "DAILY" | "WEEKLY" | "MONTHLY" | "SPECIAL"
  date: string
  size: string
  hash: string
  verified: boolean
}

// ============================================================================
// Mock Data
// ============================================================================

const REPORTS: Report[] = [
  {
    id: "1",
    title: "SRI Weekly Summary - Week 9",
    category: "WEEKLY",
    date: "2026-02-27",
    size: "2.4 MB",
    hash: "sha256:8f14e45fceea167a5a36dedd4bea254...",
    verified: true,
  },
  {
    id: "2",
    title: "Yield Curve Analysis Report",
    category: "SPECIAL",
    date: "2026-02-26",
    size: "4.1 MB",
    hash: "sha256:7c82fa6c3e2d8a1b9f4e5d6c7a8b9c0...",
    verified: true,
  },
  {
    id: "3",
    title: "Daily Integrity Snapshot - Feb 26",
    category: "DAILY",
    date: "2026-02-26",
    size: "1.2 MB",
    hash: "sha256:9b2c5e8a1d3f6g7h8i9j0k1l2m3n4o5...",
    verified: true,
  },
  {
    id: "4",
    title: "Monthly Market Structure Review",
    category: "MONTHLY",
    date: "2026-02-01",
    size: "8.7 MB",
    hash: "sha256:1a3b5c7d9e1f3g5h7i9j1k3l5m7n9o1...",
    verified: true,
  },
  {
    id: "5",
    title: "Daily Integrity Snapshot - Feb 25",
    category: "DAILY",
    date: "2026-02-25",
    size: "1.1 MB",
    hash: "sha256:2b4d6f8g0h2i4j6k8l0m2n4o6p8q0r2...",
    verified: true,
  },
  {
    id: "6",
    title: "Liquidity Stress Test Results",
    category: "SPECIAL",
    date: "2026-02-24",
    size: "3.5 MB",
    hash: "sha256:3c5e7g9i1k3m5o7q9s1u3w5y7a9c1e3...",
    verified: false,
  },
  {
    id: "7",
    title: "SRI Weekly Summary - Week 8",
    category: "WEEKLY",
    date: "2026-02-20",
    size: "2.3 MB",
    hash: "sha256:4d6f8h0j2l4n6p8r0t2v4x6z8b0d2f4...",
    verified: true,
  },
  {
    id: "8",
    title: "Fed Rate Impact Analysis",
    category: "SPECIAL",
    date: "2026-02-18",
    size: "5.2 MB",
    hash: "sha256:5e7g9i1k3m5o7q9s1u3w5y7a9c1e3g5...",
    verified: true,
  },
]

// ============================================================================
// Main Component
// ============================================================================

export default function ReportsPage() {
  const [filter, setFilter] = useState<string>("ALL")
  const [search, setSearch] = useState("")

  const filteredReports = REPORTS.filter((report) => {
    const matchesFilter = filter === "ALL" || report.category === filter
    const matchesSearch = report.title.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "DAILY": return "text-[hsl(200,80%,50%)]"
      case "WEEKLY": return "text-[hsl(45,90%,50%)]"
      case "MONTHLY": return "text-[hsl(280,80%,60%)]"
      case "SPECIAL": return "text-[hsl(340,80%,60%)]"
      default: return "text-[hsl(0,0%,50%)]"
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(0,0%,2%)] py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-full mb-6">
            <FileText className="w-4 h-4 text-[hsl(45,90%,50%)]" />
            <span className="text-[10px] font-mono tracking-wider text-[hsl(0,0%,60%)]">
              DOCUMENT ARCHIVE
            </span>
          </div>
          <h1 className="text-3xl font-mono font-bold text-[hsl(45,20%,95%)] mb-4">
            INSTITUTIONAL REPORTS
          </h1>
          <p className="text-sm font-mono text-[hsl(0,0%,50%)]">
            Cryptographically verified PDF documents with integrity hashes
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(0,0%,40%)]" />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded text-sm font-mono text-[hsl(45,20%,95%)] placeholder:text-[hsl(0,0%,30%)] focus:outline-none focus:border-[hsl(45,90%,50%)]/30"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[hsl(0,0%,40%)]" />
            <div className="flex gap-1">
              {["ALL", "DAILY", "WEEKLY", "MONTHLY", "SPECIAL"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`
                    px-3 py-2 text-[10px] font-mono rounded border transition-all
                    ${filter === cat
                      ? "bg-[hsl(45,90%,50%)]/10 border-[hsl(45,90%,50%)]/30 text-[hsl(45,90%,50%)]"
                      : "bg-[hsl(0,0%,4%)] border-[hsl(0,0%,12%)] text-[hsl(0,0%,50%)] hover:border-[hsl(0,0%,20%)]"
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-3">
          {filteredReports.length === 0 ? (
            <div className="text-center py-16 bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg">
              <FileText className="w-12 h-12 text-[hsl(0,0%,20%)] mx-auto mb-4" />
              <p className="text-sm font-mono text-[hsl(0,0%,40%)]">No reports found</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className="group bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg p-5 hover:border-[hsl(45,90%,50%)]/20 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded bg-[hsl(0,0%,8%)] flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-[hsl(45,90%,50%)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-mono tracking-wider ${getCategoryColor(report.category)}`}>
                          {report.category}
                        </span>
                        {report.verified ? (
                          <span className="flex items-center gap-1 text-[9px] font-mono text-[hsl(142,76%,46%)]">
                            <ShieldCheck className="w-3 h-3" />
                            VERIFIED
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[9px] font-mono text-[hsl(45,90%,50%)]">
                            <Shield className="w-3 h-3" />
                            PENDING
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-mono text-[hsl(45,20%,95%)] mb-2 truncate">
                        {report.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-[hsl(0,0%,40%)]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {report.date}
                        </span>
                        <span>{report.size}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hash & Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(0,0%,3%)] rounded border border-[hsl(0,0%,10%)]">
                      <Hash className="w-3 h-3 text-[hsl(45,90%,50%)]" />
                      <code className="text-[10px] font-mono text-[hsl(0,0%,50%)]">
                        {report.hash.slice(0, 24)}...
                      </code>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-3 py-2 bg-[hsl(0,0%,8%)] border border-[hsl(0,0%,12%)] text-[hsl(0,0%,60%)] text-[10px] font-mono rounded hover:bg-[hsl(0,0%,10%)] hover:text-[hsl(45,20%,95%)] transition-colors">
                        <Download className="w-3 h-3" />
                        DOWNLOAD
                      </button>
                      <button className="p-2 bg-[hsl(0,0%,8%)] border border-[hsl(0,0%,12%)] text-[hsl(0,0%,60%)] rounded hover:bg-[hsl(0,0%,10%)] hover:text-[hsl(45,20%,95%)] transition-colors">
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="mt-8 p-4 bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-lg font-mono font-bold text-[hsl(45,90%,50%)]">
                  {REPORTS.length}
                </div>
                <div className="text-[9px] font-mono text-[hsl(0,0%,40%)] uppercase">
                  Total Reports
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-mono font-bold text-[hsl(142,76%,46%)]">
                  {REPORTS.filter(r => r.verified).length}
                </div>
                <div className="text-[9px] font-mono text-[hsl(0,0%,40%)] uppercase">
                  Verified
                </div>
              </div>
            </div>
            <div className="text-[10px] font-mono text-[hsl(0,0%,40%)]">
              All documents are signed with Ed25519 and hash-chained
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
