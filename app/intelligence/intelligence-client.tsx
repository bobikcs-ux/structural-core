"use client"

/**
 * Intelligence Client Component
 * Handles real-time SSE subscription with IntegrityVerifier
 */

import { DashboardPanel } from "@/components/DashboardPanel"
import { IntegrityVerifier } from "@/components/IntegrityVerifier"

// Public key from environment (exposed to client)
const PUBLIC_KEY = process.env.NEXT_PUBLIC_BOBIKCS_PUBLIC_KEY_BASE64 || ""

export function IntelligenceClient() {
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
