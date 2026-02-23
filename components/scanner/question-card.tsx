"use client"

import { CATEGORIES, type Question } from "@/lib/scanner-data"

interface QuestionCardProps {
  question: Question
  selectedValue: number | undefined
  onSelect: (questionId: string, value: number) => void
  onNext: () => void
  onPrev: () => void
  isFirst: boolean
  isLast: boolean
  onComplete: () => void
}

export function QuestionCard({
  question,
  selectedValue,
  onSelect,
  onNext,
  onPrev,
  isFirst,
  isLast,
  onComplete,
}: QuestionCardProps) {
  const category = CATEGORIES[question.category]

  return (
    <div className="animate-fade-in">
      <div className="px-6 py-8">
        {/* Category indicator */}
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-xs tracking-widest text-gold border border-gold px-3 py-1">
            {category.code}
          </span>
          <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            {category.label}
          </span>
        </div>

        {/* Question ID */}
        <div className="font-mono text-xs text-muted-foreground mb-3">
          {">"} {question.label}
        </div>

        {/* Question text */}
        <h2 className="text-xl font-sans font-medium text-foreground mb-8 leading-relaxed max-w-2xl">
          {question.text}
        </h2>

        {/* Options */}
        <div className="flex flex-col gap-2 max-w-2xl">
          {question.options.map((option, index) => {
            const isSelected = selectedValue === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(question.id, option.value)}
                className={`group flex items-center gap-4 border px-4 py-3 text-left transition-colors duration-150 ${
                  isSelected
                    ? "border-gold bg-gold/5 text-gold"
                    : "border-terminal-line text-muted-foreground hover:border-gold-dim hover:text-foreground"
                }`}
              >
                <span className="font-mono text-xs w-6 shrink-0">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="text-sm font-sans">{option.label}</span>
                {isSelected && (
                  <span className="ml-auto font-mono text-xs text-gold">SELECTED</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-terminal-line">
          <button
            type="button"
            onClick={onPrev}
            disabled={isFirst}
            className={`font-mono text-xs tracking-wider px-4 py-2 border transition-colors ${
              isFirst
                ? "border-terminal-line text-terminal-line cursor-not-allowed"
                : "border-terminal-line text-muted-foreground hover:border-gold hover:text-gold"
            }`}
          >
            {"<"} PREV
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={onComplete}
              disabled={selectedValue === undefined}
              className={`font-mono text-xs tracking-wider px-6 py-2 border transition-colors ${
                selectedValue === undefined
                  ? "border-terminal-line text-terminal-line cursor-not-allowed"
                  : "border-gold bg-gold text-terminal-black hover:bg-gold-bright"
              }`}
            >
              EXECUTE SCAN {">>"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={selectedValue === undefined}
              className={`font-mono text-xs tracking-wider px-4 py-2 border transition-colors ${
                selectedValue === undefined
                  ? "border-terminal-line text-terminal-line cursor-not-allowed"
                  : "border-terminal-line text-muted-foreground hover:border-gold hover:text-gold"
              }`}
            >
              NEXT {">"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
