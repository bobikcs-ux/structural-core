import { cn } from "@/lib/utils"

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  className?: string
  color?: "green" | "amber" | "red" | "muted"
}

const colorMap = {
  green: "stroke-status-healthy",
  amber: "stroke-status-warning",
  red: "stroke-status-offline",
  muted: "stroke-muted-foreground/50",
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  className,
  color = "green",
}: SparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  })

  const pathData = `M ${points.join(" L ")}`

  // Create area fill path
  const areaPath = `${pathData} L ${width},${height} L 0,${height} Z`

  return (
    <svg
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`sparkline-gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop
            offset="0%"
            className={cn({
              "stop-status-healthy/20": color === "green",
              "stop-status-warning/20": color === "amber",
              "stop-status-offline/20": color === "red",
              "stop-muted-foreground/10": color === "muted",
            })}
            style={{
              stopColor:
                color === "green"
                  ? "hsl(142 76% 46% / 0.2)"
                  : color === "amber"
                    ? "hsl(45 93% 47% / 0.2)"
                    : color === "red"
                      ? "hsl(0 72% 51% / 0.2)"
                      : "hsl(220 10% 55% / 0.1)",
            }}
          />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaPath} fill={`url(#sparkline-gradient-${color})`} />

      {/* Line */}
      <path
        d={pathData}
        fill="none"
        className={cn(colorMap[color], "animate-pulse-line")}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End point indicator */}
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r={2}
        className={cn({
          "fill-status-healthy": color === "green",
          "fill-status-warning": color === "amber",
          "fill-status-offline": color === "red",
          "fill-muted-foreground/50": color === "muted",
        })}
      />
    </svg>
  )
}
