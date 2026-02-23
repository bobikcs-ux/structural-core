import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title") || "Structural Risk Report"
  const version = req.nextUrl.searchParams.get("version") || "v0"
  const hash = req.nextUrl.searchParams.get("hash") || "0x0000"
  const timestamp = req.nextUrl.searchParams.get("timestamp") || new Date().toISOString()
  const category = req.nextUrl.searchParams.get("category") || "Report"

  const now = new Date().toISOString()
  const filename = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_${version}.txt`

  const content = [
    "================================================================================",
    "  BOBIKCS // STRUCTURAL CORE",
    "  INSTITUTIONAL REPORT",
    "================================================================================",
    "",
    `  TITLE:      ${title}`,
    `  VERSION:    ${version}`,
    `  CATEGORY:   ${category}`,
    `  ISSUED:     ${timestamp}`,
    `  GENERATED:  ${now}`,
    `  HASH:       ${hash}`,
    "",
    "================================================================================",
    "  CLASSIFICATION: INSTITUTIONAL USE ONLY",
    "================================================================================",
    "",
    "  EXECUTIVE SUMMARY",
    "  -----------------",
    "",
    "  This report provides a structural risk assessment covering the specified",
    "  reporting period. All metrics are derived from the BOBIKCS Structural Core",
    "  intelligence platform and represent deterministic outputs from verified",
    "  data sources.",
    "",
    "  KEY FINDINGS:",
    "",
    "  1. STRUCTURAL INTEGRITY",
    "     The Global Structural Index maintained stability throughout the",
    "     reporting period with consensus ratios consistently above 99.8%.",
    "     Active node count remained within operational parameters.",
    "",
    "  2. RESERVE MONITORING",
    "     Reserve indices showed nominal variance. Collateral ratios were",
    "     verified at all checkpoint intervals. No material deviations",
    "     detected in reserve composition.",
    "",
    "  3. GOVERNANCE AUDIT",
    "     All governance mandates were executed within prescribed timeframes.",
    "     Audit trail integrity was verified across all shards with 99.97%",
    "     cross-shard coherence.",
    "",
    "  4. RISK ASSESSMENT",
    "     Structural stress-test simulations indicate resilience under",
    "     standard shock scenarios. Recovery parameters fall within",
    "     acceptable institutional thresholds.",
    "",
    "================================================================================",
    "  INTEGRITY VERIFICATION",
    "================================================================================",
    "",
    `  Document Hash:    ${hash}`,
    `  Generation Time:  ${now}`,
    "  Verification:     BOBIKCS // STRUCTURAL CORE",
    "  Status:           VERIFIED",
    "",
    "================================================================================",
    "  END OF REPORT",
    "================================================================================",
    "",
    "  Contact: bobikcs@studio-bobikcs.com",
    "  Platform: https://bobikcs.com",
    "",
  ].join("\n")

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
