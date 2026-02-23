"use client"

import { useMemo, useState } from "react"
import { generateTransactions } from "@/lib/data"
import type { Transaction } from "@/lib/data"

function statusStyle(s: Transaction["status"]) {
  switch (s) {
    case "CONFIRMED": return "text-[#4a7a3a]"
    case "PENDING": return "text-gold"
    case "REJECTED": return "text-[#8b2020]"
  }
}

export function ArchivePanel() {
  const allTx = useMemo(() => generateTransactions(120), [])
  const [filter, setFilter] = useState<"ALL" | Transaction["status"]>("ALL")

  const filtered = filter === "ALL" ? allTx : allTx.filter((t) => t.status === filter)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-border bg-surface shrink-0">
        <span className="text-[9px] text-muted tracking-wider uppercase">
          LEDGER ARCHIVE // {filtered.length} RECORDS
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

      {/* Dense table */}
      <div className="flex-1 overflow-y-auto">
        <table>
          <thead className="sticky top-0 z-10">
            <tr>
              <th>TX HASH</th>
              <th>TIMESTAMP</th>
              <th>TYPE</th>
              <th>ENTITY</th>
              <th className="text-right">AMOUNT</th>
              <th>STATUS</th>
              <th>GOV TS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx, i) => (
              <tr
                key={tx.hash + i}
                className="hover:bg-surface-raised transition-colors duration-75"
              >
                <td className="text-gold tabular-nums">{tx.hash}</td>
                <td className="text-muted tabular-nums">{tx.timestamp}</td>
                <td className="text-foreground">{tx.type}</td>
                <td className="text-foreground">{tx.entity}</td>
                <td className="text-right text-foreground tabular-nums">{tx.amount}</td>
                <td className={`font-semibold ${statusStyle(tx.status)}`}>{tx.status}</td>
                <td className="text-muted tabular-nums">{tx.governanceTs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
