"use client"

import { ScanFeed } from "@/components/scanner/scan-feed"

function CategoryDiagram() {
  return (
    <svg
      viewBox="0 0 400 50"
      className="w-full h-auto opacity-60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Category assignment flow"
      role="img"
    >
      {/* Scan Input */}
      <rect x="4" y="12" width="56" height="26" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <text x="32" y="22" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">SCAN</text>
      <text x="32" y="32" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">INPUT</text>

      <line x1="64" y1="25" x2="104" y2="25" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <polygon points="104,23 108,25 104,27" fill="#C9A66B" fillOpacity="0.4" />

      {/* Classifier */}
      <rect x="112" y="8" width="80" height="34" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <text x="152" y="22" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">CATEGORY</text>
      <text x="152" y="32" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">CLASSIFIER</text>

      <line x1="196" y1="25" x2="236" y2="25" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <polygon points="236,23 240,25 236,27" fill="#C9A66B" fillOpacity="0.4" />

      {/* Feed Output */}
      <rect x="244" y="8" width="80" height="34" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <text x="284" y="22" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">LIVE</text>
      <text x="284" y="32" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">FEED</text>

      <line x1="328" y1="25" x2="368" y2="25" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <polygon points="368,23 372,25 368,27" fill="#C9A66B" fillOpacity="0.4" />

      {/* Terminal */}
      <rect x="376" y="15" width="20" height="20" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
    </svg>
  )
}

export function CategoryModule({ refreshKey }: { refreshKey: number }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Blueprint diagram */}
      <div className="py-4">
        <CategoryDiagram />
      </div>

      {/* Live Feed (last 3 actions) */}
      <div>
        <div className="font-mono text-[11px] text-muted-foreground tracking-widest mb-4 leading-6">
          LAST 3 ACTIONS
        </div>
        <ScanFeed refreshKey={refreshKey} limit={3} compact />
      </div>
    </div>
  )
}
