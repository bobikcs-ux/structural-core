"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"

interface IntegrityRadarProps {
  scores: {
    signal: number
    automation: number
    authority: number
    integrity: number
    facade: number
  }
}

function DiamondDot(props: Record<string, unknown>) {
  const { cx, cy } = props as { cx: number; cy: number }
  if (typeof cx !== "number" || typeof cy !== "number") return null
  return (
    <polygon
      points={`${cx},${cy - 4} ${cx + 4},${cy} ${cx},${cy + 4} ${cx - 4},${cy}`}
      fill="#D4C6A9"
      stroke="#D4C6A9"
      strokeWidth={1}
    />
  )
}

function FacadeDot(props: Record<string, unknown>) {
  const { cx, cy } = props as { cx: number; cy: number }
  if (typeof cx !== "number" || typeof cy !== "number") return null
  return (
    <rect
      x={cx - 3}
      y={cy - 3}
      width={6}
      height={6}
      fill="none"
      stroke="#555555"
      strokeWidth={1}
    />
  )
}

export function IntegrityRadar({ scores }: IntegrityRadarProps) {
  const data = [
    {
      dimension: "SIGNAL",
      Foundation: scores.signal,
      Facade: 100 - scores.signal,
    },
    {
      dimension: "SYSTEM",
      Foundation: scores.automation,
      Facade: 100 - scores.automation,
    },
    {
      dimension: "STRUCTURE",
      Foundation: scores.authority,
      Facade: 100 - scores.authority,
    },
  ]

  return (
    <div className="border border-terminal-line p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-xs tracking-widest text-gold uppercase">
          Strategic Instrument
        </h3>
        <span className="font-mono text-xs text-muted-foreground">
          FACADE vs FOUNDATION
        </span>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#D4C6A9" strokeOpacity={0.12} />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: "#D4C6A9", fontSize: 10, fontFamily: '"Courier New", Courier, monospace' }}
              stroke="#D4C6A9"
              strokeOpacity={0.2}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "#555", fontSize: 9 }}
              axisLine={false}
            />
            <Radar
              name="Foundation"
              dataKey="Foundation"
              stroke="#D4C6A9"
              fill="rgba(212,198,169,0.1)"
              strokeWidth={1.5}
              dot={<DiamondDot />}
            />
            <Radar
              name="Facade"
              dataKey="Facade"
              stroke="#555555"
              fill="rgba(85,85,85,0.05)"
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={<FacadeDot />}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-8 mt-2 font-mono text-xs">
        <div className="flex items-center gap-2">
          <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
            <polygon points="4,0 8,4 4,8 0,4" fill="#D4C6A9" />
          </svg>
          <span className="text-gold">FOUNDATION</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
            <rect x="1" y="1" width="6" height="6" fill="none" stroke="#555" strokeWidth="1" />
          </svg>
          <span className="text-muted-foreground">FACADE</span>
        </div>
      </div>
    </div>
  )
}
