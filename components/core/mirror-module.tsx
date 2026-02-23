"use client"

import { IntegrityScanner } from "@/components/scanner/integrity-scanner"

function MirrorDiagram() {
  return (
    <svg
      viewBox="0 0 400 40"
      className="w-full h-auto opacity-60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Mirror integrity flow"
      role="img"
    >
      <rect x="4" y="10" width="56" height="20" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <text x="32" y="24" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">SUBJECT</text>

      <line x1="64" y1="20" x2="120" y2="20" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <polygon points="120,18 124,20 120,22" fill="#C9A66B" fillOpacity="0.4" />

      <rect x="128" y="6" width="80" height="28" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <text x="168" y="18" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">INTEGRITY</text>
      <text x="168" y="28" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">ANALYSIS</text>

      <line x1="212" y1="20" x2="268" y2="20" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <polygon points="268,18 272,20 268,22" fill="#C9A66B" fillOpacity="0.4" />

      <rect x="276" y="6" width="56" height="28" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <text x="304" y="18" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">SCORE</text>
      <text x="304" y="28" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">OUTPUT</text>

      <line x1="336" y1="20" x2="392" y2="20" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <polygon points="392,18 396,20 392,22" fill="#C9A66B" fillOpacity="0.4" />
    </svg>
  )
}

export function MirrorModule({ onScanComplete }: { onScanComplete?: () => void }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Blueprint diagram */}
      <div className="py-4">
        <MirrorDiagram />
      </div>

      {/* Embedded Scanner */}
      <IntegrityScanner onScanComplete={onScanComplete} />
    </div>
  )
}
