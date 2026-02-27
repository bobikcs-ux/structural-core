/**
 * BOBIKCS SRI PROTOCOL v3.0 - FRED Data Fetcher
 * 
 * Fetches economic indicators from the Federal Reserve Economic Data (FRED) API.
 * Used to calculate the Structural Reserve Index (SRI).
 * 
 * Series used:
 * - DGS10: 10-Year Treasury Constant Maturity Rate
 * - DGS2: 2-Year Treasury Constant Maturity Rate
 * - CPIAUCSL: Consumer Price Index for All Urban Consumers
 * - FEDFUNDS: Federal Funds Effective Rate
 * - M2SL: M2 Money Stock
 */

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations"

/**
 * Fetches a single series from FRED API
 * 
 * @param series - FRED series ID (e.g., "DGS10")
 * @param apiKey - FRED API key
 * @param count - Number of observations to fetch (default: 1)
 * @param offset - Offset for pagination (used for historical values)
 * @returns The numeric value of the observation
 */
async function fetchSeries(
  series: string,
  apiKey: string,
  count: number = 1,
  offset: number = 0
): Promise<number> {
  const url = new URL(FRED_BASE)
  url.searchParams.set("series_id", series)
  url.searchParams.set("api_key", apiKey)
  url.searchParams.set("file_type", "json")
  url.searchParams.set("sort_order", "desc")
  url.searchParams.set("limit", String(count + offset))
  url.searchParams.set("offset", String(offset))

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`FRED_FETCH_FAILED: ${series} (HTTP ${res.status})`)
  }

  const json = await res.json()
  const obs = json.observations

  if (!obs || obs.length === 0) {
    throw new Error(`FRED_NO_DATA: ${series}`)
  }

  // FRED sometimes returns "." for missing values
  const rawValue = obs[0].value
  if (rawValue === "." || rawValue === "") {
    throw new Error(`FRED_MISSING_VALUE: ${series}`)
  }

  const val = parseFloat(rawValue)
  if (isNaN(val)) {
    throw new Error(`FRED_INVALID_VALUE: ${series} (value: ${rawValue})`)
  }

  return val
}

/**
 * Raw FRED data payload structure
 */
export interface FredPayload {
  dgs10: number        // 10-Year Treasury Rate
  dgs2: number         // 2-Year Treasury Rate
  cpiaucsl: number     // Current CPI
  cpi_12m_ago: number  // CPI 12 months ago
  fedfunds: number     // Federal Funds Rate
  m2sl: number         // Current M2 Money Stock
  m2sl_12m_ago: number // M2 12 months ago
}

/**
 * Fetches all required FRED data for SRI calculation
 * 
 * All fetches run in parallel for speed. If any fetch fails,
 * the entire operation fails (fail-fast behavior per spec).
 * 
 * @param apiKey - FRED API key from environment
 * @returns FredPayload with all economic indicators
 * @throws Error if any FRED fetch fails
 */
export async function fetchFredData(apiKey: string): Promise<FredPayload> {
  // All fetches in parallel - fail fast if any fails
  const [dgs10, dgs2, cpi, cpi12, fed, m2, m212] = await Promise.all([
    fetchSeries("DGS10", apiKey),
    fetchSeries("DGS2", apiKey),
    fetchSeries("CPIAUCSL", apiKey),
    fetchSeries("CPIAUCSL", apiKey, 1, 12), // offset 12 = 12 months ago
    fetchSeries("FEDFUNDS", apiKey),
    fetchSeries("M2SL", apiKey),
    fetchSeries("M2SL", apiKey, 1, 12),
  ])

  return {
    dgs10,
    dgs2,
    cpiaucsl: cpi,
    cpi_12m_ago: cpi12,
    fedfunds: fed,
    m2sl: m2,
    m2sl_12m_ago: m212,
  }
}

/**
 * Validates that a FredPayload has all required fields with valid values
 */
export function validateFredPayload(payload: FredPayload): boolean {
  const requiredFields: (keyof FredPayload)[] = [
    "dgs10",
    "dgs2", 
    "cpiaucsl",
    "cpi_12m_ago",
    "fedfunds",
    "m2sl",
    "m2sl_12m_ago",
  ]

  for (const field of requiredFields) {
    const value = payload[field]
    if (typeof value !== "number" || isNaN(value)) {
      return false
    }
  }

  // Additional validation: CPI values must be positive for YoY calculation
  if (payload.cpi_12m_ago <= 0 || payload.m2sl_12m_ago <= 0) {
    return false
  }

  return true
}
