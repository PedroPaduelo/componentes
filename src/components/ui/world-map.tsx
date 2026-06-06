import { useMemo, useRef } from "react"
import { motion } from "motion/react"
import DottedMap from "dotted-map"

import { useTheme } from "@/components/theme/use-theme"
import { cn } from "@/lib/utils"
import type { WorldMapLocation, WorldMapProps } from "./world-map-types"

function projectPoint(lat: number, lng: number) {
  const x = (lng + 180) * (800 / 360)
  const y = (90 - lat) * (400 / 180)
  return { x, y }
}

function createCurvedPath(
  start: { x: number; y: number },
  end: { x: number; y: number },
) {
  const midX = (start.x + end.x) / 2
  const midY = Math.min(start.y, end.y) - 50
  return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`
}

function WorldMap({
  dots = [],
  lineColor = "#0ea5e9",
  className,
  ...props
}: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const svgMap = useMemo(() => {
    const map = new DottedMap({ height: 100, grid: "diagonal" })
    return map.getSVG({
      radius: 0.22,
      color: isDark ? "#FFFFFF40" : "#00000040",
      shape: "circle",
      backgroundColor: isDark ? "black" : "white",
    })
  }, [isDark])

  const renderPoint = (point: WorldMapLocation, key: string) => {
    const { x, y } = projectPoint(point.lat, point.lng)
    return (
      <g key={key}>
        <circle cx={x} cy={y} r="2" fill={lineColor} />
        <circle cx={x} cy={y} r="2" fill={lineColor} opacity="0.5">
          <animate
            attributeName="r"
            from="2"
            to="8"
            dur="1.5s"
            begin="0s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.5"
            to="0"
            dur="1.5s"
            begin="0s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    )
  }

  return (
    <div
      data-slot="world-map"
      className={cn(
        "relative aspect-[2/1] w-full rounded-lg bg-white font-sans dark:bg-black",
        className,
      )}
      {...props}
    >
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="pointer-events-none h-full w-full select-none [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)]"
        alt="Mapa-múndi pontilhado"
        height="495"
        width="1056"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
      >
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng)
          const endPoint = projectPoint(dot.end.lat, dot.end.lng)
          return (
            <motion.path
              key={`path-${i}`}
              d={createCurvedPath(startPoint, endPoint)}
              fill="none"
              stroke="url(#world-map-path-gradient)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5 * i, ease: "easeOut" }}
            />
          )
        })}

        <defs>
          <linearGradient
            id="world-map-path-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {dots.map((dot, i) => (
          <g key={`points-${i}`}>
            {renderPoint(dot.start, `start-${i}`)}
            {renderPoint(dot.end, `end-${i}`)}
          </g>
        ))}
      </svg>
    </div>
  )
}

export { WorldMap }
