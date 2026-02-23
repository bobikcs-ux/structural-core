"use client"

import { QUESTIONS } from "@/lib/scanner-data"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  answers: Record<string, number>
}

export function StepIndicator({ currentStep, totalSteps, answers }: StepIndicatorProps) {
  const progress = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0

  return (
    <div className="shrink-0 border-b border-terminal-line px-6 py-4">
      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground mb-3">
        <span>
          QUERY {String(currentStep + 1).padStart(2, "0")} / {String(totalSteps).padStart(2, "0")}
        </span>
        <span>{progress}% COMPLETE</span>
      </div>
      <div className="flex gap-1">
        {QUESTIONS.map((q, i) => (
          <div
            key={q.id}
            className={`h-1 flex-1 transition-colors duration-300 ${
              answers[q.id] !== undefined
                ? "bg-gold"
                : i === currentStep
                  ? "bg-gold-dim"
                  : "bg-terminal-line"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
