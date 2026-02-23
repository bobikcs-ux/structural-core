"use client"

const METRICS = [
  { label: "STRUCTURAL GAIN", value: "+12.4%", accent: true },
  { label: "STRUCTURAL LOSS", value: "-3.1%", accent: false },
  { label: "REVERSIBILITY", value: "HIGH", accent: false },
  { label: "AUTHORITY IMPACT", value: "POSITIVE", accent: true },
  { label: "TIME EXPOSURE", value: "42 DAYS", accent: false },
  { label: "NET STRUCTURAL DELTA", value: "POSITIVE", accent: true },
]

function VaultDiagram() {
  return (
    <svg
      viewBox="0 0 400 50"
      className="w-full h-auto opacity-60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Vault compression flow"
      role="img"
    >
      {/* Input */}
      <rect x="4" y="12" width="56" height="26" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <text x="32" y="22" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">RAW</text>
      <text x="32" y="32" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">INPUT</text>

      {/* Flow line 1 */}
      <line x1="64" y1="25" x2="108" y2="25" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <polygon points="108,23 112,25 108,27" fill="#C9A66B" fillOpacity="0.4" />

      {/* Compression */}
      <rect x="116" y="8" width="80" height="34" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <text x="156" y="22" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">VAULT</text>
      <text x="156" y="32" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">COMPRESSION</text>

      {/* Flow line 2 */}
      <line x1="200" y1="25" x2="244" y2="25" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <polygon points="244,23 248,25 244,27" fill="#C9A66B" fillOpacity="0.4" />

      {/* Verification */}
      <rect x="252" y="8" width="68" height="34" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <text x="286" y="22" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">VERIFY</text>
      <text x="286" y="32" textAnchor="middle" fill="#C9A66B" fillOpacity="0.5" fontSize="6" fontFamily="monospace">INTEGRITY</text>

      {/* Flow line 3 */}
      <line x1="324" y1="25" x2="368" y2="25" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <polygon points="368,23 372,25 368,27" fill="#C9A66B" fillOpacity="0.4" />

      {/* Output */}
      <rect x="376" y="15" width="20" height="20" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <line x1="380" y1="19" x2="392" y2="31" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
      <line x1="392" y1="19" x2="380" y2="31" stroke="#C9A66B" strokeOpacity="0.4" strokeWidth="0.8" />
    </svg>
  )
}

export function VaultModule() {
  return (
    <div className="flex flex-col gap-8">
      {/* Blueprint diagram */}
      <div className="py-4">
        <VaultDiagram />
      </div>

      {/* Metrics */}
      <div className="flex flex-col gap-4">
        {METRICS.map((m) => (
          <div key={m.label} className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-muted-foreground tracking-wider leading-6">
              {m.label}
            </span>
            <span
              className={`font-mono text-[11px] tracking-wider leading-6 ${
                m.accent ? "text-gold" : "text-foreground"
              }`}
            >
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* Action */}
      <div className="pt-4 border-t border-terminal-line">
        <button
          type="button"
          className="font-mono text-[11px] tracking-widest py-2.5 text-gold"
        >
          {">"} COMPRESS
        </button>
      </div>
    </div>
  )
}
