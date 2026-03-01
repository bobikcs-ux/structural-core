/**
 * Intelligence Dashboard - SRI Index Display
 * Real-time feed using usePulse hook with Ed25519 verification
 * 
 * IntegrityVerifier manages its own state internally via usePulse,
 * so we just pass the public key and render function.
 */

import { Suspense } from "react"
import { IntelligenceClient } from "./intelligence-client"

// Force dynamic rendering with caching strategy
export const dynamic = "force-dynamic"
export const fetchCache = "force-cache"

// Loading fallback component
function IntelligenceLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[hsl(45,90%,50%)] border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-sm text-gray-500">
          INITIALIZING MACRO KERNEL...
        </span>
      </div>
    </div>
  )
}

export default function IntelligencePage() {
  return (
    <Suspense fallback={<IntelligenceLoading />}>
      <IntelligenceClient />
    </Suspense>
  )
}
