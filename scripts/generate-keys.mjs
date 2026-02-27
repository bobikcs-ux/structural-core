/**
 * Ed25519 Key Pair Generator for BOBIKCS SRI Protocol
 * 
 * Generates a new signing key pair in the formats expected by the system:
 * - CORE_PRIVATE_KEY: 128 hex characters (64 bytes - seed + public key)
 * - CORE_PUBLIC_KEY: Base64 encoded (44 characters, 32 bytes)
 */

import nacl from "tweetnacl"

// Generate new Ed25519 key pair
const keyPair = nacl.sign.keyPair()

// Private key as 128 hex chars (full 64-byte secret key)
const privateKeyHex = Buffer.from(keyPair.secretKey).toString("hex")

// Public key as Base64 (32 bytes -> 44 base64 chars)
const publicKeyBase64 = Buffer.from(keyPair.publicKey).toString("base64")

// Also provide public key as hex for reference
const publicKeyHex = Buffer.from(keyPair.publicKey).toString("hex")

console.log("═══════════════════════════════════════════════════════════════════")
console.log("  BOBIKCS SRI PROTOCOL - Ed25519 KEY PAIR GENERATOR")
console.log("═══════════════════════════════════════════════════════════════════")
console.log("")
console.log("Add these to your Vercel Environment Variables:")
console.log("")
console.log("┌─────────────────────────────────────────────────────────────────┐")
console.log("│ CORE_PRIVATE_KEY (Server-side only, 128 hex chars)             │")
console.log("└─────────────────────────────────────────────────────────────────┘")
console.log(privateKeyHex)
console.log("")
console.log("┌─────────────────────────────────────────────────────────────────┐")
console.log("│ CORE_PUBLIC_KEY (Base64, 44 chars) - Also for client           │")
console.log("└─────────────────────────────────────────────────────────────────┘")
console.log(publicKeyBase64)
console.log("")
console.log("┌─────────────────────────────────────────────────────────────────┐")
console.log("│ NEXT_PUBLIC_BOBIKCS_PUBLIC_KEY_BASE64 (Client-side)            │")
console.log("└─────────────────────────────────────────────────────────────────┘")
console.log(publicKeyBase64)
console.log("")
console.log("┌─────────────────────────────────────────────────────────────────┐")
console.log("│ SIGNING_KEY_ID (Unique identifier for this key)                │")
console.log("└─────────────────────────────────────────────────────────────────┘")
console.log(`bobikcs-prod-${Date.now()}`)
console.log("")
console.log("═══════════════════════════════════════════════════════════════════")
console.log("  IMPORTANT: Store CORE_PRIVATE_KEY securely! Never expose it.")
console.log("═══════════════════════════════════════════════════════════════════")
