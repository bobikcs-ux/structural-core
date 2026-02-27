/**
 * BOBIKCS SRI PROTOCOL v3.0 - Pulse API (SSE Stream)
 * 
 * Real-time Server-Sent Events stream for SRI updates.
 * 
 * Features:
 * - Sends latest snapshot immediately on connection
 * - Streams new snapshots via Supabase Realtime
 * - Per-IP rate limiting: 10 requests/minute
 * 
 * Usage:
 *   const eventSource = new EventSource('/api/v1/pulse')
 *   eventSource.onmessage = (e) => console.log(JSON.parse(e.data))
 */

import { createClient } from "@supabase/supabase-js"

export const runtime = "edge"

// Simple in-memory rate limiter (per edge instance)
const RATE_LIMIT = new Map<string, { count: number; reset: number }>()
const MAX_REQUESTS = 10
const WINDOW_MS = 60_000 // 1 minute

/**
 * Normalizes snapshot timestamps to canonical format (no milliseconds)
 */
function normalizeSnapshot(row: Record<string, unknown>) {
  return {
    ...row,
    calculated_at: row.calculated_at
      ? new Date(row.calculated_at as string)
          .toISOString()
          .replace(/\.\d{3}Z$/, "Z")
      : undefined,
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

      // ── Send latest snapshot immediately ────────────────────────
      const { data: snap } = await supabase
        .from("global_state_snapshots")
        .select("*")
        .order("calculated_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (snap) {
        send({
          type: "snapshot",
          data: normalizeSnapshot(snap),
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
            send({
              type: "snapshot",
              data: normalizeSnapshot(payload.new as Record<string, unknown>),
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

  // ── Return SSE Response ─────────────────────────────────────────
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  })
}
