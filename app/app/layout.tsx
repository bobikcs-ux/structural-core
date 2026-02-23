import type { Metadata } from "next"

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
    <div className="console-shell console-table">
      {children}
    </div>
  )
}
