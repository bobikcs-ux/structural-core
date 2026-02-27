"use client"

/**
 * BOBIKCS SRI PROTOCOL v3.0 - Integrity Verifier Component
 * 
 * This component wraps all protected UI.
 * If systemState === UNTRUSTED → renders kill-switch overlay.
 * Children only render when data is available.
 */

import { usePulse } from "@/hooks/usePulse"
import { STATE_META, SystemState, getRiskCategory } from "@/lib/system-state"
import type { SRISnapshot } from "@/lib/types"
import { AlertTriangle, ShieldOff, Wifi, WifiOff, RefreshCw } from "lucide-react"

// ============================================================================
// Props
// ============================================================================

interface IntegrityVerifierProps {
  publicKeyBase64: string
  children: (snap: SRISnapshot, state: SystemState) => React.ReactNode
}

// ============================================================================
// Component
// ============================================================================

export function IntegrityVerifier({ publicKeyBase64, children }: IntegrityVerifierProps) {
  const { snapshot, frozenSnap, systemState, isConnecting, error, reconnect } = usePulse(publicKeyBase64)
  const meta = STATE_META[systemState]

  // ── UNTRUSTED STATE: Kill switch overlay ──────────────────────
  if (systemState === "UNTRUSTED") {
    return (
      <div 
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ backgroundColor: "rgba(127, 29, 29, 0.95)" }}
      >
        <div className="flex flex-col items-center gap-6 p-8">
          <ShieldOff className="h-16 w-16 text-red-400 animate-pulse" />
          
          <span className="text-4xl font-mono font-bold tracking-widest text-red-400">
            UNTRUSTED STATE
          </span>
          
          <span className="text-sm font-mono text-red-400/70 text-center max-w-md">
            INTEGRITY COMPROMISED — ALL METRICS FROZEN
          </span>
          
          {error && (
            <span className="text-xs font-mono text-red-400/50 text-center max-w-lg bg-red-950/50 px-4 py-2 rounded">
              {error}
            </span>
          )}
          
          <div className="flex flex-col items-center gap-2 mt-4 text-xs font-mono text-red-400/50">
            <span>Last verified: {frozenSnap?.calculated_at ?? "NONE"}</span>
            {frozenSnap && (
              <span>
                SRI Value: {frozenSnap.sri_value.toFixed(4)} ({getRiskCategory(frozenSnap.sri_value)})
              </span>
            )}
          </div>

          {/* Disabled state notice */}
          <div className="mt-8 px-4 py-2 border border-red-500/30 rounded bg-red-950/30">
            <span className="text-xs font-mono text-red-400/60">
              All interactions disabled until integrity is restored
            </span>
          </div>
        </div>
      </div>
    )
  }

  // ── OFFLINE STATE ─────────────────────────────────────────────
  if (systemState === "OFFLINE") {
    return (
      <div 
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ backgroundColor: meta.bgColor }}
      >
        <div className="flex flex-col items-center gap-6 p-8">
          <WifiOff className="h-12 w-12 text-gray-400" />
          
          <span className="text-2xl font-mono font-bold tracking-wider text-gray-400">
            CONNECTION LOST
          </span>
          
          <span className="text-sm font-mono text-gray-500 text-center max-w-md">
            Unable to reach integrity pulse stream
          </span>
          
          <button
            onClick={reconnect}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 
                       border border-gray-600 rounded font-mono text-sm text-gray-300
                       transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reconnect
          </button>
          
          {snapshot && (
            <div className="mt-6 text-xs font-mono text-gray-500">
              <span>Last known SRI: {snapshot.sri_value.toFixed(4)}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── INITIALIZING STATE ────────────────────────────────────────
  if (!snapshot) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ backgroundColor: meta.bgColor }}
      >
        <div className="flex flex-col items-center gap-4">
          {isConnecting ? (
            <>
              <Wifi className="h-8 w-8 text-gray-500 animate-pulse" />
              <span className="font-mono text-sm text-gray-500">
                {meta.label}...
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <span className="font-mono text-sm text-gray-500">
                Waiting for first snapshot...
              </span>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── LIVE / DEGRADED STATE: Render children ────────────────────
  return (
    <div 
      style={{ 
        "--state-color": meta.color,
        backgroundColor: meta.bgColor,
      } as React.CSSProperties}
      className="min-h-screen"
    >
      {/* State indicator banner for DEGRADED */}
      {systemState === "DEGRADED" && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-mono">
            <AlertTriangle className="h-4 w-4" />
            <span>DEGRADED: Data feed delayed — using last verified values</span>
          </div>
        </div>
      )}
      
      {children(snapshot, systemState)}
    </div>
  )
}
