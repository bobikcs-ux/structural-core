/**
 * BOBIKCS SRI PROTOCOL v3.0 - SRI Calculation Engine
 * 
 * DETERMINISTIC. No random. No runtime variance.
 * All outputs rounded to 4 decimals.
 * 
 * The Structural Reserve Index (SRI) is a composite indicator measuring
 * macroeconomic stress in the financial system. Higher values indicate
 * increased stress/risk.
 * 
 * Components:
 * - Yield Spread Score (35%): Treasury yield curve (10Y - 2Y)
 * - Inflation Score (25%): CPI year-over-year change
 * - Rate Score (20%): Federal Funds effective rate
 * - Liquidity Score (20%): M2 money supply growth
 */

import { clamp } from "./crypto-utils"
import type { FredPayload } from "./fred-fetch"

/**
 * SRI calculation result with all component scores
 */
export interface SRIResult {
  sri_value: number       // Final index, 0-1, 4 decimals
  spread_score: number    // Yield spread component, 0-1
  inflation_score: number // Inflation component, 0-1
  rate_score: number      // Fed rate component, 0-1
  liquidity_score: number // M2 liquidity component, 0-1
}

/**
 * Component weights for SRI calculation
 * Total must equal 1.0
 */
const WEIGHTS = {
  spread: 0.35,
  inflation: 0.25,
  rate: 0.20,
  liquidity: 0.20,
} as const

/**
 * Calculates the Structural Reserve Index from FRED data
 * 
 * This function is DETERMINISTIC - same input always produces same output.
 * All scores are clamped to [0, 1] and rounded to 4 decimal places.
 * 
 * @param data - FRED economic data payload
 * @returns SRIResult with final SRI and all component scores
 */
export function calculateSRI(data: FredPayload): SRIResult {
  // ─────────────────────────────────────────────────────────────────────────
  // 1. YIELD SPREAD SCORE (weight: 35%)
  // ─────────────────────────────────────────────────────────────────────────
  // Measures yield curve inversion risk
  // Normal spread ~1.5%, inverted = negative
  // Formula: (1.5 - spread) / 3, clamped to [0, 1]
  // Higher score = more inverted/risky
  const yieldSpread = data.dgs10 - data.dgs2
  const spreadScore = clamp((1.5 - yieldSpread) / 3, 0, 1)

  // ─────────────────────────────────────────────────────────────────────────
  // 2. INFLATION SCORE (weight: 25%)
  // ─────────────────────────────────────────────────────────────────────────
  // Measures inflation deviation from 2% target
  // Formula: (YoY_CPI - 0.02) / 0.06, clamped to [0, 1]
  // At 2% inflation: score = 0, at 8%: score = 1
  const cpiYoY = (data.cpiaucsl / data.cpi_12m_ago) - 1
  const inflScore = clamp((cpiYoY - 0.02) / 0.06, 0, 1)

  // ─────────────────────────────────────────────────────────────────────────
  // 3. RATE SCORE (weight: 20%)
  // ─────────────────────────────────────────────────────────────────────────
  // Measures monetary policy tightness
  // Formula: fedfunds / 6, clamped to [0, 1]
  // At 0%: score = 0, at 6%+: score = 1
  const rateScore = clamp(data.fedfunds / 6, 0, 1)

  // ─────────────────────────────────────────────────────────────────────────
  // 4. LIQUIDITY SCORE (weight: 20%)
  // ─────────────────────────────────────────────────────────────────────────
  // Measures money supply contraction
  // Formula: (0.05 - M2_YoY) / 0.10, clamped to [0, 1]
  // At +5% growth: score = 0, at -5% contraction: score = 1
  const m2YoY = (data.m2sl / data.m2sl_12m_ago) - 1
  const liqScore = clamp((0.05 - m2YoY) / 0.10, 0, 1)

  // ─────────────────────────────────────────────────────────────────────────
  // 5. FINAL WEIGHTED SRI
  // ─────────────────────────────────────────────────────────────────────────
  const sri =
    spreadScore * WEIGHTS.spread +
    inflScore * WEIGHTS.inflation +
    rateScore * WEIGHTS.rate +
    liqScore * WEIGHTS.liquidity

  // Return all values rounded to 4 decimal places
  return {
    sri_value: parseFloat(sri.toFixed(4)),
    spread_score: parseFloat(spreadScore.toFixed(4)),
    inflation_score: parseFloat(inflScore.toFixed(4)),
    rate_score: parseFloat(rateScore.toFixed(4)),
    liquidity_score: parseFloat(liqScore.toFixed(4)),
  }
}

/**
 * Returns a human-readable interpretation of the SRI value
 */
export function interpretSRI(sriValue: number): {
  level: "low" | "moderate" | "elevated" | "high" | "critical"
  description: string
} {
  if (sriValue < 0.2) {
    return {
      level: "low",
      description: "Low systemic stress. Favorable market conditions.",
    }
  }
  if (sriValue < 0.4) {
    return {
      level: "moderate",
      description: "Moderate stress. Normal market volatility.",
    }
  }
  if (sriValue < 0.6) {
    return {
      level: "elevated",
      description: "Elevated stress. Increased caution advised.",
    }
  }
  if (sriValue < 0.8) {
    return {
      level: "high",
      description: "High stress. Significant market headwinds.",
    }
  }
  return {
    level: "critical",
    description: "Critical stress. Extreme market conditions.",
  }
}
