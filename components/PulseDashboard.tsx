"use client"

/**
 * BOBIKCS SRI PROTOCOL v3.0 - Pulse Dashboard Client Component
 * 
 * Wraps DashboardPanel in IntegrityVerifier for automatic kill-switch.
 */

import { IntegrityVerifier } from "./IntegrityVerifier"
import { DashboardPanel } from "./DashboardPanel"

interface PulseDashboardProps {
  publicKeyBase64: string
}

export function PulseDashboard({ publicKeyBase64 }: PulseDashboardProps) {
  return (
    <IntegrityVerifier publicKeyBase64={publicKeyBase64}>
      {(snapshot, systemState) => (
        <DashboardPanel 
          snapshot={snapshot} 
          systemState={systemState}
        />
      )}
    </IntegrityVerifier>
  )
}
