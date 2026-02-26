import { ShieldCheck, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerifiedBadgeProps {
  isVerified: boolean
  hash?: string | null
}

export function VerifiedBadge({ isVerified, hash }: VerifiedBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
        isVerified
          ? "border-status-healthy/30 bg-status-healthy/10 text-status-healthy"
          : "border-status-offline/30 bg-status-offline/10 text-status-offline"
      )}
      title={hash ? `Hash: ${hash}` : "No integrity hash"}
    >
      {isVerified ? (
        <>
          <ShieldCheck className="h-3 w-3" />
          <span>Verified</span>
        </>
      ) : (
        <>
          <ShieldAlert className="h-3 w-3" />
          <span>Unverified</span>
        </>
      )}
    </div>
  )
}
