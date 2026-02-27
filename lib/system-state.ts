/**
 * BOBIKCS SRI PROTOCOL v3.0 - Global State Machine
 * 
 * System states:
 * - INITIALIZING: No snapshot received yet
 * - LIVE: Verified, fresh data
 * - DEGRADED: FRED fetch failed (server signals this)
 * - OFFLINE: SSE connection lost
 * - UNTRUSTED: Signature or hash verification failed
 */

import type { SRISnapshot } from "./types"

// ============================================================================
// System State Types
// ============================================================================

export type SystemState =
  | "INITIALIZING"  // No snapshot received yet
  | "LIVE"          // Verified, fresh data
  | "DEGRADED"      // FRED fetch failed (server signals this)
  | "OFFLINE"       // SSE connection lost
  | "UNTRUSTED"     // Signature or hash verification failed

export interface StateMeta {
  color: string
  label: string
  bgColor: string
}

export const STATE_META: Record<SystemState, StateMeta> = {
  INITIALIZING: { color: "#6B7280", label: "INITIALIZING", bgColor: "#111827" },
  LIVE:         { color: "#10B981", label: "LIVE",         bgColor: "#111827" },
  DEGRADED:     { color: "#F59E0B", label: "DEGRADED",     bgColor: "#1C1A11" },
  OFFLINE:      { color: "#6B7280", label: "OFFLINE",      bgColor: "#111827" },
  UNTRUSTED:    { color: "#DC2626", label: "UNTRUSTED",    bgColor: "#1C0A0A" },
}

// ============================================================================
// Session Storage Persistence
// ============================================================================

const SESSION_KEY = "bobikcs_last_verified_snapshot"

/**
 * Saves a verified snapshot to sessionStorage
 * This preserves the last-known-good state across page refreshes
 */
export function saveVerifiedSnapshot(snap: SRISnapshot): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(snap))
  } catch {
    // Silently fail if sessionStorage is not available
  }
}

/**
 * Loads the last verified snapshot from sessionStorage
 * Returns null if no snapshot exists or parsing fails
 */
export function loadVerifiedSnapshot(): SRISnapshot | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Clears the stored verified snapshot
 */
export function clearVerifiedSnapshot(): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Silently fail
  }
}

// ============================================================================
// Risk Category Helper
// ============================================================================

/**
 * Returns a risk category label based on SRI value
 * 
 * @param sri - SRI value between 0 and 1
 * @returns Risk category string
 */
export function getRiskCategory(sri: number): string {
  if (sri < 0.25) return "LOW RISK"
  if (sri < 0.50) return "MODERATE"
  if (sri < 0.75) return "ELEVATED"
  return "CRITICAL"
}

/**
 * Returns risk color based on SRI value
 */
export function getRiskColor(sri: number): string {
  if (sri < 0.25) return "#10B981"  // green
  if (sri < 0.50) return "#F59E0B"  // amber
  if (sri < 0.75) return "#F97316"  // orange
  return "#DC2626"                   // red
}

// ============================================================================
// State Transition Helpers
// ============================================================================

/**
 * Determines if a state transition is valid
 * Some transitions are not allowed (e.g., UNTRUSTED -> LIVE without re-verification)
 */
export function isValidTransition(from: SystemState, to: SystemState): boolean {
  // From UNTRUSTED, can only go to LIVE (after successful verification)
  if (from === "UNTRUSTED" && to !== "LIVE" && to !== "OFFLINE") {
    return false
  }
  return true
}

/**
 * Returns the CSS classes for a given system state
 */
export function getStateClasses(state: SystemState): string {
  const meta = STATE_META[state]
  const baseClasses = "font-mono text-xs px-2 py-1 rounded"
  
  switch (state) {
    case "LIVE":
      return `${baseClasses} bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`
    case "DEGRADED":
      return `${baseClasses} bg-amber-500/10 text-amber-400 border border-amber-500/20`
    case "OFFLINE":
      return `${baseClasses} bg-gray-500/10 text-gray-400 border border-gray-500/20`
    case "UNTRUSTED":
      return `${baseClasses} bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse`
    default:
      return `${baseClasses} bg-gray-500/10 text-gray-400 border border-gray-500/20`
  }
}
