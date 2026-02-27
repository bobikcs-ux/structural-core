/**
 * BOBIKCS SRI PROTOCOL v3.0 - Client Verification Pipeline
 * 
 * THREE-STEP PIPELINE. Each step is a hard gate.
 * Any failure → immediate UNTRUSTED (no silent fallback).
 * 
 * Step 1: Reconstruct canonical string
 * Step 2: SHA-256 → compare with stored integrity_hash
 * Step 3: Ed25519 verify (tweetnacl)
 */

import nacl from "tweetnacl"
import {
  hexToUint8Array,
  sha256Hex,
  decodeBase64,
} from "./crypto-utils"
import type { SRISnapshot } from "./types"

// ============================================================================
// Verification Result Types
// ============================================================================

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "HASH_MISMATCH" | "SIGNATURE_INVALID" | "EXCEPTION"; detail?: string }

// ============================================================================
// Main Verification Function
// ============================================================================

/**
 * Verifies an SRI snapshot using the 3-step pipeline
 * 
 * @param snap - The snapshot to verify
 * @param publicKeyBase64 - Base64-encoded 32-byte Ed25519 public key
 * @returns VerifyResult indicating success or failure reason
 */
export async function verifySnapshot(
  snap: SRISnapshot | null | undefined,
  publicKeyBase64: string
): Promise<VerifyResult> {
  try {
    // ── GUARD: Check for null/undefined snapshot ───────────────
    if (!snap) {
      return { ok: false, reason: "EXCEPTION", detail: "Snapshot is null or undefined" }
    }
    
    // ── GUARD: Check for required fields ───────────────────────
    if (typeof snap.calculated_at !== "string" || 
        typeof snap.integrity_hash !== "string" ||
        typeof snap.signature !== "string") {
      return { ok: false, reason: "EXCEPTION", detail: "Missing required snapshot fields" }
    }
    
    // ── STEP 1: Reconstruct canonical string ───────────────────
    // Safety: strip ms even if API accidentally returns them
    const ts = (snap.calculated_at || "").replace(/\.\d{3}Z$/, "Z")

    const canonical = [
      String(snap.version ?? 1),         // "1" ← integer, NEVER "1.0"
      ts,                                // "2026-02-25T08:00:00Z"
      Number(snap.sri_value || 0).toFixed(4),
      Number(snap.spread_score || 0).toFixed(4),
      Number(snap.inflation_score || 0).toFixed(4),
      Number(snap.rate_score || 0).toFixed(4),
      Number(snap.liquidity_score || 0).toFixed(4),
      String(snap.prev_hash || "GENESIS"),  // hex or "GENESIS"
    ].join("|")

    // ── STEP 2: SHA-256 → compare with stored integrity_hash ───
    const computedHashHex = await sha256Hex(canonical)

    if (computedHashHex !== snap.integrity_hash) {
      return { 
        ok: false, 
        reason: "HASH_MISMATCH",
        detail: `Expected ${snap.integrity_hash}, computed ${computedHashHex}`
      }
      // Do NOT proceed to Step 3 — hash is already wrong
    }

    // ── STEP 3: Ed25519 verify (tweetnacl) ─────────────────────
    const isValid = nacl.sign.detached.verify(
      hexToUint8Array(snap.integrity_hash),   // 32-byte message
      decodeBase64(snap.signature),           // 64-byte signature
      decodeBase64(publicKeyBase64)           // 32-byte raw public key
    )

    if (!isValid) {
      return { ok: false, reason: "SIGNATURE_INVALID" }
    }

    return { ok: true }

  } catch (e) {
    return { 
      ok: false, 
      reason: "EXCEPTION", 
      detail: e instanceof Error ? e.message : String(e) 
    }
  }
}
