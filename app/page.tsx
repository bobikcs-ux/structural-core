"use client"

import { useState } from "react"
import { ClearanceBar } from "@/components/clearance-bar"
import { BottomNav, type NavKey } from "@/components/bottom-nav"
import { DashboardPanel } from "@/components/panels/dashboard-panel"
import { ArchivePanel } from "@/components/panels/archive-panel"
import { ScannerPanel } from "@/components/panels/scanner-panel"
import { SimulationPanel } from "@/components/panels/simulation-panel"

function ActivePanel({ active }: { active: NavKey }) {
  switch (active) {
    case "dashboard":
      return <DashboardPanel />
    case "archive":
      return <ArchivePanel />
    case "scanner":
      return <ScannerPanel />
    case "simulation":
      return <SimulationPanel />
  }
}

export default function Page() {
  const [active, setActive] = useState<NavKey>("dashboard")

  return (
    <main className="flex flex-col h-dvh overflow-hidden bg-background">
      <ClearanceBar />
      <div className="flex-1 overflow-hidden">
        <ActivePanel active={active} />
      </div>
      <BottomNav active={active} onNavigate={setActive} />
    </main>
  )
}
