/**
 * BOBIKCS SRI PROTOCOL v3.0 - Snapshots History API
 * Returns the last N snapshots for dashboard hydration
 */

import { createClient } from "@supabase/supabase-js"

export const runtime = "edge"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const limitParam = url.searchParams.get("limit")
  const limit = Math.min(Math.max(parseInt(limitParam || "5", 10), 1), 50)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from("sri_snapshots")
    .select(`
      id,
      version,
      sri_value,
      spread_score,
      inflation_score,
      rate_score,
      liquidity_score,
      prev_hash,
      fred_data_hash,
      integrity_hash,
      signature,
      public_key_id,
      calculated_at
    `)
    .order("calculated_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Failed to fetch snapshots:", error)
    return Response.json({ error: "FETCH_FAILED" }, { status: 500 })
  }

  return Response.json({
    snapshots: data || [],
    count: data?.length || 0,
  })
}
