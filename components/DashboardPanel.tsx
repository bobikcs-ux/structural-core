"use client"

/**
 * BOBIKCS SRI PROTOCOL v3.0 - Dashboard Panel
 * 
 * Stable terminal-style dashboard with:
 * - Fixed heights (no layout shift)
 * - Sparklines for all metrics
 * - Main SRI chart
 */

import { useEffect, useState, useRef, useMemo } from "react"
import { Shield, ShieldCheck, Clock, Key, ExternalLink } from "lucide-react"
import { SystemState, STATE_META, getRiskCategory, getRiskColor } from "@/lib/system-state"
import type { SRISnapshot } from "@/lib/types"

// ============================================================================
// Types
// ============================================================================

interface DashboardPanelProps {
  snapshot: SRISnapshot
  systemState: SystemState
  history: SRISnapshot[]
}

// ============================================================================
// Sparkline Component (SVG mini-chart)
// ============================================================================

function Sparkline({ 
  data, 
  width = 100, 
  height = 24,
  color = "hsl(43, 25%, 55%)"
}: { 
  data: number[]
  width?: number
  height?: number
  color?: string
}) {
  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} className="opacity-30">
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke={color} strokeWidth="1" strokeDasharray="2,2" />
      </svg>
    )
  }
  
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((val - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(" ")
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
        r="2"
        fill={color}
      />
    </svg>
  )
}

// ============================================================================
// Main SRI Chart (larger)
// ============================================================================

function SRIChart({ data, width = 400, height = 120 }: { data: number[], width?: number, height?: number }) {
  if (!data || data.length < 2) {
    return (
      <div 
        className="flex items-center justify-center bg-[#0A0A0A] rounded border border-[#1A1A1A]"
        style={{ width, height }}
      >
        <span className="text-xs font-mono text-gray-600">Waiting for data...</span>
      </div>
    )
  }
  
  const min = Math.min(...data) * 0.95
  const max = Math.max(...data) * 1.05
  const range = max - min || 1
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((val - min) / range) * (height - 20) - 10
    return `${x},${y}`
  }).join(" ")
  
  // Area fill path
  const areaPath = `M0,${height} L${points.split(" ").map((p, i) => {
    if (i === 0) return p
    return `L${p}`
  }).join(" ")} L${width},${height} Z`
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((ratio) => (
        <line 
          key={ratio}
          x1="0" 
          y1={height * ratio} 
          x2={width} 
          y2={height * ratio} 
          stroke="#1A1A1A" 
          strokeWidth="1"
        />
      ))}
      
      {/* Area fill */}
      <path
        d={areaPath}
        fill="url(#sriGradient)"
        opacity="0.3"
      />
      
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="hsl(43, 25%, 55%)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Current value dot */}
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 20) - 10}
        r="4"
        fill="hsl(43, 25%, 55%)"
      />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="sriGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(43, 25%, 55%)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(43, 25%, 55%)" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ============================================================================
// Component Card with Sparkline
// ============================================================================

function ComponentCard({ 
  name, 
  score, 
  weight, 
  source,
  history
}: { 
  name: string
  score: number
  weight: string
  source: string
  history: number[]
}) {
  const percentage = Math.min(Math.max(score, 0), 1) * 100
  
  return (
    <div className="bg-[#0F0F0F] border border-[#1F1F1F] rounded-lg p-4 h-[140px] flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
          {name}
        </span>
        <span className="text-[9px] font-mono text-gray-600">
          {weight}
        </span>
      </div>
      
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-xl font-mono font-bold text-gray-100 tabular-nums">
          {score.toFixed(4)}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden mb-2">
        <div 
          className="h-full rounded-full"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: getRiskColor(score)
          }}
        />
      </div>
      
      {/* Sparkline */}
      <div className="flex-1 flex items-end">
        <Sparkline data={history} width={120} height={20} />
      </div>
      
      <span className="text-[9px] font-mono text-gray-600 uppercase mt-1">
        {source}
      </span>
    </div>
  )
}

// ============================================================================
// Ledger Entry
// ============================================================================

function LedgerEntry({ snapshot, isLatest }: { snapshot: SRISnapshot, isLatest: boolean }) {
  const truncatedHash = snapshot.integrity_hash?.slice(0, 12) || "..."
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
        flex items-center gap-4 px-3 py-2 font-mono text-xs h-[36px]
        ${isLatest ? "bg-[hsl(43,25%,55%)]/5 border-l-2 border-[hsl(43,25%,55%)]" : "opacity-50"}
      `}
    >
      <span className="text-gray-500 w-16 flex-shrink-0">{time}</span>
      <span className="text-gray-300 w-14 tabular-nums flex-shrink-0">{snapshot.sri_value?.toFixed(4)}</span>
      <span className="text-gray-600 font-mono flex-1 truncate">{truncatedHash}...</span>
      <span className="flex items-center gap-1 text-[hsl(43,25%,55%)] flex-shrink-0">
        <ShieldCheck className="h-3 w-3" />
      </span>
    </div>
  )
}

// ============================================================================
// Main Dashboard Panel
// ============================================================================

export function DashboardPanel({ snapshot, systemState, history = [] }: DashboardPanelProps) {
  const meta = STATE_META[systemState]
  const riskCategory = getRiskCategory(snapshot.sri_value)
  const riskColor = getRiskColor(snapshot.sri_value)
  
  // Extract history arrays for each metric
  const sriHistory = useMemo(() => history.map(s => s.sri_value).reverse(), [history])
  const spreadHistory = useMemo(() => history.map(s => s.spread_score).reverse(), [history])
  const inflationHistory = useMemo(() => history.map(s => s.inflation_score).reverse(), [history])
  const rateHistory = useMemo(() => history.map(s => s.rate_score).reverse(), [history])
  const liquidityHistory = useMemo(() => history.map(s => s.liquidity_score).reverse(), [history])
  
  // Format timestamp
  const lastUpdate = new Date(snapshot.calculated_at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC"
  })

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 p-6 pt-12">
      <div className="max-w-5xl mx-auto space-y-4">
        
        {/* ═══════════════════════════════════════════════════════════════════
            MAIN SRI DISPLAY WITH CHART
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-6 h-[280px]">
          <div className="flex items-start justify-between h-full">
            {/* Left: Value display */}
            <div className="flex flex-col justify-between h-full">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                  STRUCTURAL RESERVE INDEX
                </span>
                
                <div className="flex items-baseline gap-4 mt-2">
                  <span 
                    className="text-5xl font-mono font-bold tabular-nums tracking-tight"
                    style={{ color: riskColor }}
                  >
                    {snapshot.sri_value.toFixed(4)}
                  </span>
                  
                  <div 
                    className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider"
                    style={{ 
                      backgroundColor: `${riskColor}15`,
                      color: riskColor,
                      border: `1px solid ${riskColor}30`
                    }}
                  >
                    {riskCategory}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-[10px] font-mono text-gray-600">
                <span>v{snapshot.version}</span>
                <span className="text-gray-800">|</span>
                <span>{snapshot.prev_hash === "GENESIS" ? "GENESIS" : snapshot.prev_hash?.slice(0, 8)}...</span>
              </div>
            </div>
            
            {/* Right: Chart */}
            <div className="flex-1 ml-8 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono text-gray-600 uppercase">Historical Trend</span>
                <span className="text-[9px] font-mono text-gray-600">{history.length} snapshots</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <SRIChart data={sriHistory} width={380} height={180} />
              </div>
            </div>
          </div>
        </div>
        
        {/* ═══════════════════════════════════════════════════════════════════
            COMPONENT BREAKDOWN (4 cards with sparklines)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <ComponentCard 
            name="Yield Spread" 
            score={snapshot.spread_score}
            weight="35%"
            source="DGS10 - DGS2"
            history={spreadHistory}
          />
          <ComponentCard 
            name="Inflation" 
            score={snapshot.inflation_score}
            weight="25%"
            source="CPIAUCSL YoY"
            history={inflationHistory}
          />
          <ComponentCard 
            name="Rate Pressure" 
            score={snapshot.rate_score}
            weight="20%"
            source="FEDFUNDS"
            history={rateHistory}
          />
          <ComponentCard 
            name="Liquidity" 
            score={snapshot.liquidity_score}
            weight="20%"
            source="M2SL YoY"
            history={liquidityHistory}
          />
        </div>
        
        {/* ═══════════════════════════════════════════════════════════════════
            INTEGRITY LEDGER (fixed height)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl overflow-hidden h-[220px]">
          <div className="px-4 py-2 border-b border-[#1A1A1A] flex items-center justify-between h-[40px]">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-gray-600" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                Integrity Ledger
              </span>
            </div>
            <span className="text-[9px] font-mono text-gray-600">
              Last 5 verified
            </span>
          </div>
          
          <div className="divide-y divide-[#141414] h-[180px] overflow-hidden">
            {(history.length > 0 ? history.slice(0, 5) : [snapshot]).map((snap, idx) => (
              <LedgerEntry 
                key={snap.id || idx} 
                snapshot={snap} 
                isLatest={idx === 0}
              />
            ))}
          </div>
        </div>
        
        {/* ═══════════════════════════════════════════════════════════════════
            STATUS BAR (fixed height)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl px-4 py-2 h-[48px]">
          <div className="flex items-center justify-between h-full">
            {/* State pill */}
            <div 
              className="flex items-center gap-2 px-2 py-1 rounded"
              style={{ 
                backgroundColor: `${meta.color}10`,
                border: `1px solid ${meta.color}30`
              }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <span 
                className="text-[10px] font-mono font-medium uppercase"
                style={{ color: meta.color }}
              >
                {meta.label}
              </span>
            </div>
            
            {/* Last update */}
            <div className="flex items-center gap-1.5 text-gray-500">
              <Clock className="h-3 w-3" />
              <span className="text-[10px] font-mono">
                {lastUpdate} UTC
              </span>
            </div>
            
            {/* Key ID */}
            <div className="flex items-center gap-1.5 text-gray-600">
              <Key className="h-3 w-3" />
              <span className="text-[9px] font-mono">
                {snapshot.public_key_id}
              </span>
            </div>
            
            {/* Verify link */}
            <a 
              href="/scanner"
              className="flex items-center gap-1 text-[10px] font-mono text-[hsl(43,25%,55%)] hover:text-[hsl(43,25%,65%)] transition-colors"
            >
              <span>VERIFY</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
        
      </div>
    </div>
  )
}
