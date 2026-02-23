"use client"

import { useCallback } from "react"

const NAV_ITEMS = [
  { id: "section-01", number: "01", label: "MIRROR" },
  { id: "section-02", number: "02", label: "VAULT" },
  { id: "section-03", number: "03", label: "DRIFT" },
  { id: "section-04", number: "04", label: "CATEGORY" },
  { id: "section-05", number: "05", label: "LICENSE" },
  { id: "section-06", number: "06", label: "INTEL" },
]

export function Navigation({
  activeSection,
}: {
  activeSection: string | null
}) {
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  return (
    <nav aria-label="Module navigation" className="flex flex-col gap-1">
      <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground/40 uppercase mb-3 px-3">
        Modules
      </div>
      {NAV_ITEMS.map((item) => {
        const isActive = activeSection === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollTo(item.id)}
            className={`flex items-center gap-3 px-3 py-2 text-left transition-all duration-300 border-l-2 ${
              isActive
                ? "border-[#C9A66B] bg-[#C9A66B]/5"
                : "border-transparent hover:border-[#C9A66B]/30 hover:bg-[#C9A66B]/[0.02]"
            }`}
          >
            <span
              className={`font-mono text-[10px] tracking-widest transition-colors duration-300 ${
                isActive ? "text-[#C9A66B]" : "text-muted-foreground/40"
              }`}
            >
              {item.number}
            </span>
            <span
              className={`font-mono text-[11px] tracking-wider transition-colors duration-300 ${
                isActive ? "text-foreground" : "text-muted-foreground/60"
              }`}
            >
              {item.label}
            </span>
          </button>
        )
      })}

      {/* System info at bottom */}
      <div className="mt-auto pt-6 px-3 flex flex-col gap-2 border-t border-[#C9A66B]/10">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] tracking-widest text-muted-foreground/30 uppercase">
            Protocol
          </span>
          <span className="font-mono text-[9px] text-[#C9A66B]/50">
            ACTIVE
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] tracking-widest text-muted-foreground/30 uppercase">
            Encryption
          </span>
          <span className="font-mono text-[9px] text-[#C9A66B]/50">
            AES-256
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] tracking-widest text-muted-foreground/30 uppercase">
            Clearance
          </span>
          <span className="font-mono text-[9px] text-[#C9A66B]/50">
            LEVEL 4
          </span>
        </div>
      </div>
    </nav>
  )
}
