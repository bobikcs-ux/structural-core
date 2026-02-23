"use client"

import React from "react"
import { useEffect, useState } from "react"
import { CATEGORIES, getVerdict } from "@/lib/scanner-data"
import { IntegrityRadar } from "./integrity-radar"
import { generatePDF } from "@/lib/generate-pdf"
import { uploadPdfAction } from "@/app/actions/scanner"

interface ResultsPanelProps {
  scores: {
    signal: number
    automation: number
    authority: number
    integrity: number
    facade: number
  }
  onReset: () => void
  scanResultId?: string | null
  email?: string
}

function AnimatedScore({ target, delay = 0 }: { target: number; delay?: number }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      let frame = 0
      const totalFrames = 40
      const interval = setInterval(() => {
        frame++
        const progress = frame / totalFrames
        const eased = 1 - Math.pow(1 - progress, 3)
        setCurrent(Math.round(target * eased))
        if (frame >= totalFrames) clearInterval(interval)
      }, 25)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timer)
  }, [target, delay])

  return <span>{current}</span>
}

export function ResultsPanel({ scores, onReset, scanResultId, email }: ResultsPanelProps) {
  const verdict = getVerdict(scores.integrity)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "done" | "error"
  >("idle")
  const [archivedUrl, setArchivedUrl] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowResults(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const [pdfError, setPdfError] = useState(false)

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    setPdfError(false)
    setUploadStatus("idle")
    setArchivedUrl(null)
    try {
      const blob = await generatePDF(scores, verdict)

      // Upload to Supabase Storage via Server Action (FormData)
      if (blob && scanResultId) {
        setUploadStatus("uploading")
        try {
          // Build filename: report-[timestamp]-[email].pdf
          const sanitizedEmail = (email || "unknown")
            .replace(/[^a-zA-Z0-9@._-]/g, "")
            .replace(/@/g, "_at_")
          const fileName = `report-${Date.now()}-${sanitizedEmail}.pdf`

          // Wrap blob into a File, then into FormData
          const file = new File([blob], fileName, { type: "application/pdf" })
          const formData = new FormData()
          formData.append("file", file)

          const result = await uploadPdfAction(formData, scanResultId)

          if (result.success && result.url) {
            setUploadStatus("done")
            setArchivedUrl(result.url)
          } else {
            setUploadStatus("error")
          }
        } catch (uploadErr) {
          console.error("[v0] PDF upload error:", uploadErr)
          setUploadStatus("error")
        }
      }
    } catch (err) {
      console.error("[v0] PDF download error:", err)
      setPdfError(true)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!showResults) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="font-mono text-xs text-gold tracking-widest">PROCESSING SCAN DATA</div>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 h-2 border border-gold cursor-blink"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  const categoryEntries = [
    { key: "signal" as const, score: scores.signal },
    { key: "automation" as const, score: scores.automation },
    { key: "authority" as const, score: scores.authority },
  ]

  return (
    <div className="animate-fade-in">
      <div className="px-6 py-8">
        {/* Integrity Score Header */}
        <div className="border border-gold p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-muted-foreground tracking-widest mb-2">
                INTEGRITY SCORE
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-5xl font-bold text-gold">
                  <AnimatedScore target={scores.integrity} />
                </span>
                <span className="font-mono text-xl text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs text-gold tracking-widest mb-1">
                CLASSIFICATION
              </div>
              <div className="font-mono text-sm text-foreground">{verdict.title}</div>
            </div>
          </div>

          {/* Score bar */}
          <div className="mt-6 relative">
            <div className="h-1 bg-terminal-line">
              <div
                className="h-1 bg-gold progress-fill"
                style={{ "--progress-width": `${scores.integrity}%` } as React.CSSProperties}
              />
            </div>
            <div className="flex justify-between mt-2 font-mono text-xs text-muted-foreground">
              <span>FACADE</span>
              <span>FOUNDATION</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {categoryEntries.map(({ key, score }, i) => (
            <div key={key} className="border border-terminal-line p-4">
              <div className="font-mono text-xs text-gold tracking-wider mb-1">
                {CATEGORIES[key].code}
              </div>
              <div className="font-mono text-xs text-muted-foreground tracking-wider mb-3 uppercase">
                {CATEGORIES[key].label}
              </div>
              <div className="font-mono text-3xl font-bold text-foreground mb-3">
                <AnimatedScore target={score} delay={200 + i * 150} />
                <span className="text-sm text-muted-foreground ml-1">%</span>
              </div>
              <div className="h-0.5 bg-terminal-line">
                <div
                  className="h-0.5 bg-gold progress-fill"
                  style={{
                    "--progress-width": `${score}%`,
                    animationDelay: `${200 + i * 150}ms`,
                  } as React.CSSProperties}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Radar Chart */}
        <div className="mb-8">
          <IntegrityRadar scores={scores} />
        </div>

        {/* Verdict */}
        <div className="border border-terminal-line p-6 mb-8">
          <h3 className="font-mono text-xs tracking-widest text-gold mb-4 uppercase">
            Diagnostic Summary
          </h3>
          <p className="font-mono text-xs text-foreground leading-6 mb-4">{verdict.summary}</p>
          <div className="border-t border-terminal-line pt-4 mt-4">
            <h4 className="font-mono text-xs tracking-widest text-muted-foreground mb-2 uppercase">
              Recommended Action
            </h4>
            <p className="font-mono text-xs text-foreground leading-6">{verdict.recommendation}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGenerating || uploadStatus === "uploading"}
            className="font-mono text-xs tracking-wider px-6 py-3 border border-gold bg-gold text-terminal-black hover:bg-gold-bright transition-colors disabled:opacity-50"
          >
            {isGenerating
              ? "GENERATING..."
              : uploadStatus === "uploading"
                ? "COMMITTING TO ARCHIVE..."
                : "DOWNLOAD AUTHORITY BLUEPRINT [PDF]"}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="font-mono text-xs tracking-wider px-6 py-3 border border-terminal-line text-muted-foreground hover:border-gold hover:text-gold transition-colors"
          >
            REINITIALIZE SCAN
          </button>
        </div>
        {pdfError && (
          <div className="font-mono text-xs text-destructive mb-2">
            PDF generation failed. Check console for details.
          </div>
        )}
        {uploadStatus === "done" && (
          <div className="border border-terminal-line p-4 mb-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-1.5 bg-gold" />
              <span className="font-mono text-xs tracking-widest text-gold">
                MODULE 04 // ARCHIVE
              </span>
            </div>
            <div className="font-mono text-xs text-gold mb-2">
              [OK] Report committed to archive.
            </div>
            {archivedUrl && (
              <a
                href={archivedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-xs text-terminal-black bg-gold hover:bg-gold-bright px-3 py-1.5 transition-colors"
              >
                {">"} DOWNLOAD FROM ARCHIVE
              </a>
            )}
          </div>
        )}
        {uploadStatus === "error" && !pdfError && (
          <div className="font-mono text-xs text-yellow-500 mb-2">
            [WARN] PDF downloaded locally but cloud archive failed.
          </div>
        )}
        <div className="mb-8" />
      </div>
    </div>
  )
}
