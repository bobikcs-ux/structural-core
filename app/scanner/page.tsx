"use client"

/**
 * Scanner Page - Integrity Audit & Ed25519 Verification
 * Detailed cryptographic verification interface
 */

import { useState, useEffect } from "react"
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Copy, 
  Check, 
  RefreshCw,
  Hash,
  Key,
  FileText,
  Link as LinkIcon
} from "lucide-react"
import { buildCanonicalString, computeSHA256, verifySignature } from "@/lib/crypto-utils"
import type { SRISnapshot } from "@/lib/types"

const PUBLIC_KEY = process.env.NEXT_PUBLIC_BOBIKCS_PUBLIC_KEY_BASE64 || ""

interface VerificationResult {
  step: string
  status: "pending" | "success" | "error"
  detail?: string
}

export default function ScannerPage() {
  const [snapshot, setSnapshot] = useState<SRISnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [results, setResults] = useState<VerificationResult[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  // Fetch latest snapshot from DB or session
  const fetchSnapshot = async () => {
    setLoading(true)
    try {
      // First try session storage
      const stored = sessionStorage.getItem("bobikcs_last_verified_snapshot")
      if (stored) {
        setSnapshot(JSON.parse(stored))
        setLoading(false)
        return
      }
      
      // Otherwise fetch from API
      const res = await fetch("/api/v1/snapshots?limit=1")
      if (res.ok) {
        const data = await res.json()
        if (data.snapshots && data.snapshots.length > 0) {
          setSnapshot(data.snapshots[0])
        }
      }
    } catch (err) {
      console.error("Failed to fetch:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSnapshot()
  }, [])

  // Run verification
  const runVerification = async () => {
    if (!snapshot) return
    
    setVerifying(true)
    setResults([
      { step: "Canonical String", status: "pending" },
      { step: "SHA-256 Hash", status: "pending" },
      { step: "Ed25519 Signature", status: "pending" },
      { step: "Chain Integrity", status: "pending" },
    ])

    await new Promise(r => setTimeout(r, 300))

    // Step 1: Build canonical string
    const canonical = buildCanonicalString({
      version: snapshot.version,
      calculated_at: snapshot.calculated_at,
      sri_value: snapshot.sri_value,
      spread_score: snapshot.spread_score,
      inflation_score: snapshot.inflation_score,
      rate_score: snapshot.rate_score,
      liquidity_score: snapshot.liquidity_score,
      prev_hash: snapshot.prev_hash,
    })
    
    setResults(prev => prev.map((r, i) => 
      i === 0 ? { ...r, status: "success", detail: canonical.slice(0, 50) + "..." } : r
    ))

    await new Promise(r => setTimeout(r, 300))

    // Step 2: Compute hash
    const computedHash = await computeSHA256(canonical)
    const hashMatch = computedHash === snapshot.integrity_hash
    
    setResults(prev => prev.map((r, i) => 
      i === 1 ? { 
        ...r, 
        status: hashMatch ? "success" : "error",
        detail: hashMatch ? "Hash matches" : "MISMATCH DETECTED"
      } : r
    ))

    await new Promise(r => setTimeout(r, 300))

    // Step 3: Verify signature
    let sigValid = false
    if (hashMatch && PUBLIC_KEY) {
      sigValid = verifySignature(snapshot.integrity_hash, snapshot.signature, PUBLIC_KEY)
    }
    
    setResults(prev => prev.map((r, i) => 
      i === 2 ? { 
        ...r, 
        status: sigValid ? "success" : "error",
        detail: sigValid ? "Signature valid" : "INVALID SIGNATURE"
      } : r
    ))

    await new Promise(r => setTimeout(r, 300))

    // Step 4: Chain integrity
    const chainValid = snapshot.prev_hash === "GENESIS" || snapshot.prev_hash.length === 64
    
    setResults(prev => prev.map((r, i) => 
      i === 3 ? { 
        ...r, 
        status: chainValid ? "success" : "error",
        detail: snapshot.prev_hash === "GENESIS" ? "Genesis block" : "Chain linked"
      } : r
    ))

    setVerifying(false)
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-[hsl(0,0%,2%)] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-full mb-6">
            <Shield className="w-4 h-4 text-[hsl(43,25%,55%)]" />
            <span className="text-[10px] font-mono tracking-wider text-[hsl(0,0%,60%)]">
              INTEGRITY SCANNER
            </span>
          </div>
          <h1 className="text-3xl font-mono font-bold text-[hsl(0,0%,90%)] mb-4">
            CRYPTOGRAPHIC AUDIT
          </h1>
          <p className="text-sm font-mono text-[hsl(0,0%,50%)]">
            Verify Ed25519 signatures and hash chain integrity
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <RefreshCw className="w-8 h-8 text-[hsl(43,25%,55%)] animate-spin mx-auto mb-4" />
            <p className="text-sm font-mono text-[hsl(0,0%,50%)]">Loading snapshot data...</p>
          </div>
        ) : !snapshot ? (
          <div className="text-center py-20 bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg">
            <Shield className="w-12 h-12 text-[hsl(0,0%,30%)] mx-auto mb-4" />
            <h2 className="text-lg font-mono text-[hsl(0,0%,90%)] mb-2">No Snapshot Available</h2>
            <p className="text-xs font-mono text-[hsl(0,0%,50%)] mb-6">
              Visit the Intelligence page first to receive verified data
            </p>
            <a
              href="/intelligence"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(43,25%,55%)] text-[hsl(0,0%,2%)] font-mono text-sm rounded"
            >
              <LinkIcon className="w-4 h-4" />
              GO TO INTELLIGENCE
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Snapshot Info */}
            <div className="bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-mono text-[hsl(0,0%,50%)] uppercase tracking-wider">
                  Current Snapshot
                </h2>
                <span className="text-xs font-mono text-[hsl(43,25%,55%)]">
                  v{snapshot.version}
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-[10px] font-mono text-[hsl(0,0%,40%)] mb-2">SRI VALUE</div>
                  <div className="text-3xl font-mono font-bold text-[hsl(43,25%,55%)]">
                    {snapshot.sri_value.toFixed(4)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[hsl(0,0%,40%)] mb-2">CALCULATED AT</div>
                  <div className="text-sm font-mono text-[hsl(0,0%,90%)]">
                    {snapshot.calculated_at}
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic Data */}
            <div className="bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg p-6">
              <h2 className="text-sm font-mono text-[hsl(0,0%,50%)] uppercase tracking-wider mb-6">
                Cryptographic Data
              </h2>
              
              <div className="space-y-4">
                {/* Integrity Hash */}
                <div className="p-4 bg-[hsl(0,0%,3%)] rounded border border-[hsl(0,0%,10%)]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-[hsl(43,25%,55%)]" />
                      <span className="text-[10px] font-mono text-[hsl(0,0%,50%)] uppercase">Integrity Hash</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(snapshot.integrity_hash, "hash")}
                      className="p-1 hover:bg-[hsl(0,0%,10%)] rounded transition-colors"
                    >
                      {copied === "hash" ? (
                        <Check className="w-4 h-4 text-[hsl(142,76%,46%)]" />
                      ) : (
                        <Copy className="w-4 h-4 text-[hsl(0,0%,40%)]" />
                      )}
                    </button>
                  </div>
                  <code className="text-[11px] font-mono text-[hsl(0,0%,90%)] break-all">
                    {snapshot.integrity_hash}
                  </code>
                </div>

                {/* Signature */}
                <div className="p-4 bg-[hsl(0,0%,3%)] rounded border border-[hsl(0,0%,10%)]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-[hsl(43,25%,55%)]" />
                      <span className="text-[10px] font-mono text-[hsl(0,0%,50%)] uppercase">Ed25519 Signature</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(snapshot.signature, "sig")}
                      className="p-1 hover:bg-[hsl(0,0%,10%)] rounded transition-colors"
                    >
                      {copied === "sig" ? (
                        <Check className="w-4 h-4 text-[hsl(142,76%,46%)]" />
                      ) : (
                        <Copy className="w-4 h-4 text-[hsl(0,0%,40%)]" />
                      )}
                    </button>
                  </div>
                  <code className="text-[11px] font-mono text-[hsl(0,0%,90%)] break-all">
                    {snapshot.signature}
                  </code>
                </div>

                {/* Previous Hash */}
                <div className="p-4 bg-[hsl(0,0%,3%)] rounded border border-[hsl(0,0%,10%)]">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-[hsl(43,25%,55%)]" />
                    <span className="text-[10px] font-mono text-[hsl(0,0%,50%)] uppercase">Previous Hash (Chain)</span>
                  </div>
                  <code className="text-[11px] font-mono text-[hsl(0,0%,90%)] break-all">
                    {snapshot.prev_hash}
                  </code>
                </div>
              </div>
            </div>

            {/* Verification Panel */}
            <div className="bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-mono text-[hsl(0,0%,50%)] uppercase tracking-wider">
                  Verification Steps
                </h2>
                <button
                  onClick={runVerification}
                  disabled={verifying}
                  className="flex items-center gap-2 px-4 py-2 bg-[hsl(43,25%,55%)] text-[hsl(0,0%,2%)] font-mono text-sm rounded hover:bg-[hsl(43,25%,45%)] transition-colors disabled:opacity-50"
                >
                  {verifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  {verifying ? "VERIFYING..." : "RUN VERIFICATION"}
                </button>
              </div>

              <div className="space-y-3">
                {results.length === 0 ? (
                  <div className="text-center py-8 text-[hsl(0,0%,40%)]">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-mono">Click RUN VERIFICATION to start audit</p>
                  </div>
                ) : (
                  results.map((result, idx) => (
                    <div
                      key={idx}
                      className={`
                        flex items-center justify-between p-4 rounded border
                        ${result.status === "pending" ? "bg-[hsl(0,0%,3%)] border-[hsl(0,0%,10%)]" : ""}
                        ${result.status === "success" ? "bg-[hsl(142,76%,46%)]/5 border-[hsl(142,76%,46%)]/20" : ""}
                        ${result.status === "error" ? "bg-[hsl(0,72%,51%)]/5 border-[hsl(0,72%,51%)]/20" : ""}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {result.status === "pending" && (
                          <div className="w-5 h-5 rounded-full border-2 border-[hsl(0,0%,20%)] border-t-[hsl(45,90%,50%)] animate-spin" />
                        )}
                        {result.status === "success" && (
                          <ShieldCheck className="w-5 h-5 text-[hsl(142,76%,46%)]" />
                        )}
                        {result.status === "error" && (
                          <ShieldX className="w-5 h-5 text-[hsl(0,72%,51%)]" />
                        )}
                        <span className="text-sm font-mono text-[hsl(0,0%,90%)]">
                          {result.step}
                        </span>
                      </div>
                      {result.detail && (
                        <span className={`text-xs font-mono ${
                          result.status === "success" ? "text-[hsl(142,76%,46%)]" : 
                          result.status === "error" ? "text-[hsl(0,72%,51%)]" : 
                          "text-[hsl(0,0%,50%)]"
                        }`}>
                          {result.detail}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
