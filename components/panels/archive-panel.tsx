"use client"

import { useState } from "react"
import { useAuditLog } from "@/lib/hooks"

function statusStyle(s: string) {
  switch (s) {
    case "CONFIRMED": return "text-[#4a7a3a]"
    case "PENDING": return "text-gold"
    case "REJECTED": return "text-[#8b2020]"
    default: return "text-foreground"
  }
}

export function ArchivePanel() {
  const [filter, setFilter] = useState<string>("ALL")
  const { data: records, error, isLoading } = useAuditLog(filter)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-border bg-surface shrink-0">
        <span className="text-[9px] text-muted tracking-wider uppercase">
          LEDGER ARCHIVE // {isLoading ? "SYNCING" : `${records?.length ?? 0} RECORDS`} // SUPABASE
        </span>
        <div className="flex items-center gap-1">
          {(["ALL", "CONFIRMED", "PENDING", "REJECTED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                text-[9px] px-2 py-0.5 border border-border tracking-wider uppercase
                ${filter === f
                  ? "bg-gold text-background"
                  : "bg-surface text-muted hover:text-foreground hover:bg-background"
                }
              `}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] text-[#8b2020] tracking-wider uppercase">CRITICAL: LINK SEVERED // ARCHIVE UNAVAILABLE</span>
        </div>
      ) : isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] text-muted tracking-wider uppercase animate-pulse">SYNCING // FETCHING ARCHIVE...</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <table>
            <thead className="sticky top-0 z-10">
              <tr>
                <th>TX HASH</th>
                <th>GOV TIMESTAMP</th>
                <th>ENTITY</th>
                <th>ACTION</th>
                <th className="text-right">AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {(records ?? []).map((tx: Record<string, string | number>) => (
                <tr key={tx.id as string} className="hover:bg-surface-raised">
                  <td className="text-gold tabular-nums">{tx.tx_hash as string}</td>
                  <td className="text-muted tabular-nums">
                    {new Date(tx.gov_timestamp as string).toISOString().replace("T", " ").slice(0, 19)}
                  </td>
                  <td className="text-foreground">{tx.entity as string}</td>
                  <td className="text-foreground">{tx.action as string}</td>
                  <td className="text-right text-foreground tabular-nums">
                    {Number(tx.amount) > 0 ? Number(tx.amount).toLocaleString() : "---"}
                  </td>
                  <td className={`font-semibold ${statusStyle(tx.status as string)}`}>{tx.status as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
