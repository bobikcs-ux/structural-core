import { createHash } from "crypto"

/**
 * Compute SHA-256 hex digest of a canonical JSON string.
 */
export function sha256hex(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex")
}

/**
 * Compute the integrity hash for a canonical payload.
 */
export function computeIntegrityHash(
  canonicalJsonString: string
): string {
  return sha256hex(canonicalJsonString)
}
