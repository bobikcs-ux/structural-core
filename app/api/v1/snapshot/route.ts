/**
 * BOBIKCS SRI PROTOCOL v3.0 - Snapshot API
 * 
 * Cron-triggered endpoint that:
 * 1. Fetches fresh FRED data
 * 2. Calculates SRI
 * 3. Signs the snapshot with Ed25519
 * 4. Stores in Supabase with hash chain integrity
 * 
 * Schedule: Every 24 hours via Vercel Cron
 * Security: Protected by CRON_SECRET header
 */

import nacl from "tweetnacl"
import { createClient } from "@supabase/supabase-js"
import { fetchFredData } from "@/lib/fred-fetch"
import { calculateSRI } from "@/lib/sri-engine"
import {
  hexToUint8Array,
  uint8ArrayToHex,
  sha256Hex,
} from "@/lib/crypto-utils"
import { encodeBase64 } from "tweetnacl-util"

export const runtime = "edge"

// Shared handler for both GET (cron) and POST (manual trigger)
async function handleSnapshotCreation() {

  // ── Initialize Supabase client ──────────────────────────────────
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // ── STEP 1: Fetch FRED data ─────────────────────────────────────
  let fredData
  try {
    fredData = await fetchFredData(process.env.FRED_API_KEY!)
  } catch (e) {
    // FRED fetch failure → DEGRADED state, no snapshot created
    await supabase.from("system_status_log").insert({
      status: "DEGRADED",
      reason: String(e),
      recorded_at: new Date().toISOString(),
    })
    return new Response("FRED_FETCH_FAILED — STATE: DEGRADED", { status: 503 })
  }

  // ── STEP 2: Hash raw payload before parsing ─────────────────────
  const rawPayloadStr = JSON.stringify(fredData)
  const fredDataHash = await sha256Hex(rawPayloadStr)

  // ── STEP 3: Store raw FRED data ─────────────────────────────────
  await supabase.from("fred_raw_data").insert({
    ...fredData,
    payload_hash: fredDataHash,
    fetched_at: new Date().toISOString(),
  })

  // ── STEP 4: Calculate SRI ───────────────────────────────────────
  const sri = calculateSRI(fredData)

  // ── STEP 5: Get prev_hash for hash chain ────────────────────────
  const { data: lastSnap } = await supabase
    .from("global_state_snapshots")
    .select("integrity_hash")
    .order("calculated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const prevHash = lastSnap?.integrity_hash ?? "GENESIS"

  // ── STEP 6: Build canonical string ──────────────────────────────
  const now = new Date()
  const ts = now.toISOString().replace(/\.\d{3}Z$/, "Z")
  // Format: "2026-02-25T08:00:00Z"

  const canonical = [
    "1",                           // version
    ts,                            // timestamp
    sri.sri_value.toFixed(4),
    sri.spread_score.toFixed(4),
    sri.inflation_score.toFixed(4),
    sri.rate_score.toFixed(4),
    sri.liquidity_score.toFixed(4),
    prevHash,
  ].join("|")

  // ── STEP 7: Compute integrity_hash = SHA-256(canonical) ─────────
  const integrityHash = await sha256Hex(canonical)

  // ── STEP 8: Sign with Ed25519 (tweetnacl) ───────────────────────
  const secretKey = hexToUint8Array(process.env.CORE_PRIVATE_KEY!)
  const hashBytes = hexToUint8Array(integrityHash)
  const sigBytes = nacl.sign.detached(hashBytes, secretKey)
  const signature = encodeBase64(sigBytes)

  // ── STEP 9: Verify locally BEFORE insert ────────────────────────
  // Extract public key from secret key (last 32 bytes of 64-byte secretKey)
  const pubKeyBytes = secretKey.slice(32)
  const isValid = nacl.sign.detached.verify(hashBytes, sigBytes, pubKeyBytes)

  if (!isValid) {
    console.error("PRE_INSERT_VERIFICATION_FAILED — snapshot REJECTED")
    return new Response("SIGNATURE_VERIFICATION_FAILED", { status: 500 })
  }

  // ── STEP 10: Atomic insert to database ──────────────────────────
  const { error } = await supabase.from("global_state_snapshots").insert({
    version: 1,
    sri_value: sri.sri_value,
    spread_score: sri.spread_score,
    inflation_score: sri.inflation_score,
    rate_score: sri.rate_score,
    liquidity_score: sri.liquidity_score,
    prev_hash: prevHash,
    fred_data_hash: fredDataHash,
    integrity_hash: integrityHash,
    signature: signature,
    public_key_id: process.env.SIGNING_KEY_ID!,
    calculated_at: now.toISOString(),
  })

  if (error) {
    console.error("INSERT_FAILED", error)
    return new Response("INSERT_FAILED", { status: 500 })
  }

  // ── SUCCESS ─────────────────────────────────────────────────────
  return Response.json({
    ok: true,
    sri: sri.sri_value,
    hash: integrityHash,
    timestamp: ts,
  })
}

// ── GET: Dual-mode (cron with secret OR browser read) ───────────────
export async function GET(req: Request) {
  const cronSecret = req.headers.get("x-cron-secret")
  const url = new URL(req.url)
  const mode = url.searchParams.get("mode")
  
  // If CRON_SECRET header is present, run the full snapshot creation
  if (cronSecret === process.env.CRON_SECRET) {
    return handleSnapshotCreation()
  }
  
  // If mode=trigger and secret matches, also run creation
  if (mode === "trigger") {
    const secret = url.searchParams.get("secret")
    if (secret === process.env.ADMIN_SECRET || secret === process.env.CRON_SECRET) {
      return handleSnapshotCreation()
    }
    return new Response("UNAUTHORIZED", { status: 401 })
  }
  
  // Otherwise, return the latest snapshot (public read)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data, error } = await supabase
    .from("global_state_snapshots")
    .select("*")
    .order("calculated_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  
  if (error || !data) {
    return Response.json({ ok: false, error: "No snapshots available" }, { status: 404 })
  }
  
  return Response.json({
    ok: true,
    snapshot: data,
  })
}

// ── POST: Manual trigger from console (requires ADMIN_SECRET) ──────
export async function POST(req: Request) {
  // Allow authorization via header or body
  const authHeader = req.headers.get("x-admin-secret")
  let bodySecret: string | null = null
  
  try {
    const body = await req.json().catch(() => ({}))
    bodySecret = body?.adminSecret || null
  } catch {
    // No body provided
  }
  
  const adminSecret = process.env.ADMIN_SECRET || process.env.CRON_SECRET
  const providedSecret = authHeader || bodySecret
  
  if (providedSecret !== adminSecret) {
    return new Response("UNAUTHORIZED", { status: 401 })
  }
  
  return handleSnapshotCreation()
}
