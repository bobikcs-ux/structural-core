import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "BOBIKCS // STRUCTURAL CORE -- Console",
  description: "Authenticated core console for sovereign structural risk monitoring.",
}

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader />
      <div className="console-shell console-table" style={{ height: "calc(100dvh - 56px)", marginTop: "56px" }}>
        {children}
      </div>
    </>
  )
}
