interface Scores {
  signal: number
  automation: number
  authority: number
  integrity: number
  facade: number
}

interface Verdict {
  title: string
  summary: string
  recommendation: string
}

/**
 * Generates a downloadable PDF "Authority Blueprint" using html2canvas + jsPDF.
 * Renders a hidden styled element, captures it as a canvas, then writes to PDF.
 */
export async function generatePDF(scores: Scores, verdict: Verdict) {
  try {
    // Dynamic imports (client-side only)
    const [html2canvasModule, jsPDFModule] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ])
    const html2canvas = html2canvasModule.default
    const { jsPDF } = jsPDFModule

    // Build the render container off-screen
    const container = document.createElement("div")
    container.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 794px;
      background: #FFFFFF;
      color: #000000;
      font-family: 'Inter', Helvetica, Arial, sans-serif;
      padding: 48px;
      box-sizing: border-box;
      z-index: -1;
    `

    const dateStr = new Date().toISOString().split("T")[0]

    container.innerHTML = `
      <div style="border-top: 3px solid #D4C6A9; padding-top: 24px; margin-bottom: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 18px; font-weight: 700; letter-spacing: 2px; color: #000;">MONOLITH // SCANNER</div>
            <div style="font-size: 10px; letter-spacing: 3px; color: #888; margin-top: 4px;">AUTHORITY BLUEPRINT</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 10px; color: #888; letter-spacing: 1px;">GENERATED</div>
            <div style="font-size: 11px; color: #333; font-weight: 600;">${dateStr}</div>
          </div>
        </div>
      </div>

      <div style="border: 2px solid #D4C6A9; padding: 28px; margin-bottom: 28px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 10px; color: #888; letter-spacing: 3px; margin-bottom: 8px;">INTEGRITY SCORE</div>
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="font-size: 48px; font-weight: 800; color: #000;">${scores.integrity}</span>
              <span style="font-size: 16px; color: #999;">/ 100</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 10px; color: #888; letter-spacing: 2px; margin-bottom: 4px;">CLASSIFICATION</div>
            <div style="font-size: 14px; font-weight: 700; color: #000;">${verdict.title}</div>
          </div>
        </div>
        <div style="margin-top: 20px; height: 6px; background: #F0EDE8; position: relative;">
          <div style="height: 6px; background: #D4C6A9; width: ${scores.integrity}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 8px;">
          <span style="font-size: 9px; color: #AAA; letter-spacing: 2px;">FACADE</span>
          <span style="font-size: 9px; color: #AAA; letter-spacing: 2px;">FOUNDATION</span>
        </div>
      </div>

      <div style="margin-bottom: 28px;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #D4C6A9; margin-bottom: 16px; border-bottom: 1px solid #E8E4DE; padding-bottom: 8px;">DIMENSIONAL ANALYSIS</div>
        ${[
          { label: "SIGNAL DEPTH [SIG]", value: scores.signal },
          { label: "SYSTEM AUTOMATION [AUT]", value: scores.automation },
          { label: "STRUCTURAL AUTHORITY [STR]", value: scores.authority },
        ]
          .map(
            (d) => `
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 11px; color: #333; font-weight: 600; letter-spacing: 1px;">${d.label}</span>
              <span style="font-size: 11px; color: #000; font-weight: 700;">${d.value}%</span>
            </div>
            <div style="height: 5px; background: #F0EDE8;">
              <div style="height: 5px; background: #D4C6A9; width: ${d.value}%;"></div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>

      <div style="margin-bottom: 28px;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #D4C6A9; margin-bottom: 12px; border-bottom: 1px solid #E8E4DE; padding-bottom: 8px;">DIAGNOSTIC SUMMARY</div>
        <p style="font-size: 11px; color: #333; line-height: 1.7; margin: 0 0 16px 0;">${verdict.summary}</p>
        <div style="font-size: 10px; color: #888; letter-spacing: 2px; margin-bottom: 8px;">RECOMMENDED ACTION</div>
        <p style="font-size: 11px; color: #333; line-height: 1.7; margin: 0;">${verdict.recommendation}</p>
      </div>

      <div style="border-top: 3px solid #D4C6A9; padding-top: 12px; margin-top: 32px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="font-size: 8px; color: #AAA; letter-spacing: 2px;">MONOLITH // SCANNER v2.1.0</span>
          <span style="font-size: 8px; color: #AAA; letter-spacing: 2px;">A BOBIKCS PROPRIETARY INSTRUMENT</span>
          <span style="font-size: 8px; color: #AAA; letter-spacing: 2px;">CONFIDENTIAL</span>
        </div>
      </div>
    `

    document.body.appendChild(container)

    // Wait 500ms for any rendering/animation to settle
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Capture with html2canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#FFFFFF",
      logging: false,
    })

    // Remove the temp container
    document.body.removeChild(container)

    // Create PDF from canvas
    const imgData = canvas.toDataURL("image/png")
    const imgWidth = 210 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

    // Return blob for upload AND trigger local download
    const blob = pdf.output("blob")
    pdf.save("MONOLITH_Authority_Blueprint.pdf")

    return blob
  } catch (error) {
    console.error("[v0] PDF generation failed:", error)
    throw error
  }
}
