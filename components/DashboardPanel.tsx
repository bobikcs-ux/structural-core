"use client"

/**
 * BOBIKCS SRI PROTOCOL v3.0 - Dashboard Panel
 * 
 * Dark terminal aesthetic with:
 * - Main SRI display with risk category
 * - 4 component breakdown cards
 * - Integrity feed (scrolling ledger)
 * - Status bar
 */

import { useEffect, useState, useRef } from "react"
import { Shield, ShieldCheck, Clock, Key, ExternalLink, Activity } from "lucide-react"
import { SystemState, STATE_META, getRiskCategory, getRiskColor } from "@/lib/system-state"
import type { SRISnapshot } from "@/lib/types"

// ============================================================================
// Types
// ============================================================================

interface DashboardPanelProps {
  snapshot: SRISnapshot
  systemState: SystemState
  history?: SRISnapshot[]
}

interface ComponentCardProps {
  name: string
  score: number
  weight: string
  source: string
}

interface LedgerEntryProps {
  snapshot: SRISnapshot
  isLatest: boolean
  isNew?: boolean
}

// ============================================================================
// Component Card
// ============================================================================

function ComponentCard({ name, score, weight, source }: ComponentCardProps) {
  const percentage = Math.min(Math.max(score, 0), 1) * 100
  
  return (
    <div className="bg-[#0F0F0F] border border-[#1F1F1F] rounded-lg p-4 hover:border-[#2A2A2A] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
          {name}
        </span>
        <span className="text-[10px] font-mono text-gray-600">
          {weight}
        </span>
      </div>
      
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-mono font-bold text-gray-100 tabular-nums">
          {score.toFixed(4)}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden mb-2">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: getRiskColor(score)
          }}
        />
      </div>
      
      <span className="text-[10px] font-mono text-gray-600 uppercase">
        {source}
      </span>
    </div>
  )
}

// ============================================================================
// Ledger Entry
// ============================================================================

function LedgerEntry({ snapshot, isLatest, isNew }: LedgerEntryProps) {
  const truncatedHash = snapshot.integrity_hash.slice(0, 16)
  const time = new Date(snapshot.calculated_at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC"
  })
  
  return (
    <div 
      className={`
        flex items-center gap-4 px-3 py-2 font-mono text-xs
        ${isNew ? "animate-slide-in" : ""}
        ${isLatest ? "bg-emerald-500/5 border-l-2 border-emerald-500" : "opacity-60 hover:opacity-80"}
        transition-all duration-300
      `}
    >
      <span className="text-gray-500 w-20">{time} UTC</span>
      <span className="text-gray-300 w-16 tabular-nums">{snapshot.sri_value.toFixed(4)}</span>
      <span className="text-gray-600 font-mono flex-1 truncate">{truncatedHash}...</span>
      <span className="flex items-center gap-1 text-emerald-400">
        <ShieldCheck className="h-3 w-3" />
        <span className="text-[10px]">VERIFIED</span>
      </span>
    </div>
  )
}

// ============================================================================
// Main Dashboard Panel
// ============================================================================

export function DashboardPanel({ snapshot, systemState, history = [] }: DashboardPanelProps) {
  const [displayHistory, setDisplayHistory] = useState<SRISnapshot[]>([])
  const [newEntryId, setNewEntryId] = useState<string | null>(null)
  const prevSnapshotRef = useRef<string | null>(null)
  
  const meta = STATE_META[systemState]
  const riskCategory = getRiskCategory(snapshot.sri_value)
  const riskColor = getRiskColor(snapshot.sri_value)
  
  // Update history with animation trigger
  useEffect(() => {
    const allSnapshots = [snapshot, ...history].slice(0, 5)
    
    // Check if this is a new snapshot
    if (prevSnapshotRef.current !== snapshot.id) {
      setNewEntryId(snapshot.id)
      prevSnapshotRef.current = snapshot.id
      
      // Clear animation flag after animation completes
      const timer = setTimeout(() => setNewEntryId(null), 500)
      return () => clearTimeout(timer)
    }
    
    setDisplayHistory(allSnapshots)
  }, [snapshot, history])
  
  // Format timestamp
  const lastUpdate = new Date(snapshot.calculated_at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC"
  })

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100 p-6 pt-12">
      {/* DEGRADED banner offset */}
      {systemState === "DEGRADED" && <div className="h-8" />}
      
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* ═══════════════════════════════════════════════════════════════════
            MAIN SRI DISPLAY
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-[#0F0F0F] border border-[#1F1F1F] rounded-xl p-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500">
              STRUCTURAL RESERVE INDEX
            </span>
            <div className="flex items-center gap-2">
              {systemState === "LIVE" && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[10px] font-mono uppercase text-emerald-400">Verified</span>
                </div>
              )}
              {systemState === "DEGRADED" && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded">
                  <Activity className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[10px] font-mono uppercase text-amber-400">Degraded</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-baseline gap-6">
            <span 
              className="text-6xl font-mono font-bold tabular-nums tracking-tight"
              style={{ color: riskColor }}
            >
              {snapshot.sri_value.toFixed(4)}
            </span>
            
            <div 
              className="px-3 py-1 rounded text-xs font-mono uppercase tracking-wider"
              style={{ 
                backgroundColor: `${riskColor}15`,
                color: riskColor,
                border: `1px solid ${riskColor}30`
              }}
            >
              {riskCategory}
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-4 text-[11px] font-mono text-gray-500">
            <span>VERSION {snapshot.version}</span>
            <span className="text-gray-700">|</span>
            <span>CHAIN: {snapshot.prev_hash === "GENESIS" ? "GENESIS" : snapshot.prev_hash.slice(0, 8)}...</span>
          </div>
        </div>
        
        {/* ═══════════════════════════════════════════════════════════════════
            COMPONENT BREAKDOWN (4 cards)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ComponentCard 
            name="Yield Spread" 
            score={snapshot.spread_score}
            weight="35%"
            source="DGS10 - DGS2"
          />
          <ComponentCard 
            name="Inflation" 
            score={snapshot.inflation_score}
            weight="25%"
            source="CPIAUCSL YoY"
          />
          <ComponentCard 
            name="Rate Pressure" 
            score={snapshot.rate_score}
            weight="20%"
            source="FEDFUNDS"
          />
          <ComponentCard 
            name="Liquidity" 
            score={snapshot.liquidity_score}
            weight="20%"
            source="M2SL YoY"
          />
        </div>
        
        {/* ═══════════════════════════════════════════════════════════════════
            INTEGRITY FEED (Scrolling Ledger)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-[#0F0F0F] border border-[#1F1F1F] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1F1F1F] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-500" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500">
                Integrity Ledger
              </span>
            </div>
            <span className="text-[10px] font-mono text-gray-600">
              Last 5 snapshots
            </span>
          </div>
          
          <div className="divide-y divide-[#1A1A1A]">
            {displayHistory.length > 0 ? (
              displayHistory.map((snap, idx) => (
                <LedgerEntry 
                  key={snap.id} 
                  snapshot={snap} 
                  isLatest={idx === 0}
                  isNew={snap.id === newEntryId}
                />
              ))
            ) : (
              <LedgerEntry 
                snapshot={snapshot} 
                isLatest={true}
                isNew={false}
              />
            )}
          </div>
        </div>
        
        {/* ═══════════════════════════════════════════════════════════════════
            STATUS BAR
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-[#0F0F0F] border border-[#1F1F1F] rounded-xl px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* State pill */}
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded"
              style={{ 
                backgroundColor: `${meta.color}10`,
                border: `1px solid ${meta.color}30`
              }}
            >
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: meta.color }}
              />
              <span 
                className="text-[11px] font-mono font-medium uppercase"
                style={{ color: meta.color }}
              >
                {meta.label}
              </span>
            </div>
            
            {/* Last update */}
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-[11px] font-mono">
                UPDATED {lastUpdate} UTC
              </span>
            </div>
            
            {/* Key ID */}
            <div className="flex items-center gap-2 text-gray-600">
              <Key className="h-3.5 w-3.5" />
              <span className="text-[10px] font-mono">
                KEY: {snapshot.public_key_id}
              </span>
            </div>
            
            {/* Verify link */}
            <a 
              href="/integrity"
              className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>VERIFY</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        
      </div>
    </div>
  )
}
