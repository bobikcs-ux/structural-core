"use client"

/**
 * Access Page - Institutional Clearance Form
 * Request access to premium institutional features
 */

import { useState } from "react"
import { 
  KeyRound, 
  Building2, 
  Mail, 
  User, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Lock,
  Globe,
  FileText
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

type InstitutionType = "HEDGE_FUND" | "ASSET_MANAGER" | "BANK" | "EXCHANGE" | "OTHER"

interface FormData {
  name: string
  email: string
  institution: string
  institutionType: InstitutionType | ""
  role: string
  useCase: string
  aum: string
  region: string
}

// ============================================================================
// Main Component
// ============================================================================

export default function AccessPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    institution: "",
    institutionType: "",
    role: "",
    useCase: "",
    aum: "",
    region: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setSubmitted(true)
  }

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[hsl(0,0%,2%)] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-[hsl(142,76%,46%)]/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[hsl(142,76%,46%)]" />
          </div>
          <h1 className="text-2xl font-mono font-bold text-[hsl(0,0%,90%)] mb-4">
            REQUEST SUBMITTED
          </h1>
          <p className="text-sm font-mono text-[hsl(0,0%,50%)] mb-8">
            Your clearance request has been received. Our institutional team will review
            your application and respond within 2-3 business days.
          </p>
          <div className="p-4 bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg mb-8">
            <div className="text-[10px] font-mono text-[hsl(0,0%,40%)] uppercase mb-2">
              Reference ID
            </div>
            <code className="text-sm font-mono text-[hsl(43,25%,55%)]">
              CLR-{Date.now().toString(36).toUpperCase()}
            </code>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(43,25%,55%)] text-[hsl(0,0%,2%)] font-mono text-sm font-medium rounded hover:bg-[hsl(43,25%,45%)] transition-colors"
          >
            RETURN TO HOME
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(0,0%,2%)] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-full mb-6">
            <KeyRound className="w-4 h-4 text-[hsl(43,25%,55%)]" />
            <span className="text-[10px] font-mono tracking-wider text-[hsl(0,0%,60%)]">
              RESTRICTED ACCESS
            </span>
          </div>
          <h1 className="text-3xl font-mono font-bold text-[hsl(0,0%,90%)] mb-4">
            INSTITUTIONAL CLEARANCE
          </h1>
          <p className="text-sm font-mono text-[hsl(0,0%,50%)]">
            Request access to premium data feeds and advanced analytics
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Shield, title: "Priority Access", desc: "Dedicated API endpoints" },
            { icon: FileText, title: "Full Reports", desc: "Complete analysis documents" },
            { icon: Lock, title: "Private Channel", desc: "Direct support line" },
          ].map((benefit, idx) => (
            <div
              key={idx}
              className="p-4 bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg"
            >
              <benefit.icon className="w-5 h-5 text-[hsl(43,25%,55%)] mb-3" />
              <div className="text-sm font-mono text-[hsl(0,0%,90%)] mb-1">
                {benefit.title}
              </div>
              <div className="text-[10px] font-mono text-[hsl(0,0%,50%)]">
                {benefit.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg p-6">
            <h2 className="text-sm font-mono text-[hsl(0,0%,50%)] uppercase tracking-wider mb-6">
              Personal Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-[10px] font-mono text-[hsl(0,0%,40%)] uppercase mb-2">
                  <User className="w-3 h-3" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full px-4 py-3 bg-[hsl(0,0%,3%)] border border-[hsl(0,0%,10%)] rounded text-sm font-mono text-[hsl(0,0%,90%)] placeholder:text-[hsl(0,0%,30%)] focus:outline-none focus:border-[hsl(43,25%,55%)]/30"
                  placeholder="John Smith"
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-[10px] font-mono text-[hsl(0,0%,40%)] uppercase mb-2">
                  <Mail className="w-3 h-3" />
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full px-4 py-3 bg-[hsl(0,0%,3%)] border border-[hsl(0,0%,10%)] rounded text-sm font-mono text-[hsl(0,0%,90%)] placeholder:text-[hsl(0,0%,30%)] focus:outline-none focus:border-[hsl(43,25%,55%)]/30"
                  placeholder="john@institution.com"
                />
              </div>
            </div>
          </div>

          <div className="bg-[hsl(0,0%,4%)] border border-[hsl(0,0%,12%)] rounded-lg p-6">
            <h2 className="text-sm font-mono text-[hsl(0,0%,50%)] uppercase tracking-wider mb-6">
              Institution Details
            </h2>

            <div className="space-y-4">
              {/* Institution Name */}
              <div>
                <label className="flex items-center gap-2 text-[10px] font-mono text-[hsl(0,0%,40%)] uppercase mb-2">
                  <Building2 className="w-3 h-3" />
                  Institution Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.institution}
                  onChange={(e) => updateField("institution", e.target.value)}
                  className="w-full px-4 py-3 bg-[hsl(0,0%,3%)] border border-[hsl(0,0%,10%)] rounded text-sm font-mono text-[hsl(0,0%,90%)] placeholder:text-[hsl(0,0%,30%)] focus:outline-none focus:border-[hsl(43,25%,55%)]/30"
                  placeholder="Acme Capital Management"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Institution Type */}
                <div>
                  <label className="text-[10px] font-mono text-[hsl(0,0%,40%)] uppercase mb-2 block">
                    Institution Type
                  </label>
                  <select
                    required
                    value={formData.institutionType}
                    onChange={(e) => updateField("institutionType", e.target.value)}
                    className="w-full px-4 py-3 bg-[hsl(0,0%,3%)] border border-[hsl(0,0%,10%)] rounded text-sm font-mono text-[hsl(0,0%,90%)] focus:outline-none focus:border-[hsl(43,25%,55%)]/30"
                  >
                    <option value="">Select type...</option>
                    <option value="HEDGE_FUND">Hedge Fund</option>
                    <option value="ASSET_MANAGER">Asset Manager</option>
                    <option value="BANK">Bank / Financial Institution</option>
                    <option value="EXCHANGE">Exchange / Trading Venue</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Role */}
                <div>
                  <label className="text-[10px] font-mono text-[hsl(0,0%,40%)] uppercase mb-2 block">
                    Your Role
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => updateField("role", e.target.value)}
                    className="w-full px-4 py-3 bg-[hsl(0,0%,3%)] border border-[hsl(0,0%,10%)] rounded text-sm font-mono text-[hsl(0,0%,90%)] placeholder:text-[hsl(0,0%,30%)] focus:outline-none focus:border-[hsl(43,25%,55%)]/30"
                    placeholder="Portfolio Manager"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* AUM */}
                <div>
                  <label className="text-[10px] font-mono text-[hsl(0,0%,40%)] uppercase mb-2 block">
                    AUM Range
                  </label>
                  <select
                    value={formData.aum}
                    onChange={(e) => updateField("aum", e.target.value)}
                    className="w-full px-4 py-3 bg-[hsl(0,0%,3%)] border border-[hsl(0,0%,10%)] rounded text-sm font-mono text-[hsl(0,0%,90%)] focus:outline-none focus:border-[hsl(43,25%,55%)]/30"
                  >
                    <option value="">Select range...</option>
                    <option value="<100M">Under $100M</option>
                    <option value="100M-500M">$100M - $500M</option>
                    <option value="500M-1B">$500M - $1B</option>
                    <option value="1B-10B">$1B - $10B</option>
                    <option value=">10B">Over $10B</option>
                  </select>
                </div>

                {/* Region */}
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-mono text-[hsl(0,0%,40%)] uppercase mb-2">
                    <Globe className="w-3 h-3" />
                    Primary Region
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => updateField("region", e.target.value)}
                    className="w-full px-4 py-3 bg-[hsl(0,0%,3%)] border border-[hsl(0,0%,10%)] rounded text-sm font-mono text-[hsl(0,0%,90%)] focus:outline-none focus:border-[hsl(43,25%,55%)]/30"
                  >
                    <option value="">Select region...</option>
                    <option value="NA">North America</option>
                    <option value="EU">Europe</option>
                    <option value="APAC">Asia Pacific</option>
                    <option value="LATAM">Latin America</option>
                    <option value="MEA">Middle East & Africa</option>
                  </select>
                </div>
              </div>

              {/* Use Case */}
              <div>
                <label className="text-[10px] font-mono text-[hsl(0,0%,40%)] uppercase mb-2 block">
                  Intended Use Case
                </label>
                <textarea
                  rows={4}
                  value={formData.useCase}
                  onChange={(e) => updateField("useCase", e.target.value)}
                  className="w-full px-4 py-3 bg-[hsl(0,0%,3%)] border border-[hsl(0,0%,10%)] rounded text-sm font-mono text-[hsl(0,0%,90%)] placeholder:text-[hsl(0,0%,30%)] focus:outline-none focus:border-[hsl(43,25%,55%)]/30 resize-none"
                  placeholder="Describe how you plan to use Structural Core data..."
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono text-[hsl(0,0%,40%)]">
              By submitting, you agree to our terms of service
            </p>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-[hsl(43,25%,55%)] text-[hsl(0,0%,2%)] font-mono text-sm font-medium rounded hover:bg-[hsl(43,25%,45%)] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[hsl(0,0%,2%)]/30 border-t-[hsl(0,0%,2%)] rounded-full animate-spin" />
                  PROCESSING...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  REQUEST CLEARANCE
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
