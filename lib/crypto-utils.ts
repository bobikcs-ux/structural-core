/**
 * BOBIKCS SRI PROTOCOL v3.0 - Cryptographic Utilities
 * 
 * This module provides Ed25519 digital signature functionality using tweetnacl.
 * Used for signing and verifying structural integrity data in the prediction market system.
 * 
 * Key Management:
 * - CORE_PRIVATE_KEY: Base64-encoded 64-byte Ed25519 secret key (server-side only)
 * - NEXT_PUBLIC_BOBIKCS_PUBLIC_KEY_BASE64: Base64-encoded 32-byte Ed25519 public key (client-safe)
 * - SIGNING_KEY_ID: Identifier for the current signing key version
 */

import nacl from "tweetnacl"
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from "tweetnacl-util"

// ============================================================================
// Types
// ============================================================================

export interface SignedPayload<T = unknown> {
  payload: T
  signature: string      // Base64-encoded Ed25519 signature
  signed_at: string      // ISO 8601 timestamp
  key_id: string         // Signing key identifier for key rotation support
}

export interface VerificationResult {
  valid: boolean
  payload: unknown | null
  error?: string
  verified_at: string
}

export interface IntegrityHash {
  hash: string           // SHA-256 hash in hex format
  algorithm: "sha256"
  computed_at: string
}

// ============================================================================
// Key Loading Utilities
// ============================================================================

/**
 * Loads the private key from environment variables (server-side only)
 * @throws Error if CORE_PRIVATE_KEY is not set or invalid
 */
export function loadPrivateKey(): Uint8Array {
  const privateKeyBase64 = process.env.CORE_PRIVATE_KEY
  
  if (!privateKeyBase64) {
    throw new Error("CORE_PRIVATE_KEY environment variable is not set")
  }
  
  try {
    const privateKey = decodeBase64(privateKeyBase64)
    
    if (privateKey.length !== nacl.sign.secretKeyLength) {
      throw new Error(
        `Invalid private key length: expected ${nacl.sign.secretKeyLength} bytes, got ${privateKey.length}`
      )
    }
    
    return privateKey
  } catch (error) {
    throw new Error(`Failed to decode private key: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Loads the public key from environment variables (client-safe)
 * @throws Error if NEXT_PUBLIC_BOBIKCS_PUBLIC_KEY_BASE64 is not set or invalid
 */
export function loadPublicKey(): Uint8Array {
  const publicKeyBase64 = process.env.NEXT_PUBLIC_BOBIKCS_PUBLIC_KEY_BASE64
  
  if (!publicKeyBase64) {
    throw new Error("NEXT_PUBLIC_BOBIKCS_PUBLIC_KEY_BASE64 environment variable is not set")
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
  return process.env.SIGNING_KEY_ID || "bobikcs-sri-v1"
}

// ============================================================================
// Signing Functions (Server-side only)
// ============================================================================

/**
 * Signs a payload using Ed25519
 * This function should only be used on the server side
 * 
 * @param payload - The data to sign (will be JSON stringified)
 * @returns SignedPayload with base64-encoded signature
 */
export function signPayload<T>(payload: T): SignedPayload<T> {
  const privateKey = loadPrivateKey()
  const keyId = getSigningKeyId()
  const signedAt = new Date().toISOString()
  
  // Create canonical message: payload + timestamp + key_id
  const message = JSON.stringify({
    payload,
    signed_at: signedAt,
    key_id: keyId,
  })
  
  const messageBytes = decodeUTF8(message)
  const signature = nacl.sign.detached(messageBytes, privateKey)
  
  return {
    payload,
    signature: encodeBase64(signature),
    signed_at: signedAt,
    key_id: keyId,
  }
}

/**
 * Signs raw bytes using Ed25519
 * Useful for signing binary data or pre-serialized content
 * 
 * @param data - Raw bytes to sign
 * @returns Base64-encoded signature
 */
export function signBytes(data: Uint8Array): string {
  const privateKey = loadPrivateKey()
  const signature = nacl.sign.detached(data, privateKey)
  return encodeBase64(signature)
}

// ============================================================================
// Verification Functions (Can be used client or server side)
// ============================================================================

/**
 * Verifies a signed payload using Ed25519
 * 
 * @param signedPayload - The signed payload to verify
 * @returns VerificationResult with validity status
 */
export function verifySignedPayload<T>(signedPayload: SignedPayload<T>): VerificationResult {
  const verifiedAt = new Date().toISOString()
  
  try {
    const publicKey = loadPublicKey()
    
    // Reconstruct the canonical message
    const message = JSON.stringify({
      payload: signedPayload.payload,
      signed_at: signedPayload.signed_at,
      key_id: signedPayload.key_id,
    })
    
    const messageBytes = decodeUTF8(message)
    const signatureBytes = decodeBase64(signedPayload.signature)
    
    if (signatureBytes.length !== nacl.sign.signatureLength) {
      return {
        valid: false,
        payload: null,
        error: `Invalid signature length: expected ${nacl.sign.signatureLength} bytes, got ${signatureBytes.length}`,
        verified_at: verifiedAt,
      }
    }
    
    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey)
    
    return {
      valid: isValid,
      payload: isValid ? signedPayload.payload : null,
      error: isValid ? undefined : "Signature verification failed",
      verified_at: verifiedAt,
    }
  } catch (error) {
    return {
      valid: false,
      payload: null,
      error: error instanceof Error ? error.message : "Unknown verification error",
      verified_at: verifiedAt,
    }
  }
}

/**
 * Verifies a raw signature against data
 * 
 * @param data - The original data that was signed
 * @param signatureBase64 - Base64-encoded signature
 * @returns boolean indicating validity
 */
export function verifyBytes(data: Uint8Array, signatureBase64: string): boolean {
  try {
    const publicKey = loadPublicKey()
    const signature = decodeBase64(signatureBase64)
    return nacl.sign.detached.verify(data, signature, publicKey)
  } catch {
    return false
  }
}

// ============================================================================
// Integrity Hash Functions
// ============================================================================

/**
 * Computes a SHA-256 integrity hash for a payload
 * Uses the Web Crypto API for compatibility
 * 
 * @param payload - Data to hash
 * @returns IntegrityHash with hex-encoded hash
 */
export async function computeIntegrityHash(payload: unknown): Promise<IntegrityHash> {
  const message = JSON.stringify(payload)
  const messageBytes = new TextEncoder().encode(message)
  
  // Use Web Crypto API for SHA-256
  const hashBuffer = await crypto.subtle.digest("SHA-256", messageBytes)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
  
  return {
    hash: `sha256:${hashHex}`,
    algorithm: "sha256",
    computed_at: new Date().toISOString(),
  }
}

/**
 * Verifies an integrity hash matches the payload
 * 
 * @param payload - Data to verify
 * @param expectedHash - Expected hash string (with sha256: prefix)
 * @returns boolean indicating if hash matches
 */
export async function verifyIntegrityHash(payload: unknown, expectedHash: string): Promise<boolean> {
  const computed = await computeIntegrityHash(payload)
  return computed.hash === expectedHash
}

// ============================================================================
// Key Generation Utilities (Development/Setup only)
// ============================================================================

/**
 * Generates a new Ed25519 keypair
 * Use this for initial setup or key rotation
 * 
 * @returns Object with base64-encoded public and private keys
 */
export function generateKeyPair(): { publicKey: string; privateKey: string } {
  const keyPair = nacl.sign.keyPair()
  
  return {
    publicKey: encodeBase64(keyPair.publicKey),
    privateKey: encodeBase64(keyPair.secretKey),
  }
}

// ============================================================================
// Re-exports for convenience
// ============================================================================

export { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 }
