/**
 * BOBIKCS SRI PROTOCOL v3.0 - Cryptographic Utilities
 * 
 * This module provides Ed25519 digital signature functionality using tweetnacl.
 * Used for signing and verifying structural integrity data in the prediction market system.
 * 
 * Key Management:
 * - CORE_PRIVATE_KEY: 128 hex chars (64 bytes) tweetnacl secretKey (server-side only)
 * - CORE_PUBLIC_KEY: Base64-encoded 32-byte Ed25519 public key (also in signing_keys table)
 * - SIGNING_KEY_ID: Identifier for the current signing key version, e.g. "BOBIKCS-SRI-2026-V1"
 */

import nacl from "tweetnacl"
import { encodeBase64, decodeBase64 } from "tweetnacl-util"

// ============================================================================
// Types
// ============================================================================

export interface SnapshotData {
  version: number
  calculated_at: string    // ISO 8601, no milliseconds, Z suffix
  sri_value: number        // 0-1
  spread_score: number     // 0-1
  inflation_score: number  // 0-1
  rate_score: number       // 0-1
  liquidity_score: number  // 0-1
  prev_hash: string        // hex or "GENESIS"
}

export interface SignedSnapshot extends SnapshotData {
  integrity_hash: string   // SHA-256 lowercase hex
  signature: string        // Base64-encoded Ed25519 signature
  public_key_id: string    // FK to signing_keys.key_id
  fred_data_hash: string   // payload_hash from fred_raw_data
}

export interface VerificationResult {
  valid: boolean
  error?: string
  verified_at: string
}

// ============================================================================
// Hex / Base64 Conversion Utilities
// ============================================================================

/**
 * Converts a hex string to Uint8Array
 */
export function hexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string length")
  }
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return bytes
}

/**
 * Converts Uint8Array to lowercase hex string
 */
export function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}

// ============================================================================
// Timestamp Utilities
// ============================================================================

/**
 * Creates an ISO 8601 timestamp without milliseconds, with Z suffix
 * Format: "2026-02-25T08:00:00Z"
 */
export function createCanonicalTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z")
}

// ============================================================================
// Key Loading Utilities
// ============================================================================

/**
 * Loads the private key from environment variables (server-side only)
 * Expects CORE_PRIVATE_KEY as 128 hex characters (64 bytes)
 * @throws Error if CORE_PRIVATE_KEY is not set or invalid
 */
export function loadPrivateKey(): Uint8Array {
  const privateKeyHex = process.env.CORE_PRIVATE_KEY
  
  if (!privateKeyHex) {
    throw new Error("CORE_PRIVATE_KEY environment variable is not set")
  }
  
  if (privateKeyHex.length !== 128) {
    throw new Error(
      `Invalid CORE_PRIVATE_KEY length: expected 128 hex chars, got ${privateKeyHex.length}`
    )
  }
  
  try {
    const privateKey = hexToUint8Array(privateKeyHex)
    
    if (privateKey.length !== nacl.sign.secretKeyLength) {
      throw new Error(
        `Invalid private key byte length: expected ${nacl.sign.secretKeyLength} bytes, got ${privateKey.length}`
      )
    }
    
    return privateKey
  } catch (error) {
    throw new Error(`Failed to decode private key: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Loads the public key from environment variables
 * Expects CORE_PUBLIC_KEY as base64 (44 chars, 32 bytes)
 * @throws Error if CORE_PUBLIC_KEY is not set or invalid
 */
export function loadPublicKey(): Uint8Array {
  const publicKeyBase64 = process.env.CORE_PUBLIC_KEY
  
  if (!publicKeyBase64) {
    throw new Error("CORE_PUBLIC_KEY environment variable is not set")
  }
  
  try {
    const publicKey = decodeBase64(publicKeyBase64)
    
    if (publicKey.length !== nacl.sign.publicKeyLength) {
      throw new Error(
        `Invalid public key length: expected ${nacl.sign.publicKeyLength} bytes, got ${publicKey.length}`
      )
    }
    
    return publicKey
  } catch (error) {
    throw new Error(`Failed to decode public key: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Gets the current signing key ID from environment
 */
export function getSigningKeyId(): string {
  const keyId = process.env.SIGNING_KEY_ID
  if (!keyId) {
    throw new Error("SIGNING_KEY_ID environment variable is not set")
  }
  return keyId
}

// ============================================================================
// Canonical String Format (IMMUTABLE - per spec)
// ============================================================================

/**
 * Builds the canonical string for hashing/signing
 * Format: "{version}|{ts}|{sri}|{spread}|{inflation}|{rate}|{liquidity}|{prev_hash}"
 * 
 * Rules from spec:
 * - version: String(integer), e.g. "1" (NEVER "1.0")
 * - ts: ISO 8601 UTC, no milliseconds, 'Z' suffix
 * - All scores: Number.toFixed(4), e.g. "0.7234"
 * - prev_hash: hex string or "GENESIS"
 */
export function buildCanonicalString(data: SnapshotData): string {
  const parts = [
    String(data.version),
    data.calculated_at,
    data.sri_value.toFixed(4),
    data.spread_score.toFixed(4),
    data.inflation_score.toFixed(4),
    data.rate_score.toFixed(4),
    data.liquidity_score.toFixed(4),
    data.prev_hash,
  ]
  return parts.join("|")
}

// ============================================================================
// Integrity Hash Functions (SHA-256)
// ============================================================================

/**
 * Computes SHA-256 hash of a string
 * Returns lowercase hex string
 */
export async function computeSHA256(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  return uint8ArrayToHex(new Uint8Array(hashBuffer))
}

/**
 * Alias for computeSHA256 - used in Edge runtime
 */
export async function sha256Hex(input: string): Promise<string> {
  return computeSHA256(input)
}

/**
 * Clamps a value between min and max
 * Used for SRI score normalization
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}

/**
 * Computes the integrity hash for a snapshot
 * integrity_hash = SHA-256(canonical_string) → lowercase hex
 */
export async function computeIntegrityHash(data: SnapshotData): Promise<string> {
  const canonicalString = buildCanonicalString(data)
  return computeSHA256(canonicalString)
}

/**
 * Computes SHA-256 hash of a raw JSON payload (for fred_raw_data.payload_hash)
 */
export async function computePayloadHash(payload: unknown): Promise<string> {
  const jsonString = JSON.stringify(payload)
  return computeSHA256(jsonString)
}

// ============================================================================
// Signing Functions (Server-side only)
// ============================================================================

/**
 * Signs a snapshot using Ed25519
 * 
 * Process:
 * 1. Build canonical string from snapshot data
 * 2. Compute integrity_hash = SHA-256(canonical_string)
 * 3. Sign the hash bytes with nacl.sign.detached
 * 4. Return base64-encoded signature
 * 
 * @param data - Snapshot data to sign
 * @returns SignedSnapshot with integrity_hash and signature
 */
export async function signSnapshot(
  data: SnapshotData,
  fredDataHash: string
): Promise<SignedSnapshot> {
  const privateKey = loadPrivateKey()
  const keyId = getSigningKeyId()
  
  // Compute integrity hash
  const integrityHash = await computeIntegrityHash(data)
  
  // Sign the hash bytes (32 bytes from hex)
  const hashBytes = hexToUint8Array(integrityHash)
  const signatureBytes = nacl.sign.detached(hashBytes, privateKey)
  const signature = encodeBase64(signatureBytes)
  
  return {
    ...data,
    integrity_hash: integrityHash,
    signature,
    public_key_id: keyId,
    fred_data_hash: fredDataHash,
  }
}

/**
 * Signs raw hash bytes using Ed25519
 * @param hashHex - 64-character lowercase hex hash
 * @returns Base64-encoded signature
 */
export function signHashBytes(hashHex: string): string {
  const privateKey = loadPrivateKey()
  const hashBytes = hexToUint8Array(hashHex)
  const signatureBytes = nacl.sign.detached(hashBytes, privateKey)
  return encodeBase64(signatureBytes)
}

// ============================================================================
// Verification Functions (Can be used client or server side)
// ============================================================================

/**
 * Verifies a signed snapshot
 * 
 * Process:
 * 1. Rebuild canonical string from snapshot data
 * 2. Recompute integrity_hash
 * 3. Verify hash matches
 * 4. Verify signature using public key
 * 
 * @param snapshot - The signed snapshot to verify
 * @param publicKeyBase64 - Optional public key (defaults to env)
 * @returns VerificationResult
 */
export async function verifySnapshot(
  snapshot: SignedSnapshot,
  publicKeyBase64?: string
): Promise<VerificationResult> {
  const verifiedAt = createCanonicalTimestamp()
  
  try {
    // Get public key
    let publicKey: Uint8Array
    if (publicKeyBase64) {
      publicKey = decodeBase64(publicKeyBase64)
    } else {
      publicKey = loadPublicKey()
    }
    
    // Rebuild and verify integrity hash
    const expectedHash = await computeIntegrityHash(snapshot)
    if (expectedHash !== snapshot.integrity_hash) {
      return {
        valid: false,
        error: `Integrity hash mismatch: expected ${expectedHash}, got ${snapshot.integrity_hash}`,
        verified_at: verifiedAt,
      }
    }
    
    // Verify signature
    const hashBytes = hexToUint8Array(snapshot.integrity_hash)
    const signatureBytes = decodeBase64(snapshot.signature)
    
    if (signatureBytes.length !== nacl.sign.signatureLength) {
      return {
        valid: false,
        error: `Invalid signature length: expected ${nacl.sign.signatureLength} bytes, got ${signatureBytes.length}`,
        verified_at: verifiedAt,
      }
    }
    
    const isValid = nacl.sign.detached.verify(hashBytes, signatureBytes, publicKey)
    
    return {
      valid: isValid,
      error: isValid ? undefined : "Signature verification failed",
      verified_at: verifiedAt,
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown verification error",
      verified_at: verifiedAt,
    }
  }
}

/**
 * Verifies a signature against a hash
 * 
 * @param hashHex - The integrity hash (64-char lowercase hex)
 * @param signatureBase64 - Base64-encoded signature
 * @param publicKeyBase64 - Optional public key (defaults to env)
 * @returns boolean indicating validity
 */
export function verifySignature(
  hashHex: string,
  signatureBase64: string,
  publicKeyBase64?: string
): boolean {
  try {
    let publicKey: Uint8Array
    if (publicKeyBase64) {
      publicKey = decodeBase64(publicKeyBase64)
    } else {
      publicKey = loadPublicKey()
    }
    
    const hashBytes = hexToUint8Array(hashHex)
    const signatureBytes = decodeBase64(signatureBase64)
    
    return nacl.sign.detached.verify(hashBytes, signatureBytes, publicKey)
  } catch {
    return false
  }
}

// ============================================================================
// Key Generation Utilities (Development/Setup only)
// ============================================================================

/**
 * Generates a new Ed25519 keypair
 * Use this for initial setup or key rotation
 * 
 * @returns Object with keys in the format expected by the spec:
 *   - privateKeyHex: 128 hex chars (64 bytes) for CORE_PRIVATE_KEY
 *   - publicKeyBase64: 44 base64 chars (32 bytes) for CORE_PUBLIC_KEY
 */
export function generateKeyPair(): { 
  privateKeyHex: string
  publicKeyBase64: string 
} {
  const keyPair = nacl.sign.keyPair()
  
  return {
    privateKeyHex: uint8ArrayToHex(keyPair.secretKey),
    publicKeyBase64: encodeBase64(keyPair.publicKey),
  }
}

// ============================================================================
// Re-exports for convenience
// ============================================================================

export { encodeBase64, decodeBase64 }

/**
 * Alias for decodeBase64 - used in spec examples
 */
export const base64ToUint8Array = decodeBase64
