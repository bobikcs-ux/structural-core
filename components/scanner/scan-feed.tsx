"use client"

import { useEffect, useState, useCallback } from "react"
import { fetchRecentScans, type RecentScan } from "@/app/actions/scanner"

function maskEmail(email: string): string {
  const [user, domain] = email.split("@")
  if (!user || !domain) return "***@***"
  const visible = user.slice(0, 2)
  return `${visible}***@${domain}`
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface ScanFeedProps {
  refreshKey: number
  limit?: number
  compact?: boolean
}

export function ScanFeed({ refreshKey, limit, compact = false }: ScanFeedProps) {
  const [scans, setScans] = useState<RecentScan[]>([])
  const [loading, setLoading] = useState(true)

  const loadScans = useCallback(async () => {
    setLoading(true)
    const result = await fetchRecentScans()
    if (result.success && result.data) {
      setScans(limit ? result.data.slice(0, limit) : result.data)
    }
    setLoading(false)
  }, [limit])

  useEffect(() => {
    loadScans()
  }, [loadScans, refreshKey])

  return (
    <div className={compact ? "" : "border border-terminal-line"}>
      {/* Module header - hidden in compact mode */}
      {!compact && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-terminal-line">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-gold" />
            <span className="font-mono text-xs tracking-widest text-gold">
              MODULE 04 // CATEGORY
            </span>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            LIVE FEED
          </span>
        </div>
      )}

      {/* Feed content */}
      <div className="px-4 py-3">
        {loading ? (
          <div className="flex items-center gap-2 py-4">
            <div className="h-1.5 w-1.5 bg-gold cursor-blink" />
            <span className="font-mono text-xs text-muted-foreground">
              FETCHING SCAN LOG...
            </span>
          </div>
        ) : scans.length === 0 ? (
          <div className="py-4">
            <span className="font-mono text-xs text-muted-foreground">
              NO SCAN RECORDS FOUND. INITIALIZE FIRST SCAN.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {scans.map((scan, i) => (
              <div
                key={scan.id}
                className="flex items-center justify-between gap-3 py-2.5 border-b border-terminal-line last:border-b-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs text-gold shrink-0">
                    [{String(i + 1).padStart(2, "0")}]
                  </span>
                  <span className="font-mono text-xs text-foreground truncate">
                    {maskEmail(scan.email)}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs text-gold">
                    {scan.integrity_score}%
                  </span>
                  <span className="font-mono text-xs text-muted-foreground hidden sm:inline truncate max-w-[140px]">
                    {scan.verdict_title}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {timeAgo(scan.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
