import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="text-sm font-semibold tracking-[0.08em] uppercase text-foreground">
              BOBIKCS
            </div>
            <p className="text-xs text-muted mt-2 max-w-sm leading-relaxed">
              Sovereign infrastructure layer for institutional structural risk monitoring,
              deterministic intelligence, and governance integrity verification.
            </p>
          </div>
          <div>
            <div className="text-[10px] text-muted tracking-wider uppercase mb-3">Platform</div>
            <div className="flex flex-col gap-2">
              <Link href="/intelligence" className="text-xs text-muted hover:text-foreground transition-colors">Intelligence</Link>
              <Link href="/simulations" className="text-xs text-muted hover:text-foreground transition-colors">Simulations</Link>
              <Link href="/reports" className="text-xs text-muted hover:text-foreground transition-colors">Reports</Link>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted tracking-wider uppercase mb-3">Access</div>
            <div className="flex flex-col gap-2">
              <Link href="/clearance" className="text-xs text-muted hover:text-foreground transition-colors">Request Clearance</Link>
              <Link href="/app" className="text-xs text-muted hover:text-foreground transition-colors">Console</Link>
              <a href="mailto:bobikcs@studio-bobikcs.com" className="text-xs text-muted hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-[10px] text-muted tracking-wider uppercase">
            BOBIKCS &copy; 2026 -- Sovereign Infrastructure Layer
          </span>
          <a
            href="https://bobikcs.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted hover:text-gold tracking-wider transition-colors"
          >
            bobikcs.com
          </a>
        </div>
      </div>
    </footer>
  )
}
