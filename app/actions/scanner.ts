"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const ScanResultSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  objective: z
    .string()
    .min(10, "Objective must be at least 10 characters")
    .max(500, "Objective must be under 500 characters"),
  signal_score: z.number().int().min(0).max(100),
  automation_score: z.number().int().min(0).max(100),
  authority_score: z.number().int().min(0).max(100),
  integrity_score: z.number().int().min(0).max(100),
  facade_score: z.number().int().min(0).max(100),
  verdict_title: z.string().min(1, "Verdict title is required"),
})

export type ScanResultInput = z.infer<typeof ScanResultSchema>

export type ActionResponse = {
  success: boolean
  error?: string
  data?: {
    id: string
    created_at: string
  }
}

// ── Submit Scan Result ───────────────────────────────────────────────────────

export async function submitScanResult(
  input: ScanResultInput
): Promise<ActionResponse> {
  // Validate input with Zod
  const parsed = ScanResultSchema.safeParse(input)

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]
    return {
      success: false,
      error: firstError?.message || "Validation failed",
    }
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("scan_results")
      .insert({
        email: parsed.data.email,
        objective: parsed.data.objective,
        signal_score: parsed.data.signal_score,
        automation_score: parsed.data.automation_score,
        authority_score: parsed.data.authority_score,
        integrity_score: parsed.data.integrity_score,
        facade_score: parsed.data.facade_score,
        verdict_title: parsed.data.verdict_title,
        status: "COMPLETED",
      })
      .select("id, created_at")
      .single()

    if (error) {
      console.error("[scanner-action] Supabase insert error:", error)
      return {
        success: false,
        error: "Failed to save scan result. Please try again.",
      }
    }

    return {
      success: true,
      data: {
        id: data.id,
        created_at: data.created_at,
      },
    }
  } catch (err) {
    console.error("[scanner-action] Unexpected error:", err)
    return {
      success: false,
      error: "An unexpected error occurred.",
    }
  }
}

// ── Upload PDF via FormData (server-side upload to Supabase Storage) ─────────

export type UploadResponse = {
  success: boolean
  error?: string
  url?: string
}

export async function uploadPdfAction(
  formData: FormData,
  recordId: string
): Promise<UploadResponse> {
  // Validate recordId
  const idParsed = z.string().uuid("Invalid scan result ID").safeParse(recordId)
  if (!idParsed.success) {
    return { success: false, error: idParsed.error.errors[0]?.message || "Invalid ID" }
  }

  const file = formData.get("file")
  if (!file || !(file instanceof File)) {
    return { success: false, error: "No PDF file provided." }
  }

  // Validate file type and size (max 10MB)
  if (file.type !== "application/pdf") {
    return { success: false, error: "File must be a PDF." }
  }
  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: "File exceeds 10MB limit." }
  }

  try {
    const supabase = await createClient()

    // Convert File to Buffer for server-side upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Use the file's original name (already formatted as report-[ts]-[email].pdf)
    const filePath = `${idParsed.data}/${file.name}`

    // Upload to Supabase Storage (server-side, no CORS issues)
    const { error: uploadError } = await supabase.storage
      .from("reports")
      .upload(filePath, buffer, {
        contentType: "application/pdf",
        upsert: true,
      })

    if (uploadError) {
      console.error("[scanner-action] Storage upload error:", uploadError)
      return { success: false, error: "Failed to upload PDF report." }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("reports").getPublicUrl(filePath)

    // Update scan_results row with pdf_url
    const { error: updateError } = await supabase
      .from("scan_results")
      .update({ pdf_url: publicUrl })
      .eq("id", idParsed.data)

    if (updateError) {
      console.error("[scanner-action] Update pdf_url error:", updateError)
      return { success: false, error: "PDF uploaded but failed to save link." }
    }

    return { success: true, url: publicUrl }
  } catch (err) {
    console.error("[scanner-action] Unexpected upload error:", err)
    return { success: false, error: "An unexpected error occurred during upload." }
  }
}

// ── Fetch Recent Scans ──────────────────────────────────────────────────────

export type RecentScan = {
  id: string
  email: string
  integrity_score: number
  verdict_title: string
  created_at: string
}

// ── Fetch Global Structural Index (for System Bar) ──────────────────────────

export type SystemBarData = {
  index: number
  status: string
  lastUpdate: string
}

export async function fetchGlobalStructuralIndex(): Promise<{
  success: boolean
  data?: SystemBarData
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Get ALL completed scans for global AVG(integrity_score)
    const { data, error } = await supabase
      .from("scan_results")
      .select("integrity_score, created_at")
      .eq("status", "COMPLETED")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[scanner-action] GSI fetch error:", error)
      return { success: false, error: "Failed to compute structural index." }
    }

    if (!data || data.length === 0) {
      return {
        success: true,
        data: {
          index: 0,
          status: "NO DATA",
          lastUpdate: new Date().toISOString(),
        },
      }
    }

    // AVG(integrity_score) from ALL records
    const avg = Math.round(
      data.reduce((sum, r) => sum + r.integrity_score, 0) / data.length
    )

    // Status classification per spec
    let status: string
    if (avg > 75) status = "STRUCTURAL STABILITY"
    else if (avg >= 50) status = "COMPETITIVE"
    else status = "CRITICAL EROSION"

    return {
      success: true,
      data: {
        index: avg,
        status,
        lastUpdate: data[0].created_at,
      },
    }
  } catch (err) {
    console.error("[scanner-action] Unexpected GSI error:", err)
    return { success: false, error: "An unexpected error occurred." }
  }
}

// ── Fetch Drift Data (real quarterly + drift calculation) ───────────────────

export type DriftData = {
  quarterlyScans: number
  driftDelta: number
  quarters: { label: string; count: number }[]
}

export async function fetchDriftData(): Promise<{
  success: boolean
  data?: DriftData
  error?: string
}> {
  try {
    const supabase = await createClient()
    const now = new Date()

    // Current quarter boundaries
    const currentQ = Math.floor(now.getMonth() / 3)
    const currentQStart = new Date(now.getFullYear(), currentQ * 3, 1)

    // Last 4 quarter boundaries
    const quarters: { label: string; start: Date; end: Date }[] = []
    for (let i = 0; i < 4; i++) {
      const qMonth = currentQ * 3 - i * 3
      const year = now.getFullYear() + Math.floor(qMonth / 12)
      const month = ((qMonth % 12) + 12) % 12
      const start = new Date(year, month, 1)
      const endMonth = month + 3
      const end = new Date(year + Math.floor(endMonth / 12), endMonth % 12, 1)
      const qNum = Math.floor(month / 3) + 1
      quarters.push({ label: `Q${qNum} ${year}`, start, end })
    }

    // Fetch all completed scans from last ~12 months
    const oldest = quarters[quarters.length - 1]?.start ?? currentQStart
    const { data, error } = await supabase
      .from("scan_results")
      .select("integrity_score, created_at")
      .eq("status", "COMPLETED")
      .gte("created_at", oldest.toISOString())
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[scanner-action] Drift fetch error:", error)
      return { success: false, error: "Failed to fetch drift data." }
    }

    const records = data ?? []

    // Count scans per quarter
    const qResults = quarters.map((q) => {
      const count = records.filter((r) => {
        const d = new Date(r.created_at)
        return d >= q.start && d < q.end
      }).length
      return { label: q.label, count }
    })

    // Current quarter scan count
    const currentQScans = qResults[0]?.count ?? 0

    // Drift calculation: AVG integrity this month vs last month
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const thisMonth = records.filter((r) => new Date(r.created_at) >= thisMonthStart)
    const lastMonth = records.filter(
      (r) => new Date(r.created_at) >= lastMonthStart && new Date(r.created_at) < thisMonthStart
    )

    const avgThis = thisMonth.length > 0
      ? thisMonth.reduce((s, r) => s + r.integrity_score, 0) / thisMonth.length
      : 0
    const avgLast = lastMonth.length > 0
      ? lastMonth.reduce((s, r) => s + r.integrity_score, 0) / lastMonth.length
      : 0

    const driftDelta = Math.round(avgThis - avgLast)

    return {
      success: true,
      data: {
        quarterlyScans: currentQScans,
        driftDelta,
        quarters: qResults,
      },
    }
  } catch (err) {
    console.error("[scanner-action] Unexpected drift error:", err)
    return { success: false, error: "An unexpected error occurred." }
  }
}

// ── Fetch Active Count (for License Panel) ──────────────────────────────────

export async function fetchActiveCount(): Promise<{
  success: boolean
  count?: number
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from("scan_results")
      .select("*", { count: "exact", head: true })
      .eq("status", "COMPLETED")

    if (error) {
      console.error("[scanner-action] Count error:", error)
      return { success: false, error: "Failed to fetch count." }
    }

    return { success: true, count: count ?? 0 }
  } catch (err) {
    console.error("[scanner-action] Unexpected count error:", err)
    return { success: false, error: "An unexpected error occurred." }
  }
}

// ── Fetch Recent Scans ──────────────────────────────────────────────────────

export async function fetchRecentScans(): Promise<{
  success: boolean
  data?: RecentScan[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("scan_results")
      .select("id, email, integrity_score, verdict_title, created_at")
      .eq("status", "COMPLETED")
      .order("created_at", { ascending: false })
      .limit(5)

    if (error) {
      console.error("[scanner-action] Supabase fetch error:", error)
      return { success: false, error: "Failed to fetch recent scans." }
    }

    return { success: true, data: data as RecentScan[] }
  } catch (err) {
    console.error("[scanner-action] Unexpected fetch error:", err)
    return { success: false, error: "An unexpected error occurred." }
  }
}
