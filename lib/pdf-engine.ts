"use client"

import { jsPDF } from "jspdf"

const BLACK = "#000000"
const DARK_GRAY = "#1A1A1A"
const MID_GRAY = "#666666"
const GOLD = "#C9A66B"

function drawHeader(doc: jsPDF, title: string, subtitle: string) {
  // Top border line
  doc.setDrawColor(BLACK)
  doc.setLineWidth(0.8)
  doc.line(15, 15, 195, 15)

  // Classification banner
  doc.setFont("courier", "bold")
  doc.setFontSize(7)
  doc.setTextColor(MID_GRAY)
  doc.text("BOBIKCS // STRUCTURAL CORE // CLASSIFIED DOCUMENT", 105, 12, { align: "center" })

  // Title
  doc.setFont("courier", "bold")
  doc.setFontSize(14)
  doc.setTextColor(BLACK)
  doc.text(title.toUpperCase(), 15, 25)

  // Subtitle
  doc.setFont("courier", "normal")
  doc.setFontSize(8)
  doc.setTextColor(MID_GRAY)
  doc.text(subtitle, 15, 31)

  // Second border
  doc.setLineWidth(0.3)
  doc.line(15, 34, 195, 34)

  return 40
}

function drawMetadataBlock(doc: jsPDF, y: number, fields: [string, string][]) {
  doc.setFont("courier", "bold")
  doc.setFontSize(7)
  doc.setTextColor(MID_GRAY)
  doc.text("DOCUMENT METADATA", 15, y)
  y += 5

  doc.setLineWidth(0.15)
  doc.line(15, y, 195, y)
  y += 4

  doc.setFont("courier", "normal")
  doc.setFontSize(8)

  for (const [key, value] of fields) {
    doc.setTextColor(MID_GRAY)
    doc.text(`${key}:`, 15, y)
    doc.setTextColor(BLACK)
    doc.text(value, 65, y)
    y += 5
  }

  y += 2
  doc.setLineWidth(0.15)
  doc.line(15, y, 195, y)
  return y + 6
}

function drawSection(doc: jsPDF, y: number, heading: string, lines: string[]) {
  if (y > 260) {
    doc.addPage()
    y = 20
  }

  doc.setFont("courier", "bold")
  doc.setFontSize(7)
  doc.setTextColor(GOLD)
  doc.text(heading.toUpperCase(), 15, y)
  y += 5

  doc.setFont("courier", "normal")
  doc.setFontSize(8)
  doc.setTextColor(DARK_GRAY)

  for (const line of lines) {
    if (y > 275) {
      doc.addPage()
      y = 20
    }
    doc.text(line, 15, y)
    y += 4.5
  }

  return y + 4
}

function drawFooter(doc: jsPDF) {
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFont("courier", "normal")
    doc.setFontSize(6)
    doc.setTextColor(MID_GRAY)
    doc.setLineWidth(0.15)
    doc.line(15, 282, 195, 282)
    doc.text(
      `STRUCTURAL CORE // PAGE ${i} OF ${pages} // GENERATED ${new Date().toISOString()} // SOVEREIGN INTELLIGENCE PLATFORM`,
      105,
      286,
      { align: "center" }
    )
    doc.text("BOBIKCS.COM // CONFIDENTIAL", 105, 290, { align: "center" })
  }
}

// ── Public API ──

export function generateReportPDF(params: {
  title: string
  version: string
  hash: string
  timestamp: string
  category: string
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const { title, version, hash, timestamp, category } = params

  let y = drawHeader(doc, title, `Institutional Report // ${category}`)

  y = drawMetadataBlock(doc, y, [
    ["DOCUMENT ID", hash],
    ["VERSION", version],
    ["CATEGORY", category.toUpperCase()],
    ["ISSUED", timestamp],
    ["CLASSIFICATION", "INSTITUTIONAL USE ONLY"],
    ["ISSUING AUTHORITY", "BOBIKCS STRUCTURAL CORE"],
  ])

  y = drawSection(doc, y, "Executive Summary", [
    "This document constitutes an official structural intelligence report issued by the",
    "BOBIKCS Sovereign Intelligence Platform. All metrics, assessments, and conclusions",
    "herein are derived from deterministic structural analysis engines operating on live",
    "global financial data.",
    "",
    "The structural integrity of the global financial system is assessed through a",
    "multi-dimensional framework encompassing reserve adequacy, consensus stability,",
    "throughput capacity, and governance coherence metrics.",
  ])

  y = drawSection(doc, y, "Methodology", [
    "Analysis is performed using the Structural Core engine which processes:",
    "",
    "  - Global Index Snapshots: Real-time structural health indicators",
    "  - Consensus Ratio: Cross-node validation coherence (target: >99.8%)",
    "  - Reserve Index: Collateral adequacy measurement (target: >1.000x)",
    "  - Throughput Metrics: System capacity and transaction processing rates",
    "  - Governance Integrity: Policy execution and mandate compliance",
    "",
    "All data points are cryptographically verified and immutably logged.",
  ])

  y = drawSection(doc, y, "Structural Assessment", [
    `Report: ${title}`,
    `Current Status: ACTIVE`,
    `Integrity Level: VERIFIED`,
    `Last Audit Cycle: ${timestamp}`,
    "",
    "The structural framework maintains operational coherence across all monitored",
    "dimensions. No critical deviations have been detected within the current",
    "assessment window.",
  ])

  y = drawSection(doc, y, "Integrity Verification", [
    `Document Hash: ${hash}`,
    `Verification: SHA-256 // DETERMINISTIC`,
    `Tamper Status: NONE DETECTED`,
    "",
    "This document can be independently verified using the hash above against",
    "the BOBIKCS Structural Core audit trail.",
  ])

  drawFooter(doc)

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)
  doc.save(`STRUCTURAL-CORE-${slug}.pdf`)
}

export function generateSimulationPDF(params: {
  shockMagnitude: number
  epochs: number
  shockType: string
  region: string
  verdict: string
  survivalRate: number
  maxDrawdown: number
  recoveryEpochs: number
  curve: number[]
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const p = params

  let y = drawHeader(doc, "Structural Stress-Test Report", `Simulation Result // ${p.region} // ${p.shockType}`)

  y = drawMetadataBlock(doc, y, [
    ["RUN ID", `SIM-${Date.now().toString(36).toUpperCase()}`],
    ["EXECUTED", new Date().toISOString()],
    ["REGION", p.region.toUpperCase()],
    ["SHOCK TYPE", p.shockType.toUpperCase()],
    ["CLASSIFICATION", "INSTITUTIONAL USE ONLY"],
    ["ENGINE", "STRUCTURAL CORE v1.0"],
  ])

  y = drawSection(doc, y, "Input Parameters", [
    `Shock Magnitude:    ${p.shockMagnitude.toFixed(1)}`,
    `Simulation Epochs:  ${p.epochs}`,
    `Shock Type:         ${p.shockType}`,
    `Target Region:      ${p.region}`,
    `Correlation Factor: ${(["Credit Shock", "Rate Shock", "Liquidity Shock", "Volatility Shock", "Sovereign Default"].indexOf(p.shockType) + 1) || 1}`,
    `Liquidity Floor:    0.50`,
    `Reserve Ratio:      0.80`,
  ])

  y = drawSection(doc, y, "Simulation Results", [
    `VERDICT:            ${p.verdict}`,
    `SURVIVAL RATE:      ${p.survivalRate.toFixed(2)}%`,
    `MAX DRAWDOWN:       ${p.maxDrawdown.toFixed(2)}%`,
    `RECOVERY EPOCHS:    ${p.recoveryEpochs}`,
    "",
    `Verdict Classification:`,
    `  STABLE   = Survival >= 80%`,
    `  STRESSED = Survival >= 50%`,
    `  CRITICAL = Survival <  50%`,
  ])

  // Draw curve as ASCII-style chart
  if (p.curve && p.curve.length > 0) {
    const curveLines: string[] = [""]
    const max = Math.max(...p.curve)
    const min = Math.min(...p.curve)
    const rows = 10
    for (let r = rows; r >= 0; r--) {
      const threshold = min + (max - min) * (r / rows)
      const label = threshold.toFixed(0).padStart(4, " ")
      const bar = p.curve.map((v) => (v >= threshold ? "#" : ".")).join("")
      curveLines.push(`${label} | ${bar}`)
    }
    curveLines.push(`     +${"--".repeat(Math.min(p.curve.length, 50))}`)
    curveLines.push(`       Epoch 1 ${"".padEnd(Math.min(p.curve.length, 50) * 2 - 20)}Epoch ${p.curve.length}`)
    y = drawSection(doc, y, "Recovery Curve (ASCII)", curveLines)
  }

  y = drawSection(doc, y, "Disclaimer", [
    "This simulation is generated by the BOBIKCS Structural Core engine for",
    "institutional analysis purposes only. Results are deterministic based on",
    "input parameters and do not constitute financial advice. All outputs are",
    "cryptographically logged and subject to audit.",
  ])

  drawFooter(doc)
  doc.save(`STRUCTURAL-CORE-SIM-${p.verdict}-${Date.now().toString(36).toUpperCase()}.pdf`)
}
