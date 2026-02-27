/**
 * BOBIKCS SRI PROTOCOL v3.0 - Snapshot API
 * 
 * GET: Returns latest snapshot OR generates new one if none exist
 * POST: Always generates a new snapshot
 */

import nacl from "tweetnacl"
import { createClient } from "@supabase/supabase-js"
import { encodeBase64 } from "tweetnacl-util"
import crypto from "crypto"

// Use Node.js runtime for crypto
export const runtime = "nodejs"

// ============================================================================
// Environment & Config
// ============================================================================

const FRED_API_KEY = process.env.FRED_API_KEY
const CORE_PRIVATE_KEY = process.env.CORE_PRIVATE_KEY
const SIGNING_KEY_ID = process.env.SIGNING_KEY_ID || "bobikcs-sri-v1"
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// ============================================================================
// Utility Functions
// ============================================================================

function hexToUint8Array(hex: string): Uint8Array {
  const cleanHex = (hex || "").replace(/^0x/, "")
  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.slice(i, i + 2), 16)
  }
  return bytes
}

function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex")
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}

// ============================================================================
// FRED Data Fetching
// ============================================================================

interface FredData {
  dgs10: number
  dgs2: number
  cpi: number
  fedfunds: number
  m2: number
}

async function fetchFredSeries(seriesId: string): Promise<number | null> {
  if (!FRED_API_KEY) return null
  
  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`
    const res = await fetch(url, { cache: "no-store" })
    
    if (!res.ok) return null
    
    const data = await res.json()
    if (data.observations?.[0]?.value) {
      const value = parseFloat(data.observations[0].value)
      return isNaN(value) ? null : value
    }
    return null
  } catch {
    return null
  }
}

async function fetchFredData(): Promise<FredData> {
  const [dgs10, dgs2, cpi, fedfunds, m2] = await Promise.all([
    fetchFredSeries("DGS10"),
    fetchFredSeries("DGS2"),
    fetchFredSeries("CPIAUCSL"),
    fetchFredSeries("FEDFUNDS"),
    fetchFredSeries("M2SL"),
  ])
  
  // Use fallbacks if FRED unavailable
  return {
    dgs10: dgs10 ?? 4.25,
    dgs2: dgs2 ?? 4.65,
    cpi: cpi ?? 314.5,
    fedfunds: fedfunds ?? 5.25,
    m2: m2 ?? 21000,
  }
}

// ============================================================================
// SRI Calculation
// ============================================================================

function calculateSRI(data: FredData) {
  const yieldSpread = data.dgs10 - data.dgs2
  const spreadScore = clamp(((yieldSpread + 2) / 5) * 100, 0, 100)
  
  const inflationRate = ((data.cpi - 300) / 300) * 100
  const inflationScore = clamp(100 - (inflationRate * 10), 0, 100)
  
  const rateDeviation = Math.abs(data.fedfunds - 3)
  const rateScore = clamp(100 - (rateDeviation * 20), 0, 100)
  
  const m2Growth = ((data.m2 - 20000) / 20000) * 100
  const liquidityScore = clamp(50 + m2Growth, 0, 100)
  
  const sri_value = (
    spreadScore * 0.35 +
    inflationScore * 0.25 +
    rateScore * 0.20 +
    liquidityScore * 0.20
  )
  
  return {
    sri_value: Math.round(sri_value * 10000) / 10000,
    spread_score: Math.round(spreadScore * 10000) / 10000,
    inflation_score: Math.round(inflationScore * 10000) / 10000,
    rate_score: Math.round(rateScore * 10000) / 10000,
    liquidity_score: Math.round(liquidityScore * 10000) / 10000,
  }
}

// ============================================================================
// Snapshot Generation
// ============================================================================

async function generateSnapshot(): Promise<Response> {
  const debugInfo: string[] = []
  
  try {
    debugInfo.push("Starting snapshot generation")
    
    // 1. Check environment
    if (!CORE_PRIVATE_KEY) {
      return Response.json({ 
        ok: false, 
        error: "CORE_PRIVATE_KEY not configured",
        debug: debugInfo 
      }, { status: 500 })
    }
    
    if (CORE_PRIVATE_KEY.length !== 128) {
      return Response.json({ 
        ok: false, 
        error: `CORE_PRIVATE_KEY wrong length: ${CORE_PRIVATE_KEY.length} (expected 128)`,
        debug: debugInfo 
      }, { status: 500 })
    }
    
    debugInfo.push("Environment OK")
    
    // 2. Fetch FRED data
    const fredData = await fetchFredData()
    debugInfo.push(`FRED data: DGS10=${fredData.dgs10}, DGS2=${fredData.dgs2}`)
    
    // 3. Calculate SRI
    const sri = calculateSRI(fredData)
    debugInfo.push(`SRI calculated: ${sri.sri_value}`)
    
    // 4. Connect to Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    // 5. Get previous hash
    const { data: lastSnap, error: fetchError } = await supabase
      .from("sri_snapshots")
      .select("integrity_hash")
      .order("calculated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (fetchError) {
      debugInfo.push(`Fetch last error: ${fetchError.message}`)
    }
    
    const prevHash = lastSnap?.integrity_hash || "GENESIS"
    debugInfo.push(`Prev hash: ${prevHash.slice(0, 16)}...`)
    
    // 6. Create timestamp (no milliseconds)
    const ts = new Date().toISOString().replace(/\.\d{3}Z$/, "Z")
    
    // 7. Build canonical string
    const canonical = [
      "1",
      ts,
      sri.sri_value.toFixed(4),
      sri.spread_score.toFixed(4),
      sri.inflation_score.toFixed(4),
      sri.rate_score.toFixed(4),
      sri.liquidity_score.toFixed(4),
      prevHash,
    ].join("|")
    
    debugInfo.push(`Canonical: ${canonical.slice(0, 50)}...`)
    
    // 8. Compute integrity hash
    const integrityHash = sha256Hex(canonical)
    debugInfo.push(`Hash: ${integrityHash.slice(0, 16)}...`)
    
    // 9. Sign with Ed25519
    const secretKey = hexToUint8Array(CORE_PRIVATE_KEY)
    const hashBytes = hexToUint8Array(integrityHash)
    const sigBytes = nacl.sign.detached(hashBytes, secretKey)
    const signature = encodeBase64(sigBytes)
    debugInfo.push(`Signature: ${signature.slice(0, 20)}...`)
    
    // 10. Verify before insert
    const pubKeyBytes = secretKey.slice(32)
    const isValid = nacl.sign.detached.verify(hashBytes, sigBytes, pubKeyBytes)
    
    if (!isValid) {
      return Response.json({ 
        ok: false, 
        error: "Signature verification failed before insert",
        debug: debugInfo 
      }, { status: 500 })
    }
    debugInfo.push("Signature verified OK")
    
    // 11. Hash FRED data
    const fredDataHash = sha256Hex(JSON.stringify(fredData))
    
    // 12. Insert to database
    const record = {
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
      public_key_id: SIGNING_KEY_ID,
      calculated_at: ts,
    }
    
    const { data: inserted, error: insertError } = await supabase
      .from("sri_snapshots")
      .insert(record)
      .select()
      .single()
    
    if (insertError) {
      return Response.json({ 
        ok: false, 
        error: `Database insert failed: ${insertError.message}`,
        code: insertError.code,
        debug: debugInfo 
      }, { status: 500 })
    }
    
    debugInfo.push("Insert successful")
    
    // 13. Success!
    return Response.json({
      ok: true,
      snapshot: inserted,
      sri: sri.sri_value,
      hash: integrityHash,
      timestamp: ts,
      fred_data: fredData,
      debug: debugInfo,
    })
    
  } catch (err) {
    debugInfo.push(`Exception: ${err instanceof Error ? err.message : String(err)}`)
    return Response.json({ 
      ok: false, 
      error: err instanceof Error ? err.message : "Unknown error",
      debug: debugInfo 
    }, { status: 500 })
  }
}

// ============================================================================
// Route Handlers
// ============================================================================

export async function GET(req: Request) {
  const url = new URL(req.url)
  const mode = url.searchParams.get("mode")
  
  // mode=read: Only return existing snapshot
  if (mode === "read") {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { data, error } = await supabase
      .from("sri_snapshots")
      .select("*")
      .order("calculated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (error || !data) {
      return Response.json({ 
        ok: false, 
        error: "No snapshots available",
        hint: "Call GET without mode=read to generate initial data"
      }, { status: 404 })
    }
    
    return Response.json({ ok: true, snapshot: data })
  }
  
  // Default: Generate new snapshot (allows initial data creation)
  return generateSnapshot()
}

export async function POST() {
  return generateSnapshot()
}
