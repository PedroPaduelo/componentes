import * as React from "react"
import { motion, useMotionValue, useSpring } from "motion/react"
import { cn } from "@/lib/utils"

export interface FluidGradientTextProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Text content rendered inside the SVG. */
  text: string
  /**
   * SVG viewBox width used to scale the gradient and text layout.
   * @default 1200
   */
  svgViewBoxWidth?: number
  /**
   * SVG viewBox height used as the base text size.
   * @default 300
   */
  svgViewBoxHeight?: number
}

function FluidGradientText({
  text,
  svgViewBoxWidth = 1200,
  svgViewBoxHeight = 300,
  className,
  ...hostProps
}: FluidGradientTextProps) {
  const gradientX1Raw = useMotionValue(svgViewBoxWidth / 2)
  const gradientX1 = useSpring(gradientX1Raw, {
    stiffness: 200,
    damping: 30,
    mass: 0.5,
  })

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = event.currentTarget
    const containerRect = container.getBoundingClientRect()
    const mouseX = event.clientX - containerRect.left
    const containerWidth = containerRect.width
    const normalizedX = (mouseX / containerWidth) * svgViewBoxWidth
    const clampedX = Math.max(0, Math.min(svgViewBoxWidth, normalizedX))
    gradientX1Raw.set(clampedX)
  }

  const handleMouseLeave = () => {
    gradientX1Raw.set(svgViewBoxWidth / 2)
  }

  return (
    <div
      data-slot="fluid-gradient-text"
      className={cn(
        "relative size-full overflow-hidden after:absolute after:bottom-0 after:h-px after:w-full after:bg-current/15",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...hostProps}
    >
      <svg
        viewBox={`0 0 ${svgViewBoxWidth} ${svgViewBoxHeight}`}
        className="h-full w-full select-none"
      >
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="url(#fluid_gradient_text_linear)"
          style={{
            fontFamily: "Helvetica",
            fontSize: svgViewBoxHeight,
            fontWeight: "bold",
          }}
        >
          {text}
        </text>
        <defs>
          <motion.linearGradient
            id="fluid_gradient_text_linear"
            x1={gradientX1}
            y1="0"
            x2={svgViewBoxWidth / 2}
            y2={svgViewBoxHeight}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.625" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" stopOpacity="1" />
          </motion.linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export { FluidGradientText }
