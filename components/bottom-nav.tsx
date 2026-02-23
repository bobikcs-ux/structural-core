"use client"

const NAV_ITEMS = [
  { key: "dashboard", label: "CMD" },
  { key: "archive", label: "ARCHIVE" },
  { key: "scanner", label: "SCANNER" },
  { key: "simulation", label: "SIM_LAB" },
] as const

export type NavKey = (typeof NAV_ITEMS)[number]["key"]

interface BottomNavProps {
  active: NavKey
  onNavigate: (key: NavKey) => void
}

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="flex items-stretch border-t border-border bg-surface shrink-0"
      style={{ height: "32px" }}
      aria-label="Primary navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.key
        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`
              flex-1 flex items-center justify-center border-r border-border last:border-r-0
              text-[10px] tracking-[0.12em] uppercase font-medium transition-colors duration-75
              ${isActive
                ? "bg-gold text-background"
                : "bg-surface text-muted hover:bg-background hover:text-foreground"
              }
            `}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
