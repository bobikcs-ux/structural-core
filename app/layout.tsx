import type { Metadata, Viewport } from "next"
import { IBM_Plex_Mono } from "next/font/google"
import "./globals.css"

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "BOBIKCS // STRUCTURAL CORE",
  description: "Sovereign Intelligence Platform -- Deterministic Command & Control",
}

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={ibmPlexMono.variable}>
      <body className="font-mono">
        {children}
      </body>
    </html>
  )
}
