export interface Question {
  id: string
  category: "signal" | "automation" | "authority"
  label: string
  text: string
  options: { value: number; label: string }[]
}

export const CATEGORIES = {
  signal: {
    label: "SIGNAL DEPTH",
    code: "SIG",
    description: "How unique and differentiated is your message in the market?",
  },
  automation: {
    label: "SYSTEM AUTOMATION",
    code: "AUT",
    description: "How much human friction exists in your current process?",
  },
  authority: {
    label: "STRUCTURAL AUTHORITY",
    code: "STR",
    description: "Do you possess a proprietary framework or methodology?",
  },
} as const

export const QUESTIONS: Question[] = [
  // Signal Depth
  {
    id: "sig-1",
    category: "signal",
    label: "SIG_01",
    text: "How would you describe the uniqueness of your core message compared to competitors?",
    options: [
      { value: 0, label: "Identical to market standard" },
      { value: 25, label: "Slight differentiation" },
      { value: 50, label: "Noticeably distinct" },
      { value: 75, label: "Category-defining" },
      { value: 100, label: "Entirely new paradigm" },
    ],
  },
  {
    id: "sig-2",
    category: "signal",
    label: "SIG_02",
    text: "When a prospect encounters your brand for the first time, what is their typical reaction?",
    options: [
      { value: 0, label: "No memorable impression" },
      { value: 25, label: "Mild curiosity" },
      { value: 50, label: "Clear interest" },
      { value: 75, label: "Immediate trust signal" },
      { value: 100, label: "Compelled to engage" },
    ],
  },
  {
    id: "sig-3",
    category: "signal",
    label: "SIG_03",
    text: "How consistently does your messaging translate across all channels?",
    options: [
      { value: 0, label: "Fragmented and inconsistent" },
      { value: 25, label: "Somewhat aligned" },
      { value: 50, label: "Mostly consistent" },
      { value: 75, label: "Unified voice" },
      { value: 100, label: "Architecturally integrated" },
    ],
  },
  // System Automation
  {
    id: "aut-1",
    category: "automation",
    label: "AUT_01",
    text: "What percentage of your lead-to-client pipeline runs without human intervention?",
    options: [
      { value: 0, label: "0% — fully manual" },
      { value: 25, label: "~25% automated" },
      { value: 50, label: "~50% automated" },
      { value: 75, label: "~75% automated" },
      { value: 100, label: "Fully autonomous" },
    ],
  },
  {
    id: "aut-2",
    category: "automation",
    label: "AUT_02",
    text: "How do you currently handle client onboarding?",
    options: [
      { value: 0, label: "Manual emails and calls" },
      { value: 25, label: "Basic email sequences" },
      { value: 50, label: "Templated workflows" },
      { value: 75, label: "Self-serve with smart routing" },
      { value: 100, label: "Fully automated ecosystem" },
    ],
  },
  {
    id: "aut-3",
    category: "automation",
    label: "AUT_03",
    text: "How does your system respond when you are unavailable for 30 days?",
    options: [
      { value: 0, label: "Everything stops" },
      { value: 25, label: "Basic maintenance mode" },
      { value: 50, label: "Partial operation continues" },
      { value: 75, label: "Most functions self-sustain" },
      { value: 100, label: "Revenue increases autonomously" },
    ],
  },
  // Structural Authority
  {
    id: "str-1",
    category: "authority",
    label: "STR_01",
    text: "Do you have a named, proprietary framework or methodology?",
    options: [
      { value: 0, label: "No framework exists" },
      { value: 25, label: "Informal process" },
      { value: 50, label: "Documented methodology" },
      { value: 75, label: "Named proprietary framework" },
      { value: 100, label: "Industry-referenced system" },
    ],
  },
  {
    id: "str-2",
    category: "authority",
    label: "STR_02",
    text: "How would industry peers describe your market position?",
    options: [
      { value: 0, label: "Unknown" },
      { value: 25, label: "One of many" },
      { value: 50, label: "Recognized specialist" },
      { value: 75, label: "Category authority" },
      { value: 100, label: "The definitive source" },
    ],
  },
  {
    id: "str-3",
    category: "authority",
    label: "STR_03",
    text: "What is the depth of your intellectual property and content ecosystem?",
    options: [
      { value: 0, label: "No original content" },
      { value: 25, label: "Basic blog/social" },
      { value: 50, label: "Multi-format content library" },
      { value: 75, label: "Published frameworks + case studies" },
      { value: 100, label: "Ecosystem with courses, tools, and media" },
    ],
  },
]

export function calculateScores(answers: Record<string, number>) {
  const categoryScores = {
    signal: 0,
    automation: 0,
    authority: 0,
  }

  const categoryCounts = {
    signal: 0,
    automation: 0,
    authority: 0,
  }

  for (const q of QUESTIONS) {
    if (answers[q.id] !== undefined) {
      categoryScores[q.category] += answers[q.id]
      categoryCounts[q.category]++
    }
  }

  const signal = categoryCounts.signal > 0 ? categoryScores.signal / categoryCounts.signal : 0
  const automation = categoryCounts.automation > 0 ? categoryScores.automation / categoryCounts.automation : 0
  const authority = categoryCounts.authority > 0 ? categoryScores.authority / categoryCounts.authority : 0

  const integrity = Math.round((signal + automation + authority) / 3)
  const facade = 100 - integrity

  return {
    signal: Math.round(signal),
    automation: Math.round(automation),
    authority: Math.round(authority),
    integrity,
    facade,
  }
}

export function getVerdict(score: number): { title: string; summary: string; recommendation: string } {
  if (score >= 80) {
    return {
      title: "STRUCTURAL MONOLITH",
      summary: "Your infrastructure demonstrates exceptional integrity across all dimensions. Foundation is reinforced, signal is clear, and systems operate with minimal friction.",
      recommendation: "Focus on scaling and replication. Your architecture supports aggressive expansion. Consider licensing your framework or building certification programs.",
    }
  }
  if (score >= 60) {
    return {
      title: "EMERGING STRUCTURE",
      summary: "Solid foundational elements are in place but gaps exist between your signal strength and operational systems. The structure is sound but incomplete.",
      recommendation: "Prioritize closing the gap between your weakest and strongest dimensions. Systematize your highest-performing channel and build a proprietary framework if one does not exist.",
    }
  }
  if (score >= 40) {
    return {
      title: "FACADE DETECTED",
      summary: "Surface-level indicators suggest competence, but the underlying infrastructure lacks the depth to sustain growth. Key structural weaknesses exist.",
      recommendation: "Halt expansion activities. Invest in building genuine structural authority through a documented methodology. Automate your core pipeline before adding new channels.",
    }
  }
  return {
    title: "CRITICAL REBUILD REQUIRED",
    summary: "The current structure is operating on borrowed credibility. Without immediate foundational work, systemic failure is probable.",
    recommendation: "Complete architectural reset recommended. Define a single core message, build one automated pipeline, and document your process into a repeatable framework before any market-facing activity.",
  }
}
