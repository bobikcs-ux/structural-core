"use client"

/**
 * BOBIKCS SRI PROTOCOL v3.0 - Integrity Report Page
 * 
 * Full audit trail for manual verification:
 * - Raw snapshot JSON
 * - Reconstructed canonical string
 * - SHA-256 hash comparison
 * - Signature verification
 * - Chain integrity
 */

import { useEffect, useState, useCallback } from "react"
import { 
  Shield, ShieldCheck, ShieldX, Hash, FileJson, 
  Link2, Clock, CheckCircle2, XCircle, RefreshCw,
  Copy, Check, ArrowLeft
} from "lucide-react"
import { buildCanonicalString, computeSHA256, verifySignature, decodeBase64 } from "@/lib/crypto-utils"
import { loadVerifiedSnapshot } from "@/lib/system-state"
import type { SRISnapshot } from "@/lib/types"

// ============================================================================
// Types
// ============================================================================

interface VerificationResult {
  hashMatch: boolean
  signatureValid: boolean
  computedHash: string
  canonicalString: string
  error?: string
}

// ============================================================================
// Copy Button Component
// ============================================================================

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <button 
      onClick={handleCopy}
      className="p-1 hover:bg-gray-800 rounded transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-gray-500 hover:text-gray-400" />
      )}
    </button>
  )
}

// ============================================================================
// Section Component
// ============================================================================

interface SectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  status?: "success" | "error" | "neutral"
}

function Section({ title, icon, children, status = "neutral" }: SectionProps) {
  const borderColor = status === "success" 
    ? "border-emerald-500/30" 
    : status === "error" 
      ? "border-red-500/30" 
      : "border-[#1F1F1F]"
  
  return (
    <div className={`bg-[#0F0F0F] border ${borderColor} rounded-xl overflow-hidden`}>
      <div className="px-4 py-3 border-b border-[#1F1F1F] flex items-center gap-2">
        {icon}
        <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
          {title}
        </span>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function IntegrityPage() {
  const [snapshot, setSnapshot] = useState<SRISnapshot | null>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [verification, setVerification] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastVerifiedAt, setLastVerifiedAt] = useState<string | null>(null)
  
  // ── Fetch latest snapshot and public key ──────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch public key
      const keysRes = await fetch("/api/v1/keys")
      if (keysRes.ok) {
        const keysData = await keysRes.json()
        setPublicKey(keysData.public_key_base64)
      }
      
      // Fetch latest snapshot
      const snapshotRes = await fetch("/api/v1/snapshot")
      if (snapshotRes.ok) {
        const snapshotData = await snapshotRes.json()
        setSnapshot(snapshotData.snapshot)
      }
      
      // Load last verified from session
      const lastVerified = loadVerifiedSnapshot()
      if (lastVerified) {
        setLastVerifiedAt(lastVerified.calculated_at)
      }
    } catch (err) {
      console.error("Failed to fetch data:", err)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  // ── Verify snapshot ───────────────────────────────────────────
  useEffect(() => {
    if (!snapshot || !publicKey) return
    
    const verify = async () => {
      try {
        // Step 1: Rebuild canonical string
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
        
        // Step 2: Compute SHA-256
        const computedHash = await computeSHA256(canonical)
        
        // Step 3: Check hash match
        const hashMatch = computedHash === snapshot.integrity_hash
        
        // Step 4: Verify signature
        let signatureValid = false
        if (hashMatch) {
          // verifySignature takes (hashHex, signatureBase64, publicKeyBase64?)
          signatureValid = verifySignature(
            snapshot.integrity_hash,
            snapshot.signature,
            publicKey
          )
        }
        
        setVerification({
          hashMatch,
          signatureValid,
          computedHash,
          canonicalString: canonical,
        })
      } catch (err) {
        setVerification({
          hashMatch: false,
          signatureValid: false,
          computedHash: "",
          canonicalString: "",
          error: String(err),
        })
      }
    }
    
    verify()
  }, [snapshot, publicKey])
  
  // ── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="font-mono text-sm">Loading integrity data...</span>
        </div>
      </div>
    )
  }
  
  if (!snapshot) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <ShieldX className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <span className="font-mono text-gray-400">No snapshot available</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* ═══════════════════════════════════════════════════════════════════
            HEADER
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a 
              href="/"
              className="p-2 hover:bg-gray-800 rounded transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-400" />
            </a>
            <div>
              <h1 className="text-xl font-mono font-bold text-gray-100">
                INTEGRITY REPORT
              </h1>
              <p className="text-[11px] font-mono text-gray-500 mt-1">
                Manual verification audit trail
              </p>
            </div>
          </div>
          
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 
                       border border-gray-700 rounded font-mono text-xs text-gray-300
                       transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
        
        {/* ═══════════════════════════════════════════════════════════════════
            OVERALL STATUS
        ═══════════════════════════════════════════════════════════════════ */}
        {verification && (
          <div 
            className={`
              p-6 rounded-xl border flex items-center gap-4
              ${verification.hashMatch && verification.signatureValid 
                ? "bg-emerald-500/5 border-emerald-500/30" 
                : "bg-red-500/5 border-red-500/30"}
            `}
          >
            {verification.hashMatch && verification.signatureValid ? (
              <>
                <ShieldCheck className="h-10 w-10 text-emerald-400" />
                <div>
                  <span className="text-lg font-mono font-bold text-emerald-400">
                    INTEGRITY VERIFIED
                  </span>
                  <p className="text-xs font-mono text-emerald-400/70 mt-1">
                    Hash matches and signature is valid
                  </p>
                </div>
              </>
            ) : (
              <>
                <ShieldX className="h-10 w-10 text-red-400" />
                <div>
                  <span className="text-lg font-mono font-bold text-red-400">
                    VERIFICATION FAILED
                  </span>
                  <p className="text-xs font-mono text-red-400/70 mt-1">
                    {!verification.hashMatch ? "Hash mismatch detected" : "Invalid signature"}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* ═══════════════════════════════════════════════════════════════════
            1. RAW SNAPSHOT JSON
        ═══════════════════════════════════════════════════════════════════ */}
        <Section 
          title="Raw Snapshot JSON" 
          icon={<FileJson className="h-4 w-4 text-gray-500" />}
        >
          <div className="relative">
            <pre className="bg-[#0A0A0A] p-4 rounded-lg text-xs font-mono text-gray-300 overflow-x-auto">
              {JSON.stringify(snapshot, null, 2)}
            </pre>
            <div className="absolute top-2 right-2">
              <CopyButton text={JSON.stringify(snapshot, null, 2)} />
            </div>
          </div>
        </Section>
        
        {/* ═══════════════════════════════════════════════════════════════════
            2. RECONSTRUCTED CANONICAL STRING
        ═══════════════════════════════════════════════════════════════════ */}
        <Section 
          title="Reconstructed Canonical String" 
          icon={<Hash className="h-4 w-4 text-gray-500" />}
        >
          <div className="relative">
            <div className="bg-[#0A0A0A] p-4 rounded-lg">
              <code className="text-xs font-mono text-amber-400 break-all">
                {verification?.canonicalString || "Computing..."}
              </code>
            </div>
            {verification?.canonicalString && (
              <div className="absolute top-2 right-2">
                <CopyButton text={verification.canonicalString} />
              </div>
            )}
          </div>
          <p className="text-[10px] font-mono text-gray-600 mt-2">
            Format: version|timestamp|sri|spread|inflation|rate|liquidity|prev_hash
          </p>
        </Section>
        
        {/* ═══════════════════════════════════════════════════════════════════
            3. SHA-256 HASH COMPARISON
        ═══════════════════════════════════════════════════════════════════ */}
        <Section 
          title="SHA-256 Hash Comparison" 
          icon={<Hash className="h-4 w-4 text-gray-500" />}
          status={verification?.hashMatch ? "success" : "error"}
        >
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase">
                Client-Computed Hash:
              </span>
              <div className="bg-[#0A0A0A] p-3 rounded-lg mt-1">
                <code className="text-xs font-mono text-blue-400 break-all">
                  {verification?.computedHash || "Computing..."}
                </code>
              </div>
            </div>
            
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase">
                Stored Integrity Hash:
              </span>
              <div className="bg-[#0A0A0A] p-3 rounded-lg mt-1">
                <code className="text-xs font-mono text-purple-400 break-all">
                  {snapshot.integrity_hash}
                </code>
              </div>
            </div>
            
            {/* Match status */}
            <div className="flex items-center gap-2 pt-2">
              {verification?.hashMatch ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-mono text-emerald-400">HASH MATCH</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-mono text-red-400">HASH MISMATCH</span>
                </>
              )}
            </div>
          </div>
        </Section>
        
        {/* ═══════════════════════════════════════════════════════════════════
            4. SIGNATURE VERIFICATION
        ═══════════════════════════════════════════════════════════════════ */}
        <Section 
          title="Signature Verification" 
          icon={<Shield className="h-4 w-4 text-gray-500" />}
          status={verification?.signatureValid ? "success" : "error"}
        >
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase">
                Received Signature (Base64):
              </span>
              <div className="bg-[#0A0A0A] p-3 rounded-lg mt-1">
                <code className="text-xs font-mono text-cyan-400 break-all">
                  {snapshot.signature}
                </code>
              </div>
            </div>
            
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase">
                Public Key ID:
              </span>
              <div className="bg-[#0A0A0A] p-3 rounded-lg mt-1">
                <code className="text-xs font-mono text-gray-400">
                  {snapshot.public_key_id}
                </code>
              </div>
            </div>
            
            {/* Verification result */}
            <div className="flex items-center gap-2 pt-2">
              {verification?.signatureValid ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-mono text-emerald-400">SIGNATURE VALID</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-mono text-red-400">SIGNATURE INVALID</span>
                </>
              )}
            </div>
          </div>
        </Section>
        
        {/* ═══════════════════════════════════════════════════════════════════
            5. CHAIN INTEGRITY
        ═══════════════════════════════════════════════════════════════════ */}
        <Section 
          title="Chain Integrity" 
          icon={<Link2 className="h-4 w-4 text-gray-500" />}
        >
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase">
                Previous Hash:
              </span>
              <div className="bg-[#0A0A0A] p-3 rounded-lg mt-1">
                <code className="text-xs font-mono text-orange-400 break-all">
                  {snapshot.prev_hash}
                </code>
              </div>
            </div>
            
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase">
                FRED Data Hash:
              </span>
              <div className="bg-[#0A0A0A] p-3 rounded-lg mt-1">
                <code className="text-xs font-mono text-pink-400 break-all">
                  {snapshot.fred_data_hash}
                </code>
              </div>
            </div>
            
            {snapshot.prev_hash !== "GENESIS" && (
              <p className="text-[10px] font-mono text-gray-600">
                This snapshot is linked to the previous snapshot via prev_hash
              </p>
            )}
            {snapshot.prev_hash === "GENESIS" && (
              <p className="text-[10px] font-mono text-amber-500">
                This is the GENESIS snapshot (first in chain)
              </p>
            )}
          </div>
        </Section>
        
        {/* ═══════════════════════════════════════════════════════════════════
            6. SESSION INFO
        ═══════════════════════════════════════════════════════════════════ */}
        <Section 
          title="Session Verification" 
          icon={<Clock className="h-4 w-4 text-gray-500" />}
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-mono text-gray-400">
              LAST VERIFIED: {lastVerifiedAt || "No verified snapshot in this session"}
            </span>
          </div>
        </Section>
        
      </div>
    </div>
  )
}
