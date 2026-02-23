import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { institution, jurisdiction, aum, risk_domain, intended_use, email, request_hash } = body

    if (!institution || !jurisdiction || !aum || !risk_domain || !intended_use || !email || !request_hash) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Insert into Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error: dbError } = await supabase.from("clearance_requests").insert({
      institution,
      jurisdiction,
      aum,
      risk_domain,
      intended_use,
      email,
      request_hash,
    })

    if (dbError) {
      console.error("[v0] Supabase insert error:", dbError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Send notification email via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const resend = new Resend(resendKey)
      await resend.emails.send({
        from: "BOBIKCS Structural Core <onboarding@resend.dev>",
        to: "bobikcs@studio-bobikcs.com",
        subject: `[CLEARANCE REQUEST] ${institution} // ${request_hash}`,
        html: `
          <div style="font-family:'Courier New',monospace;background:#000;color:#eaeaea;padding:40px;max-width:640px;">
            <div style="border-bottom:1px solid #333;padding-bottom:16px;margin-bottom:24px;">
              <div style="color:#C9A66B;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">
                BOBIKCS // STRUCTURAL CORE
              </div>
              <div style="color:#999;font-size:11px;margin-top:4px;letter-spacing:0.1em;text-transform:uppercase;">
                INSTITUTIONAL ACCESS REQUEST
              </div>
            </div>

            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <tr>
                <td style="padding:8px 0;color:#999;width:160px;vertical-align:top;">INSTITUTION</td>
                <td style="padding:8px 0;color:#eaeaea;">${institution}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#999;vertical-align:top;">JURISDICTION</td>
                <td style="padding:8px 0;color:#eaeaea;">${jurisdiction}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#999;vertical-align:top;">AUM</td>
                <td style="padding:8px 0;color:#eaeaea;">${aum}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#999;vertical-align:top;">RISK DOMAIN</td>
                <td style="padding:8px 0;color:#eaeaea;">${risk_domain}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#999;vertical-align:top;">INTENDED USE</td>
                <td style="padding:8px 0;color:#eaeaea;">${intended_use}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#999;vertical-align:top;">EMAIL</td>
                <td style="padding:8px 0;color:#C9A66B;">${email}</td>
              </tr>
            </table>

            <div style="border-top:1px solid #333;margin-top:24px;padding-top:16px;">
              <div style="font-size:11px;color:#999;letter-spacing:0.1em;">REQUEST HASH</div>
              <div style="font-size:13px;color:#C9A66B;font-family:monospace;margin-top:4px;">${request_hash}</div>
            </div>

            <div style="margin-top:24px;font-size:10px;color:#555;letter-spacing:0.05em;">
              TIMESTAMP: ${new Date().toISOString()} // AUTOMATED NOTIFICATION
            </div>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true, request_hash })
  } catch (err) {
    console.error("[v0] Clearance API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
