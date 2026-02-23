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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
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
            <div className="border border-border p-8 text-center">
              <div className="text-[10px] text-gold tracking-[0.2em] uppercase mb-3">Request Submitted</div>
              <div className="text-sm text-foreground mb-2">
                Your clearance request has been received and queued for review.
              </div>
              <div className="text-xs text-muted">
                You will be contacted at the provided email address once your request
                has been processed through the institutional verification pipeline.
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-xs tracking-wider uppercase px-4 py-2 border border-border text-muted hover:text-foreground hover:bg-surface transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="border border-border">
              <div className="p-6 flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] text-muted tracking-wider uppercase mb-1.5">
                    Institution Name
                  </label>
                  <input
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
                  className="text-xs tracking-wider uppercase px-6 py-2.5 bg-gold text-background font-medium hover:bg-gold-dim transition-colors"
                >
                  Request Institutional Access
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
