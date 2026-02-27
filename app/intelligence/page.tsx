"use client"

/**
 * Intelligence Dashboard - SRI Index Display
 * Real-time feed using usePulse hook with Ed25519 verification
 */

import { usePulse } from "@/hooks/usePulse"
import { DashboardPanel } from "@/components/DashboardPanel"
import { IntegrityVerifier } from "@/components/IntegrityVerifier"
import { Activity, AlertTriangle, Loader2 } from "lucide-react"

// Public key from environment (exposed to client)
const PUBLIC_KEY = process.env.NEXT_PUBLIC_BOBIKCS_PUBLIC_KEY_BASE64 || ""

export default function IntelligencePage() {
  const { snapshot, frozenSnap, systemState, isConnecting, error, reconnect } = usePulse(PUBLIC_KEY)

  // Loading state
  if (isConnecting && !snapshot) {
    return (
      <div className="min-h-screen bg-[hsl(0,0%,2%)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[hsl(45,90%,50%)] animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-[hsl(0,0%,50%)]">
            ESTABLISHING SECURE CONNECTION...
          </p>
        </div>
      </div>
    )
  }

  // No data yet
  if (!snapshot && !frozenSnap) {
    return (
      <div className="min-h-screen bg-[hsl(0,0%,2%)] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <Activity className="w-12 h-12 text-[hsl(45,90%,50%)]/50 mx-auto mb-4" />
          <h2 className="text-lg font-mono text-[hsl(45,20%,95%)] mb-2">
            AWAITING DATA FEED
          </h2>
          <p className="text-xs font-mono text-[hsl(0,0%,50%)] mb-6">
            No verified snapshots available. The system may be initializing or the SSE connection is pending.
          </p>
          {error && (
            <div className="p-4 bg-[hsl(0,72%,51%)]/10 border border-[hsl(0,72%,51%)]/20 rounded mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[hsl(0,72%,51%)] flex-shrink-0 mt-0.5" />
                <p className="text-xs font-mono text-[hsl(0,72%,51%)]">{error}</p>
              </div>
            </div>
          )}
          <button
            onClick={reconnect}
            className="px-4 py-2 bg-[hsl(45,90%,50%)] text-[hsl(0,0%,2%)] font-mono text-sm rounded hover:bg-[hsl(45,90%,55%)] transition-colors"
          >
            RETRY CONNECTION
          </button>
        </div>
      </div>
    )
  }

  const displaySnapshot = frozenSnap || snapshot!

  return (
    <IntegrityVerifier systemState={systemState} onReconnect={reconnect}>
      <DashboardPanel
        snapshot={displaySnapshot}
        systemState={systemState}
        history={[]}
      />
    </IntegrityVerifier>
  )
}
