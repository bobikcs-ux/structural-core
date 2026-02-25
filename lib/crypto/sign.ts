import { createPrivateKey, sign } from "crypto"

/**
 * Sign a SHA-256 hex hash with the Ed25519 private key stored in env.
 * Returns a base64-encoded signature.
 */
export function signHash(hexHash: string): string {
  const privateKeyBase64 = process.env.PRIVATE_KEY_BASE64
  if (!privateKeyBase64) {
    throw new Error("Missing PRIVATE_KEY_BASE64 environment variable")
  }

  const privateKeyDer = Buffer.from(privateKeyBase64, "base64")
  const keyObject = createPrivateKey({
    key: privateKeyDer,
    format: "der",
    type: "pkcs8",
  })

  // Sign the raw hash bytes (not the hex string)
  const hashBytes = Buffer.from(hexHash, "hex")
  const signature = sign(null, hashBytes, keyObject)

  return signature.toString("base64")
}
