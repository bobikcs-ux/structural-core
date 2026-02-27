"use client"

/**
 * BOBIKCS SRI PROTOCOL v3.0 - Integrity Verifier Component
 * 
 * This component wraps all protected UI.
 * If systemState === UNTRUSTED → renders kill-switch overlay.
 * Children only render when data is available.
 */

import { useState } from "react"
import { usePulse } from "@/hooks/usePulse"
import { STATE_META, SystemState, getRiskCategory } from "@/lib/system-state"
import type { SRISnapshot } from "@/lib/types"
import { AlertTriangle, ShieldOff, Wifi, WifiOff, RefreshCw, Zap, Loader2 } from "lucide-react"

// ============================================================================
// Generate Data Button Component
// ============================================================================

function GenerateDataButton({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch("/api/v1/snapshot", { method: "POST" })
      const data = await res.json()
      
      if (data.ok) {
        setSuccess(true)
        setTimeout(() => onSuccess(), 1000)
      } else {
        setError(data.error || "Generation failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error")
    } finally {
      setLoading(false)
    }
  }
  
  if (success) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/30 border border-emerald-500/30 rounded">
        <Zap className="h-4 w-4 text-emerald-400" />
        <span className="font-mono text-sm text-emerald-400">Data generated! Reconnecting...</span>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col items-center gap-3 mt-4">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-[hsl(43,25%,55%)] text-[hsl(0,0%,2%)] 
                   font-mono text-sm font-semibold rounded hover:bg-[hsl(43,25%,45%)] 
                   transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Zap className="h-4 w-4" />
        )}
        {loading ? "GENERATING..." : "GENERATE INITIAL DATA"}
      </button>
      
      {error && (
        <div className="px-4 py-2 bg-red-900/20 border border-red-500/30 rounded max-w-sm">
          <span className="font-mono text-xs text-red-400">{error}</span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Props
// ============================================================================

interface IntegrityVerifierProps {
  publicKeyBase64: string
  children: (snap: SRISnapshot, state: SystemState, history: SRISnapshot[]) => React.ReactNode
}

// ============================================================================
// Component
// ============================================================================

export function IntegrityVerifier({ publicKeyBase64, children }: IntegrityVerifierProps) {
  // Safely handle potentially missing public key
  const safePublicKey = (publicKeyBase64 || "").replace(/\\n/g, "").replace(/\n/g, "").trim()
  
  const { snapshot, history, frozenSnap, systemState, isConnecting, error, reconnect } = usePulse(safePublicKey)
  const meta = STATE_META[systemState] || STATE_META.INITIALIZING

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

  // ── OFFLINE STATE: Show content with subtle indicator ─────────
  // Instead of blocking overlay, just show the content with a reconnecting indicator

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
              <AlertTriangle className="h-8 w-8 text-[hsl(43,25%,55%)]" />
              <span className="font-mono text-sm text-gray-400">
                No snapshots available
              </span>
              <span className="font-mono text-xs text-gray-500 text-center max-w-sm">
                The database is empty. Generate initial data to activate the system.
              </span>
              <GenerateDataButton onSuccess={reconnect} />
            </>
          )}
        </div>
      </div>
    )
  }

  // ── LIVE / DEGRADED / OFFLINE STATE: Render children ──────────
  // Wrap children render in try-catch to prevent full component crash
  let renderedChildren: React.ReactNode = null
  try {
    renderedChildren = children(snapshot, systemState, history)
  } catch (renderError) {
    renderedChildren = (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(0,0%,2%)]">
        <div className="text-center p-8">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="font-mono text-sm text-gray-400">
            Render error: {renderError instanceof Error ? renderError.message : "Unknown error"}
          </p>
        </div>
      </div>
    )
  }

  // Connection status indicator (quiet, in corner)
  const ConnectionIndicator = () => {
    if (systemState === "LIVE") {
      return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-[#0F0F0F]/80 border border-[#1F1F1F] rounded-full backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-gray-400">LIVE</span>
        </div>
      )
    }
    if (systemState === "OFFLINE") {
      return (
        <button
          onClick={reconnect}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-[#0F0F0F]/80 border border-red-500/30 rounded-full backdrop-blur-sm hover:border-red-500/50 transition-colors"
        >
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-[10px] font-mono text-red-400">SYNCING...</span>
        </button>
      )
    }
    if (systemState === "DEGRADED") {
      return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-[#0F0F0F]/80 border border-amber-500/30 rounded-full backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[10px] font-mono text-amber-400">DELAYED</span>
        </div>
      )
    }
    return null
  }
  
  return (
    <div 
      style={{ 
        "--state-color": meta.color,
        backgroundColor: meta.bgColor,
      } as React.CSSProperties}
      className="min-h-screen"
    >
      <ConnectionIndicator />
      {renderedChildren}
    </div>
  )
}
