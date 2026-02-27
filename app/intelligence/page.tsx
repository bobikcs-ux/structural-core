"use client"

/**
 * Intelligence Dashboard - SRI Index Display
 * Real-time feed using usePulse hook with Ed25519 verification
 * 
 * IntegrityVerifier manages its own state internally via usePulse,
 * so we just pass the public key and render function.
 */

import { DashboardPanel } from "@/components/DashboardPanel"
import { IntegrityVerifier } from "@/components/IntegrityVerifier"

// Public key from environment (exposed to client)
const PUBLIC_KEY = process.env.NEXT_PUBLIC_BOBIKCS_PUBLIC_KEY_BASE64 || ""

export default function IntelligencePage() {
  return (
    <IntegrityVerifier publicKeyBase64={PUBLIC_KEY}>
      {(snapshot, systemState) => (
        <DashboardPanel
          snapshot={snapshot}
          systemState={systemState}
          history={[]}
        />
      )}
    </IntegrityVerifier>
  )
}
