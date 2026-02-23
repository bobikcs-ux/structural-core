"use client"

import { useState, useCallback, useTransition } from "react"
import { motion } from "framer-motion"
import { QUESTIONS, calculateScores, getVerdict } from "@/lib/scanner-data"
import { submitScanResult } from "@/app/actions/scanner"
import { StepIndicator } from "./step-indicator"
import { QuestionCard } from "./question-card"
import { ResultsPanel } from "./results-panel"
import { ScanFeed } from "./scan-feed"

type Phase = "intake" | "scan" | "saving" | "results"
type Status = "IDLE" | "SCANNING" | "SAVING" | "COMPLETED" | "ERROR"

// ── Pulsing Border Wrapper ───────────────────────────────────────────────────

function PulsingBorder({
  active,
  children,
}: {
  active: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      {active && (
        <motion.div
          className="absolute inset-0 border-2 border-gold pointer-events-none"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {children}
    </div>
  )
}

// ── Main StructuralCore Component ────────────────────────────────────────────

export function IntegrityScanner({ onScanComplete }: { onScanComplete?: () => void } = {}) {
  const [phase, setPhase] = useState<Phase>("intake")
  const [status, setStatus] = useState<Status>("IDLE")
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [email, setEmail] = useState("")
  const [objective, setObjective] = useState("")
  const [inputErrors, setInputErrors] = useState<{ email?: string; objective?: string }>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [scanResultId, setScanResultId] = useState<string | null>(null)
  const [showGlitch, setShowGlitch] = useState(false)
  const [feedRefreshKey, setFeedRefreshKey] = useState(0)
  const [, startTransition] = useTransition()

  // ── Intake Validation (client-side quick check) ──

  const validateIntake = (): boolean => {
    const errors: { email?: string; objective?: string } = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email.trim()) {
      errors.email = "EMAIL REQUIRED"
    } else if (!emailRegex.test(email)) {
      errors.email = "INVALID EMAIL FORMAT"
    }

    if (!objective.trim()) {
      errors.objective = "OBJECTIVE REQUIRED"
    } else if (objective.trim().length < 10) {
      errors.objective = "MINIMUM 10 CHARACTERS"
    }

    setInputErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleStartScan = () => {
    if (!validateIntake()) return
    setPhase("scan")
    setStatus("SCANNING")
  }

  // ── Scan Handlers ──

  const handleSelect = useCallback((questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }, [])

  const handleNext = useCallback(() => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep])

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const handleComplete = useCallback(() => {
    const scores = calculateScores(answers)
    const verdict = getVerdict(scores.integrity)

    setPhase("saving")
    setStatus("SAVING")
    setSaveError(null)

    startTransition(async () => {
      const result = await submitScanResult({
        email,
        objective,
        signal_score: scores.signal,
        automation_score: scores.automation,
        authority_score: scores.authority,
        integrity_score: scores.integrity,
        facade_score: scores.facade,
        verdict_title: verdict.title,
      })

      if (result.success) {
        setStatus("COMPLETED")
        setScanResultId(result.data?.id || null)
        setShowGlitch(true)
        setFeedRefreshKey((k) => k + 1)
        onScanComplete?.()
        setTimeout(() => {
          setShowGlitch(false)
          setPhase("results")
        }, 1500)
      } else {
        setStatus("ERROR")
        setSaveError(result.error || "Failed to save scan.")
        setPhase("results")
      }
    })
  }, [answers, email, objective, onScanComplete])

  const handleReset = useCallback(() => {
    setPhase("intake")
    setStatus("IDLE")
    setCurrentStep(0)
    setAnswers({})
    setEmail("")
    setObjective("")
    setInputErrors({})
    setSaveError(null)
    setScanResultId(null)
    setShowGlitch(false)
  }, [])

  const scores = phase === "results" || phase === "saving" ? calculateScores(answers) : null
  const isScanning = status === "SCANNING"

  return (
    <div className="flex flex-col bg-terminal-black">


      {/* ── Phase: INTAKE ── */}
      {phase === "intake" && (
        <main className="flex flex-col px-4 sm:px-6 py-6 sm:py-10">
          <div className="max-w-xl w-full mx-auto flex flex-col gap-6 animate-fade-in">
            {/* Intake Module */}
            <div className="border border-terminal-line p-4 sm:p-8">
              {/* Terminal prompt */}
              <div className="font-mono text-xs text-muted-foreground mb-4 sm:mb-6">
                <span className="text-gold">root@monolith</span>
                <span className="text-muted-foreground">:</span>
                <span className="text-foreground">~</span>
                <span className="text-muted-foreground">$ </span>
                <span className="text-foreground">./structural-core --init</span>
                <span className="cursor-blink text-gold ml-0.5">_</span>
              </div>

              <h2 className="font-sans text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4 leading-relaxed">
                The Integrity Scanner
              </h2>

              <p className="font-mono text-xs text-muted-foreground leading-6 mb-6">
                Evaluates structural integrity across Signal Depth, System
                Automation, and Structural Authority. Distinguishes foundation from facade.
              </p>

              {/* Category Display */}
              <div className="border-t border-terminal-line pt-3 mb-6">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div>
                    <div className="font-mono text-xs text-gold mb-1">SIG</div>
                    <div className="font-mono text-xs text-muted-foreground hidden sm:block">Signal Depth</div>
                  </div>
                  <div>
                    <div className="font-mono text-xs text-gold mb-1">AUT</div>
                    <div className="font-mono text-xs text-muted-foreground hidden sm:block">System Automation</div>
                  </div>
                  <div>
                    <div className="font-mono text-xs text-gold mb-1">STR</div>
                    <div className="font-mono text-xs text-muted-foreground hidden sm:block">Structural Authority</div>
                  </div>
                </div>
              </div>

              {/* Email Input */}
              <div className="mb-4">
                <label
                  htmlFor="scan-email"
                  className="font-mono text-xs text-muted-foreground tracking-widest mb-2 block"
                >
                  {">"} OPERATOR_EMAIL
                </label>
                <input
                  id="scan-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (inputErrors.email) setInputErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  placeholder="operator@domain.com"
                  className="w-full bg-transparent border border-terminal-line px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none transition-colors"
                  autoComplete="email"
                />
                {inputErrors.email && (
                  <span className="font-mono text-xs text-red-500 mt-1 block">
                    [ERR] {inputErrors.email}
                  </span>
                )}
              </div>

              {/* Objective Input */}
              <div className="mb-6">
                <label
                  htmlFor="scan-objective"
                  className="font-mono text-xs text-muted-foreground tracking-widest mb-2 block"
                >
                  {">"} SCAN_OBJECTIVE
                </label>
                <textarea
                  id="scan-objective"
                  value={objective}
                  onChange={(e) => {
                    setObjective(e.target.value)
                    if (inputErrors.objective)
                      setInputErrors((prev) => ({ ...prev, objective: undefined }))
                  }}
                  placeholder="Describe the purpose of this structural scan (min 10 chars)..."
                  rows={3}
                  className="w-full bg-transparent border border-terminal-line px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none transition-colors resize-none"
                />
                <div className="flex items-center justify-between mt-1">
                  {inputErrors.objective ? (
                    <span className="font-mono text-xs text-red-500">
                      [ERR] {inputErrors.objective}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="font-mono text-xs text-muted-foreground">
                    {objective.length}/500
                  </span>
                </div>
              </div>

              {/* Initialize Button */}
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-xs text-muted-foreground">
                  {QUESTIONS.length} QUERIES | ~3 MIN
                </span>
                <button
                  type="button"
                  onClick={handleStartScan}
                  className="font-mono text-xs tracking-wider px-4 sm:px-6 py-3 border border-gold bg-gold text-terminal-black hover:bg-gold-bright transition-colors shrink-0"
                >
                  INITIALIZE SCAN {">>"}
                </button>
              </div>
            </div>

            {/* Module 04 - Live Feed */}
            <ScanFeed refreshKey={feedRefreshKey} />

            {/* System status */}
            <div className="font-mono text-xs text-muted-foreground hidden sm:flex items-center gap-2">
              <div className="h-1.5 w-1.5 bg-gold" />
              <span>All systems operational. Awaiting user input.</span>
            </div>
          </div>
        </main>
      )}

      {/* ── Phase: SCAN ── */}
      {phase === "scan" && (
        <main className="flex flex-col">
          <StepIndicator
            currentStep={currentStep}
            totalSteps={QUESTIONS.length}
            answers={answers}
          />
          <PulsingBorder active={isScanning}>
            <div>
              <div className="max-w-3xl w-full mx-auto">
                <QuestionCard
                  key={QUESTIONS[currentStep].id}
                  question={QUESTIONS[currentStep]}
                  selectedValue={answers[QUESTIONS[currentStep].id]}
                  onSelect={handleSelect}
                  onNext={handleNext}
                  onPrev={handlePrev}
                  isFirst={currentStep === 0}
                  isLast={currentStep === QUESTIONS.length - 1}
                  onComplete={handleComplete}
                />
              </div>
            </div>
          </PulsingBorder>
        </main>
      )}

      {/* ── Phase: SAVING (transition screen) ── */}
      {phase === "saving" && (
        <main className="flex flex-col items-center justify-center px-4 py-20">
          {!showGlitch ? (
            <div className="flex flex-col items-center gap-6">
              <div className="border border-gold p-8">
                <div className="font-mono text-xs text-gold tracking-widest mb-3">
                  COMMITTING SCAN DATA
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 border border-gold"
                    />
                  ))}
                </div>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                WRITING TO STRUCTURAL DATABASE...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="border border-gold p-8">
                <div className="font-mono text-2xl font-bold text-gold tracking-widest">
                  SCAN COMMITTED
                </div>
              </div>
              <span className="font-mono text-xs text-gold">
                REDIRECTING TO RESULTS...
              </span>
            </div>
          )}
        </main>
      )}

      {/* ── Phase: RESULTS ── */}
      {phase === "results" && scores && (
        <main className="pb-safe">
          <div className="max-w-3xl w-full mx-auto">
            {saveError && (
              <div className="mx-6 mt-6 border border-red-500/50 bg-red-500/5 px-4 py-3">
                <span className="font-mono text-xs text-red-500">
                  [WARN] {saveError} — Results shown locally.
                </span>
              </div>
            )}
            <ResultsPanel scores={scores} onReset={handleReset} scanResultId={scanResultId} email={email} />
          </div>
        </main>
      )}

    </div>
  )
}
