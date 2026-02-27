"use client"

/**
 * Institutional Navbar - Black/Gold Minimal Design
 * Navigation for all main routes in the Structural Core system
 */

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Activity, 
  Shield, 
  FlaskConical, 
  FileText, 
  Terminal, 
  KeyRound,
  Menu,
  X
} from "lucide-react"
import { useState } from "react"

// ============================================================================
// Navigation Items
// ============================================================================

const navItems = [
  { href: "/", label: "POSITIONING", icon: Home },
  { href: "/intelligence", label: "INTELLIGENCE", icon: Activity },
  { href: "/scanner", label: "SCANNER", icon: Shield },
  { href: "/simulations", label: "SIMULATIONS", icon: FlaskConical },
  { href: "/reports", label: "REPORTS", icon: FileText },
  { href: "/console", label: "CONSOLE", icon: Terminal },
  { href: "/access", label: "CLEARANCE", icon: KeyRound },
]

// ============================================================================
// Navbar Component
// ============================================================================

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[hsl(0,0%,2%)]/95 backdrop-blur-sm border-b border-[hsl(0,0%,12%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 group"
          >
            <div className="w-8 h-8 rounded bg-[hsl(45,90%,50%)] flex items-center justify-center">
              <span className="text-[hsl(0,0%,2%)] font-mono font-bold text-sm">SC</span>
            </div>
            <span className="hidden sm:block text-[11px] font-mono tracking-[0.2em] text-[hsl(0,0%,60%)] group-hover:text-[hsl(45,90%,50%)] transition-colors">
              STRUCTURAL CORE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded transition-all duration-200
                    text-[10px] font-mono tracking-wider
                    ${isActive 
                      ? "bg-[hsl(45,90%,50%)]/10 text-[hsl(45,90%,50%)] border border-[hsl(45,90%,50%)]/20" 
                      : "text-[hsl(0,0%,50%)] hover:text-[hsl(45,20%,95%)] hover:bg-[hsl(0,0%,8%)]"
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(142,76%,46%)] animate-pulse" />
              <span className="text-[9px] font-mono tracking-wider text-[hsl(0,0%,50%)]">
                LIVE
              </span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[hsl(0,0%,50%)] hover:text-[hsl(45,20%,95%)] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[hsl(0,0%,12%)]">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded transition-all duration-200
                      text-[11px] font-mono tracking-wider
                      ${isActive 
                        ? "bg-[hsl(45,90%,50%)]/10 text-[hsl(45,90%,50%)]" 
                        : "text-[hsl(0,0%,50%)] hover:text-[hsl(45,20%,95%)] hover:bg-[hsl(0,0%,8%)]"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
