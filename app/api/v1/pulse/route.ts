/**
 * BOBIKCS SRI PROTOCOL v3.0 - Pulse API (SSE Stream)
 * 
 * Real-time Server-Sent Events stream for SRI updates.
 * 
 * Features:
 * - Sends latest snapshot immediately on connection
 * - Streams new snapshots via Supabase Realtime
 * - Per-IP rate limiting: 10 requests/minute
 * - Cached data strategy with 2026 benchmark fallbacks
 * - 2-second timeout with automatic fallback
 * 
 * Usage:
 *   const eventSource = new EventSource('/api/v1/pulse')
 *   eventSource.onmessage = (e) => console.log(JSON.parse(e.data))
 */

import { createClient } from "@supabase/supabase-js"

export const runtime = "edge"

// ============================================================================
// 2026 BENCHMARK CONSTANTS (Layer 1 Baseline Truth)
// ============================================================================
const BENCHMARK_2026 = {
  FED_FUNDS: 3.64,
  CPI_INFLATION: 2.9,
  YIELD_SPREAD: 0.59,
  M2_GROWTH: 0.8,
} as const

// Cache configuration
const CACHE_TTL_MS = 3600_000 // 1 hour stale-while-revalidate
const FETCH_TIMEOUT_MS = 2000 // 2 second timeout

// In-memory cache for snapshots
let cachedSnapshot: { data: Record<string, unknown> | null; timestamp: number; source: "live" | "fallback" } = {
  data: null,
  timestamp: 0,
  source: "live",
}

// Simple in-memory rate limiter (per edge instance)
const RATE_LIMIT = new Map<string, { count: number; reset: number }>()
const MAX_REQUESTS = 10
const WINDOW_MS = 60_000 // 1 minute

/**
 * Normalizes snapshot timestamps to canonical format (no milliseconds)
 */
function normalizeSnapshot(row: Record<string, unknown>, source: "live" | "fallback" = "live") {
  return {
    ...row,
    calculated_at: row.calculated_at
      ? new Date(row.calculated_at as string)
          .toISOString()
          .replace(/\.\d{3}Z$/, "Z")
      : undefined,
    _source: source, // Indicates data provenance
  }
}

/**
 * Generates a fallback snapshot from 2026 benchmark constants
 */
function generateFallbackSnapshot(): Record<string, unknown> {
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z")
  
  // Calculate SRI components from benchmarks (normalized 0-1)
  const spreadScore = Math.min(1, Math.max(0, BENCHMARK_2026.YIELD_SPREAD / 2)) // Spread normalized
  const inflationScore = Math.min(1, Math.max(0, BENCHMARK_2026.CPI_INFLATION / 10)) // Inflation normalized
  const rateScore = Math.min(1, Math.max(0, BENCHMARK_2026.FED_FUNDS / 8)) // Rate normalized
  const liquidityScore = Math.min(1, Math.max(0, (BENCHMARK_2026.M2_GROWTH + 5) / 15)) // Liquidity normalized
  
  // SRI weighted formula: 0.35*spread + 0.25*inflation + 0.20*rate + 0.20*liquidity
  const sriValue = (
    0.35 * spreadScore +
    0.25 * inflationScore +
    0.20 * rateScore +
    0.20 * liquidityScore
  )
  
  return {
    id: `fallback-${Date.now()}`,
    version: 1,
    sri_value: sriValue,
    spread_score: spreadScore,
    inflation_score: inflationScore,
    rate_score: rateScore,
    liquidity_score: liquidityScore,
    prev_hash: "BENCHMARK_FALLBACK",
    fred_data_hash: "BENCHMARK_2026",
    integrity_hash: "FALLBACK_MODE",
    signature: "BENCHMARK_UNSIGNED",
    public_key_id: "BENCHMARK-2026",
    calculated_at: now,
    _benchmarks: BENCHMARK_2026,
  }
}

/**
 * Fetches snapshot with timeout and fallback using Promise.race
 */
async function fetchSnapshotWithTimeout(
  supabase: ReturnType<typeof createClient>
): Promise<{ data: Record<string, unknown> | null; source: "live" | "fallback" }> {
  try {
    // Use Promise.race for timeout since Supabase doesn't support abortSignal
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), FETCH_TIMEOUT_MS)
    )
    
    const queryPromise = supabase
      .from("global_state_snapshots")
      .select("*")
      .order("calculated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    
    const { data: snap } = await Promise.race([queryPromise, timeoutPromise]) as { data: Record<string, unknown> | null }
    
    if (snap) {
      // Update cache with live data
      cachedSnapshot = { data: snap, timestamp: Date.now(), source: "live" }
      return { data: snap, source: "live" }
    }
    
    // No data in DB, return fallback
    return { data: generateFallbackSnapshot(), source: "fallback" }
  } catch {
    // On timeout or error, check cache first, then fallback
    const cacheAge = Date.now() - cachedSnapshot.timestamp
    if (cachedSnapshot.data && cacheAge < CACHE_TTL_MS) {
      return { data: cachedSnapshot.data, source: cachedSnapshot.source }
    }
    
    // Return benchmark fallback
    return { data: generateFallbackSnapshot(), source: "fallback" }
  }
}

export async function GET(req: Request) {
  // ── Rate Limiting ───────────────────────────────────────────────
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown"
  const now = Date.now()
  const rl = RATE_LIMIT.get(ip)

  if (rl && now < rl.reset) {
    if (rl.count >= MAX_REQUESTS) {
      return new Response("RATE_LIMIT_EXCEEDED", { 
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.reset - now) / 1000)),
        },
      })
    }
    rl.count++
  } else {
    RATE_LIMIT.set(ip, { count: 1, reset: now + WINDOW_MS })
  }

  // ── Initialize Supabase client ──────────────────────────────────
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // ── Create SSE Stream ───────────────────────────────────────────
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          // Stream may be closed, ignore
        }
      }

      // Send keepalive comment every 30 seconds to prevent timeout
      const keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"))
        } catch {
          clearInterval(keepalive)
        }
      }, 30_000)

      // ── Send latest snapshot immediately (with timeout/fallback) ──
      const { data: snap, source } = await fetchSnapshotWithTimeout(supabase)

      if (snap) {
        send({
          type: "snapshot",
          data: normalizeSnapshot(snap, source),
        })
      } else {
        send({
          type: "status",
          message: "No snapshots available yet",
        })
      }

      // ── Subscribe to new inserts via Supabase Realtime ──────────
      const channel = supabase
        .channel("snapshots-sse")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "global_state_snapshots",
          },
          (payload) => {
            // Update cache with new live data
            cachedSnapshot = { 
              data: payload.new as Record<string, unknown>, 
              timestamp: Date.now(), 
              source: "live" 
            }
            send({
              type: "snapshot",
              data: normalizeSnapshot(payload.new as Record<string, unknown>, "live"),
            })
          }
        )
        .subscribe()

      // Cleanup on stream close
      req.signal.addEventListener("abort", () => {
        clearInterval(keepalive)
        channel.unsubscribe()
      })
    },
  })

  // ── Return SSE Response with stale-while-revalidate ─────────────
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=3600",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  })
}
