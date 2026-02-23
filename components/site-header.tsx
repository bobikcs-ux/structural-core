"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

const NAV_LINKS = [
  { href: "/intelligence", label: "Intelligence" },
  { href: "/simulations", label: "Simulations" },
  { href: "/reports", label: "Reports" },
  { href: "/clearance", label: "Clearance" },
  { href: "/app", label: "Console" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-sm" style={{ backgroundColor: "rgba(0,0,0,0.95)" }}>
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 h-14">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-[0.08em] uppercase text-foreground">
            BOBIKCS
          </span>
          <span className="hidden sm:inline text-xs text-muted tracking-wider uppercase">
            Structural Risk Infrastructure
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  text-xs tracking-wider uppercase px-3 py-1.5 transition-colors
                  ${isActive
                    ? "text-gold"
                    : "text-muted hover:text-foreground"
                  }
                `}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1 p-2"
          aria-label="Toggle menu"
        >
          <span className={`block w-4 h-px bg-foreground transition-transform ${menuOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
          <span className={`block w-4 h-px bg-foreground transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-4 h-px bg-foreground transition-transform ${menuOpen ? "-rotate-45 -translate-y-[3px]" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          className="md:hidden border-t border-border"
          style={{ backgroundColor: "#000000", color: "#EAEAEA" }}
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => {
                setMenuOpen(false)
                router.push(link.href)
              }}
              className={`
                block w-full text-left text-xs tracking-wider uppercase px-6 py-3 border-b border-white/10 transition-colors
                ${pathname === link.href ? "text-gold" : "text-[#EAEAEA] hover:text-foreground"}
              `}
              style={{ backgroundColor: pathname === link.href ? "rgba(255,255,255,0.05)" : "#000000" }}
            >
              {link.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}
