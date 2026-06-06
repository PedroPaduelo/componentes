import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

import { textHoverEffectVariants } from "./text-hover-effect-variants"
import type {
  TextHoverEffectGradientStop,
  TextHoverEffectProps,
} from "./text-hover-effect-types"

const DEFAULT_GRADIENT_STOPS: readonly TextHoverEffectGradientStop[] = [
  { offset: "0%", color: "#eab308" },
  { offset: "25%", color: "#ef4444" },
  { offset: "50%", color: "#3b82f6" },
  { offset: "75%", color: "#06b6d4" },
  { offset: "100%", color: "#8b5cf6" },
]

const STROKE_ANIMATION_DURATION = 4
const STROKE_DASH_LENGTH = 1000

function TextHoverEffect({
  text,
  duration = 0,
  gradientStops = DEFAULT_GRADIENT_STOPS,
  strokeWidth = 0.3,
  density,
  className,
  ...hostProps
}: TextHoverEffectProps) {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const [cursor, setCursor] = React.useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const [hovered, setHovered] = React.useState(false)
  const [maskPosition, setMaskPosition] = React.useState<{
    cx: string
    cy: string
  }>({ cx: "50%", cy: "50%" })

  React.useEffect(() => {
    if (!svgRef.current) return
    const svgRect = svgRef.current.getBoundingClientRect()
    const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100
    const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100
    setMaskPosition({
      cx: `${cxPercentage}%`,
      cy: `${cyPercentage}%`,
    })
  }, [cursor])

  return (
    <div
      data-slot="text-hover-effect"
      data-density={density ?? "default"}
      className={cn(textHoverEffectVariants({ density }), className)}
      {...hostProps}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 300 100"
        xmlns="http://www.w3.org/2000/svg"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={(event) =>
          setCursor({ x: event.clientX, y: event.clientY })
        }
        className="select-none"
        aria-label={text}
        role="img"
      >
        <defs>
          <linearGradient
            id="text-hover-effect-gradient"
            gradientUnits="userSpaceOnUse"
            cx="50%"
            cy="50%"
            r="25%"
          >
            {hovered &&
              gradientStops.map((stop) => (
                <stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor={stop.color}
                />
              ))}
          </linearGradient>

          <motion.radialGradient
            id="text-hover-effect-reveal-mask"
            gradientUnits="userSpaceOnUse"
            r="20%"
            initial={{ cx: "50%", cy: "50%" }}
            animate={maskPosition}
            transition={{ duration, ease: "easeOut" }}
          >
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </motion.radialGradient>

          <mask id="text-hover-effect-mask">
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#text-hover-effect-reveal-mask)"
            />
          </mask>
        </defs>

        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          strokeWidth={strokeWidth}
          className="fill-transparent stroke-neutral-200 font-bold text-7xl dark:stroke-neutral-800"
          style={{ opacity: hovered ? 0.7 : 0 }}
        >
          {text}
        </text>

        <motion.text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          strokeWidth={strokeWidth}
          className="fill-transparent stroke-neutral-200 font-bold text-7xl dark:stroke-neutral-800"
          initial={{
            strokeDashoffset: STROKE_DASH_LENGTH,
            strokeDasharray: STROKE_DASH_LENGTH,
          }}
          animate={{
            strokeDashoffset: 0,
            strokeDasharray: STROKE_DASH_LENGTH,
          }}
          transition={{
            duration: STROKE_ANIMATION_DURATION,
            ease: "easeInOut",
          }}
        >
          {text}
        </motion.text>

        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          stroke="url(#text-hover-effect-gradient)"
          strokeWidth={strokeWidth}
          mask="url(#text-hover-effect-mask)"
          className="fill-transparent font-bold text-7xl"
        >
          {text}
        </text>
      </svg>
    </div>
  )
}

export { TextHoverEffect }
