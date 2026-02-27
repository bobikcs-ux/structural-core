"use client"

/**
 * BOBIKCS SRI PROTOCOL v3.0 - SSE Pulse Hook
 * 
 * Real-time subscription to SRI snapshots with automatic verification.
 * Manages system state transitions and persists last verified snapshot.
 */

import { useEffect, useRef, useState, useCallback } from "react"
import { verifySnapshot } from "@/lib/verify-snapshot"
import {
  saveVerifiedSnapshot,
  loadVerifiedSnapshot,
  SystemState,
} from "@/lib/system-state"
import type { SRISnapshot } from "@/lib/types"

// ============================================================================
// Hook Return Type
// ============================================================================

export interface UsePulseReturn {
  /** Current verified snapshot (null if none yet) */
  snapshot: SRISnapshot | null
  /** Frozen snapshot when in UNTRUSTED state */
  frozenSnap: SRISnapshot | null
  /** Current system state */
  systemState: SystemState
  /** Whether the hook is currently connecting */
  isConnecting: boolean
  /** Error message if any */
  error: string | null
  /** Manually reconnect to SSE */
  reconnect: () => void
}

// ============================================================================
// Constants
// ============================================================================

const HEARTBEAT_TIMEOUT_MS = 2000  // 2s without heartbeat = DEGRADED
const RECONNECT_DELAY_MS = 5000   // 5s delay before reconnect
const SYSTEM_STATE_COOKIE = "bobikcs_system_state"

// ============================================================================
// Cookie Helper (for middleware kill-switch)
// ============================================================================

function setSystemStateCookie(state: SystemState): void {
  if (typeof document === "undefined") return
  // Set cookie with 1 hour expiry, accessible to middleware
  document.cookie = `${SYSTEM_STATE_COOKIE}=${state}; path=/; max-age=3600; SameSite=Strict`
}

function clearSystemStateCookie(): void {
  if (typeof document === "undefined") return
  document.cookie = `${SYSTEM_STATE_COOKIE}=; path=/; max-age=0`
}

// ============================================================================
// Main Hook
// ============================================================================

export function usePulse(publicKeyBase64: string): UsePulseReturn {
  const [snapshot, setSnapshot] = useState<SRISnapshot | null>(() =>
    loadVerifiedSnapshot()
  )
  const [systemState, setSystemState] = useState<SystemState>("INITIALIZING")
  const [frozenSnap, setFrozenSnap] = useState<SRISnapshot | null>(null)
  const [isConnecting, setIsConnecting] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const lastHeartbeat = useRef<number>(Date.now())
  const prevState = useRef<SystemState>("INITIALIZING")
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ── Handle new snapshot from SSE ──────────────────────────────
  const onNewSnap = useCallback(
    async (snap: SRISnapshot) => {
      lastHeartbeat.current = Date.now()
      setError(null)

      const result = await verifySnapshot(snap, publicKeyBase64)

      // ≤16ms gate — process in next animation frame for UI smoothness
      requestAnimationFrame(() => {
        if (!result.ok) {
          // Verification failed — freeze at last known good state
          const frozen = loadVerifiedSnapshot()
          setFrozenSnap(frozen)
          prevState.current = systemState
          setSystemState("UNTRUSTED")
          setSystemStateCookie("UNTRUSTED") // Set cookie for middleware kill-switch
          setError(`Verification failed: ${result.reason}${result.detail ? ` - ${result.detail}` : ""}`)
        } else {
          // Verification succeeded
          saveVerifiedSnapshot(snap)
          setSnapshot(snap)
          setFrozenSnap(null)
          
          const wasUntrusted = prevState.current === "UNTRUSTED"
          prevState.current = "LIVE"
          setSystemState("LIVE")
          clearSystemStateCookie() // Clear UNTRUSTED cookie on successful verification
          
          if (wasUntrusted) {
            // Integrity restored - caller can detect via state change
          }
        }
      })
    },
    [publicKeyBase64, systemState]
  )

  // ── Connect to SSE ────────────────────────────────────────────
  const connect = useCallback(() => {
    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    setIsConnecting(true)
    setError(null)

    const es = new EventSource("/api/v1/pulse")
    eventSourceRef.current = es

    es.onopen = () => {
      setIsConnecting(false)
      lastHeartbeat.current = Date.now()
    }

    es.onmessage = (e) => {
      try {
        // Skip empty or heartbeat messages
        if (!e.data || e.data === "" || e.data === "ping") {
          lastHeartbeat.current = Date.now()
          return
        }
        
        const snap: SRISnapshot = JSON.parse(e.data)
        
        // Guard: ensure snap is a valid object with required fields
        if (!snap || typeof snap !== "object" || !snap.integrity_hash) {
          lastHeartbeat.current = Date.now() // Still update heartbeat
          return
        }
        
        onNewSnap(snap)
      } catch (err) {
        // Don't set error for parse failures on heartbeats
        if (e.data && e.data !== "ping") {
          setError(`Failed to parse snapshot: ${err instanceof Error ? err.message : String(err)}`)
        }
      }
    }

    es.onerror = () => {
      setSystemState("OFFLINE")
      setIsConnecting(false)
      es.close()
      
      // Schedule reconnect
      reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY_MS)
    }
  }, [onNewSnap])

  // ── Manual reconnect function ─────────────────────────────────
  const reconnect = useCallback(() => {
    connect()
  }, [connect])

  // ── Initialize connection and heartbeat monitor ───────────────
  useEffect(() => {
    connect()

    // DEGRADED detection: heartbeat delay > 2s
    const hbCheck = setInterval(() => {
      const delay = Date.now() - lastHeartbeat.current
      if (delay > HEARTBEAT_TIMEOUT_MS && systemState === "LIVE") {
        setSystemState("DEGRADED")
      }
    }, 1000)

    return () => {
      eventSourceRef.current?.close()
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      clearInterval(hbCheck)
    }
  }, [connect, systemState])

  return {
    snapshot,
    frozenSnap,
    systemState,
    isConnecting,
    error,
    reconnect,
  }
}
