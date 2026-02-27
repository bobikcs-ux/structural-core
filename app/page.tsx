/**
 * Landing Page - Institutional Positioning
 * Black/Gold minimal design with institutional messaging
 */

import { Shield, Activity, Lock, Zap, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

// ============================================================================
// Feature Card Component
// ============================================================================

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType
  title: string
  description: string 
}) {
  return (
    <div className="group p-6 bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg hover:border-[hsl(45,90%,50%)]/30 transition-all duration-300">
      <div className="w-10 h-10 rounded bg-[hsl(45,90%,50%)]/10 flex items-center justify-center mb-4 group-hover:bg-[hsl(45,90%,50%)]/20 transition-colors">
        <Icon className="w-5 h-5 text-[hsl(45,90%,50%)]" />
      </div>
      <h3 className="text-sm font-mono tracking-wide text-[hsl(45,20%,95%)] mb-2">
        {title}
      </h3>
      <p className="text-xs font-mono text-[hsl(0,0%,50%)] leading-relaxed">
        {description}
      </p>
    </div>
  )
}

// ============================================================================
// Stat Card Component
// ============================================================================

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-mono font-bold text-[hsl(45,90%,50%)] mb-1">
        {value}
      </div>
      <div className="text-[10px] font-mono tracking-wider text-[hsl(0,0%,50%)] uppercase">
        {label}
      </div>
    </div>
  )
}

// ============================================================================
// Main Landing Page
// ============================================================================

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(0,0%,2%)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(45,90%,50%)]/5 via-transparent to-transparent" />
        
        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20">
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(142,76%,46%)] animate-pulse" />
              <span className="text-[10px] font-mono tracking-wider text-[hsl(0,0%,60%)]">
                CRYPTOGRAPHICALLY VERIFIED
              </span>
            </div>
          </div>
          
          <h1 className="text-center mb-6">
            <span className="block text-4xl md:text-5xl lg:text-6xl font-mono font-bold tracking-tight text-[hsl(45,20%,95%)] mb-4">
              STRUCTURAL CORE
            </span>
            <span className="block text-lg md:text-xl font-mono text-[hsl(45,90%,50%)]">
              Institutional Intelligence Infrastructure
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-center text-sm font-mono text-[hsl(0,0%,50%)] leading-relaxed mb-12">
            Real-time macroeconomic integrity verification for prediction markets.
            Ed25519 signed data feeds with deterministic SRI computation.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/intelligence"
              className="flex items-center gap-2 px-6 py-3 bg-[hsl(45,90%,50%)] text-[hsl(0,0%,2%)] font-mono text-sm font-medium rounded hover:bg-[hsl(45,90%,55%)] transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span>VIEW INTELLIGENCE</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/scanner"
              className="flex items-center gap-2 px-6 py-3 bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] text-[hsl(45,20%,95%)] font-mono text-sm rounded hover:border-[hsl(45,90%,50%)]/30 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>VERIFY INTEGRITY</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-[hsl(0,0%,12%)] bg-[hsl(0,0%,3%)]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value="7" label="FRED Series" />
            <StatCard value="256" label="Bit Signatures" />
            <StatCard value="<16ms" label="Verification" />
            <StatCard value="100%" label="Chain Integrity" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-mono font-bold text-[hsl(45,20%,95%)] mb-4">
            INSTITUTIONAL GRADE
          </h2>
          <p className="text-sm font-mono text-[hsl(0,0%,50%)]">
            Built for verification, not trust
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            icon={Activity}
            title="SRI ENGINE"
            description="Deterministic Structural Reserve Index computation from 7 FRED macroeconomic series."
          />
          <FeatureCard
            icon={Shield}
            title="ED25519 SIGNED"
            description="Every snapshot cryptographically signed with Ed25519 for client-side verification."
          />
          <FeatureCard
            icon={Lock}
            title="HASH CHAIN"
            description="Immutable chain of integrity hashes ensures tamper-evident data provenance."
          />
          <FeatureCard
            icon={Zap}
            title="REAL-TIME SSE"
            description="Server-Sent Events deliver live updates with automatic integrity verification."
          />
        </div>
      </section>

      {/* Architecture Section */}
      <section className="border-t border-[hsl(0,0%,12%)] bg-[hsl(0,0%,3%)]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-mono font-bold text-[hsl(45,20%,95%)] mb-6">
                VERIFICATION PIPELINE
              </h2>
              <div className="space-y-4">
                {[
                  "FRED API ingestion with rate limiting",
                  "Canonical string construction (version|ts|sri|...)",
                  "SHA-256 integrity hash computation",
                  "Ed25519 signature generation (server-side)",
                  "Client-side verification in <16ms",
                  "State machine transition (LIVE/DEGRADED/UNTRUSTED)",
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-[hsl(45,90%,50%)] mt-0.5 flex-shrink-0" />
                    <span className="text-xs font-mono text-[hsl(0,0%,60%)]">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg p-6">
              <div className="text-[10px] font-mono text-[hsl(0,0%,40%)] mb-4">CANONICAL FORMAT</div>
              <pre className="text-[11px] font-mono text-[hsl(45,90%,50%)] leading-relaxed overflow-x-auto">
{`"{version}|{ts}|{sri}|{spread}|
{inflation}|{rate}|{liquidity}|
{prev_hash}"`}
              </pre>
              <div className="mt-6 pt-6 border-t border-[hsl(0,0%,12%)]">
                <div className="text-[10px] font-mono text-[hsl(0,0%,40%)] mb-2">SRI FORMULA</div>
                <pre className="text-[10px] font-mono text-[hsl(0,0%,60%)]">
{`SRI = 0.35*spread + 0.25*inflation
    + 0.20*rate + 0.20*liquidity`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(0,0%,12%)]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-[hsl(45,90%,50%)] flex items-center justify-center">
                <span className="text-[hsl(0,0%,2%)] font-mono font-bold text-[10px]">SC</span>
              </div>
              <span className="text-[10px] font-mono tracking-wider text-[hsl(0,0%,40%)]">
                STRUCTURAL CORE v3.0
              </span>
            </div>
            <div className="text-[10px] font-mono text-[hsl(0,0%,40%)]">
              BOBIKCS SRI PROTOCOL
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
