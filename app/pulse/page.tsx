/**
 * BOBIKCS SRI PROTOCOL v3.0 - Pulse Dashboard Page
 * 
 * Main entry point for the SRI dashboard.
 * Wrapped in IntegrityVerifier for automatic kill-switch.
 */

import { PulseDashboard } from "@/components/PulseDashboard"

export const metadata = {
  title: "SRI Pulse | BOBIKCS",
  description: "Structural Reserve Index - Real-time integrity monitoring",
}

export default function PulsePage() {
  const publicKeyBase64 = process.env.NEXT_PUBLIC_BOBIKCS_PUBLIC_KEY_BASE64 || ""
  
  return <PulseDashboard publicKeyBase64={publicKeyBase64} />
}
