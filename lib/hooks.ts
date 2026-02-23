"use client"

import { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

// ── Realtime: append-only subscription for structural_events ──
export function useRealtimeEvents(initialLimit = 30) {
  const [events, setEvents] = useState<Record<string, string>[]>([])
  const initialLoaded = useRef(false)

  useEffect(() => {
    // Load initial batch
    async function loadInitial() {
      const { data } = await supabase
        .from("structural_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(initialLimit)
      if (data) {
        setEvents(data.reverse())
        initialLoaded.current = true
      }
    }
    loadInitial()

    // Subscribe to new inserts
    const channel = supabase
      .channel("structural-events-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "structural_events" },
        (payload) => {
          setEvents((prev) => [...prev.slice(-200), payload.new as Record<string, string>])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [initialLimit])

  return { events, isLoading: !initialLoaded.current }
}

// ── Dashboard: latest snapshot ──
export function useLatestSnapshot() {
  return useSWR("latest-snapshot", async () => {
    const { data, error } = await supabase
      .from("global_index_snapshots")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
    if (error) throw error
    return data
  }, { refreshInterval: 5000 })
}

// ── Dashboard: recent events for activity log ──
export function useRecentEvents(limit = 12) {
  return useSWR(`recent-events-${limit}`, async () => {
    const { data, error } = await supabase
      .from("structural_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data ?? []).reverse()
  }, { refreshInterval: 3000 })
}

// ── Archive: intel audit log ──
export function useAuditLog(filter: string) {
  return useSWR(`audit-log-${filter}`, async () => {
    let query = supabase
      .from("intel_audit_log")
      .select("*")
      .order("gov_timestamp", { ascending: false })
      .limit(200)

    if (filter !== "ALL") {
      query = query.eq("status", filter)
    }
    const { data, error } = await query
    if (error) throw error
    return data ?? []
  })
}

// ── Scanner: structural events (full log) ──
export function useStructuralEvents(limit = 100) {
  return useSWR(`structural-events-${limit}`, async () => {
    const { data, error } = await supabase
      .from("structural_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data ?? []).reverse()
  }, { refreshInterval: 3000 })
}

// ── Simulation: run RPC ──
export async function runStructuralSnapshot(params: {
  shockMagnitude: number
  epochs: number
  correlationFactor: number
  liquidityFloor: number
  reserveRatio: number
}) {
  const { data, error } = await supabase.rpc("run_structural_snapshot", {
    p_shock_magnitude: params.shockMagnitude,
    p_epochs: params.epochs,
    p_correlation_factor: params.correlationFactor,
    p_liquidity_floor: params.liquidityFloor,
    p_reserve_ratio: params.reserveRatio,
  })
  if (error) throw error
  return data as {
    id: string
    verdict: string
    survival_rate: number
    max_drawdown: number
    recovery_epochs: number
    curve: number[]
  }
}

// ── Simulation: past runs ──
export function useSimulationRuns() {
  return useSWR("sim-runs", async () => {
    const { data, error } = await supabase
      .from("structural_index_snapshot_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
    if (error) throw error
    return data ?? []
  })
}

// ── Connection health ──
export function useConnectionHealth() {
  return useSWR("connection-health", async () => {
    const start = performance.now()
    const { error } = await supabase
      .from("global_index_snapshots")
      .select("id")
      .limit(1)
    const latency = Math.round(performance.now() - start)
    return { connected: !error, latency, lastUpdate: Date.now() }
  }, { refreshInterval: 5000 })
}
