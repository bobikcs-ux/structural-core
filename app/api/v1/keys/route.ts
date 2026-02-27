/**
 * BOBIKCS SRI PROTOCOL v3.0 - Public Keys API
 * 
 * Returns all active (non-retired) signing keys for client-side verification.
 * 
 * Response format:
 * [
 *   {
 *     "key_id": "BOBIKCS-SRI-2026-V1",
 *     "algorithm": "Ed25519",
 *     "public_key": "base64-encoded-32-bytes",
 *     "is_active": true
 *   }
 * ]
 * 
 * Security:
 * - Only returns public keys (never private)
 * - Only returns non-retired keys
 * - Cached for 1 hour (keys change rarely)
 */

import { createClient } from "@supabase/supabase-js"

export const runtime = "edge"

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from("signing_keys")
    .select("key_id, algorithm, public_key_base64, is_active")
    .is("retired_at", null)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to fetch signing keys:", error)
    return Response.json(
      { error: "Failed to fetch signing keys" },
      { status: 500 }
    )
  }

  // Transform to public format
  const keys = (data ?? []).map((k) => ({
    key_id: k.key_id,
    algorithm: k.algorithm,
    public_key: k.public_key_base64,
    is_active: k.is_active,
  }))

  return Response.json(keys, {
    headers: {
      // Cache for 1 hour - keys change rarely
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
