import { createPublicKey, verify } from "crypto"

/**
 * Server-side Ed25519 signature verification.
 * Takes the raw 32-byte public key (base64), hex hash, and base64 signature.
 */
export function verifySignature(
  publicKeyBase64: string,
  hexHash: string,
  signatureBase64: string
): boolean {
  try {
    // Reconstruct the SPKI-wrapped key from the raw 32-byte public key
    const rawKey = Buffer.from(publicKeyBase64, "base64")

    // Ed25519 SPKI header (12 bytes)
    const spkiHeader = Buffer.from(
      "302a300506032b6570032100",
      "hex"
    )
    const spkiDer = Buffer.concat([spkiHeader, rawKey])

    const keyObject = createPublicKey({
      key: spkiDer,
      format: "der",
      type: "spki",
    })

    const hashBytes = Buffer.from(hexHash, "hex")
    const signatureBytes = Buffer.from(signatureBase64, "base64")

    return verify(null, hashBytes, keyObject, signatureBytes)
  } catch {
    return false
  }
}
