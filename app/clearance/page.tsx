"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const RISK_DOMAINS = [
  "Sovereign Risk", "Structural Integrity", "Governance Audit",
  "Reserve Monitoring", "Systemic Contagion", "Regional Intelligence",
]

export default function ClearancePage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestHash, setRequestHash] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const institution = fd.get("institution") as string
    const jurisdiction = fd.get("jurisdiction") as string
    const aum = fd.get("aum") as string
    const risk_domain = fd.get("risk_domain") as string
    const intended_use = fd.get("intended_use") as string
    const email = fd.get("email") as string

    // Generate request hash
    const encoder = new TextEncoder()
    const data = encoder.encode(`${institution}:${email}:${Date.now()}`)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hash = "0x" + hashArray.slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join("")

    try {
      const res = await fetch("/api/clearance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institution,
          jurisdiction,
          aum,
          risk_domain,
          intended_use,
          email,
          request_hash: hash,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Submission failed")
      setRequestHash(hash)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 pt-24 md:pt-28 pb-16 px-6">
        <div className="mx-auto max-w-2xl">
          <div className="text-[10px] text-gold tracking-[0.2em] uppercase mb-2">Institutional Access</div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-2 text-balance">
            Request Clearance
          </h1>
          <p className="text-sm text-muted mb-10 max-w-lg">
            Submit an institutional access request. All requests are reviewed
            against clearance criteria and jurisdictional compliance requirements.
          </p>

          {submitted ? (
            <div className="border border-border p-8">
              <div className="text-[10px] text-gold tracking-[0.2em] uppercase mb-4">Request Submitted</div>
              <div className="text-sm text-foreground mb-2">
                Your clearance request has been received and queued for review.
              </div>
              <div className="text-xs text-muted mb-4">
                You will be contacted at the provided email address once your request
                has been processed through the institutional verification pipeline.
              </div>
              <div className="border border-border p-3 mb-6">
                <div className="text-[10px] text-muted tracking-wider uppercase mb-1">Request Hash</div>
                <div className="text-xs text-gold font-mono">{requestHash}</div>
              </div>
              <button
                onClick={() => { setSubmitted(false); setRequestHash(""); setError(null) }}
                className="text-xs tracking-wider uppercase px-4 py-2 border border-border text-muted hover:text-foreground hover:bg-surface transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="border border-border">
              <div className="p-6 flex flex-col gap-5">
                {error && (
                  <div className="border border-danger p-3">
                    <span className="text-xs text-danger">{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] text-muted tracking-wider uppercase mb-1.5">
                    Institution Name
                  </label>
                  <input
                    name="institution"
                    type="text"
                    required
                    placeholder="Legal entity name"
                    className="w-full bg-surface border border-border text-foreground text-sm px-3 py-2.5 outline-none focus:border-gold placeholder:text-muted/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-muted tracking-wider uppercase mb-1.5">
                    Jurisdiction
                  </label>
                  <input
                    name="jurisdiction"
                    type="text"
                    required
                    placeholder="Primary regulatory jurisdiction"
                    className="w-full bg-surface border border-border text-foreground text-sm px-3 py-2.5 outline-none focus:border-gold placeholder:text-muted/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-muted tracking-wider uppercase mb-1.5">
                    Assets Under Management
                  </label>
                  <input
                    name="aum"
                    type="text"
                    required
                    placeholder="e.g. $500M - $1B"
                    className="w-full bg-surface border border-border text-foreground text-sm px-3 py-2.5 outline-none focus:border-gold placeholder:text-muted/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-muted tracking-wider uppercase mb-1.5">
                    Risk Domain
                  </label>
                  <select
                    name="risk_domain"
                    required
                    className="w-full bg-surface border border-border text-foreground text-sm px-3 py-2.5 outline-none focus:border-gold"
                  >
                    <option value="">Select primary risk domain</option>
                    {RISK_DOMAINS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-muted tracking-wider uppercase mb-1.5">
                    Intended Use
                  </label>
                  <textarea
                    name="intended_use"
                    required
                    rows={3}
                    placeholder="Describe the intended use of institutional access"
                    className="w-full bg-surface border border-border text-foreground text-sm px-3 py-2.5 outline-none focus:border-gold resize-none placeholder:text-muted/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-muted tracking-wider uppercase mb-1.5">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="institutional.contact@example.com"
                    className="w-full bg-surface border border-border text-foreground text-sm px-3 py-2.5 outline-none focus:border-gold placeholder:text-muted/50"
                  />
                </div>
              </div>

              <div className="border-t border-border p-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`text-xs tracking-wider uppercase px-6 py-2.5 font-medium transition-colors ${
                    submitting
                      ? "bg-surface text-muted border border-border"
                      : "bg-gold text-background hover:bg-gold-dim"
                  }`}
                >
                  {submitting ? "Submitting..." : "Request Institutional Access"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
