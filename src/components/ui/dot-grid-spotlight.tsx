"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface DotGridSpotlightProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Size of each dot in px. @default 1 */
  dotSize?: number
  /** Spacing between dots in px. @default 24 */
  dotSpacing?: number
  /** Radius of the spotlight in px. @default 300 */
  spotlightSize?: number
  /** Color of the spotlight overlay. Defaults to accent color. */
  spotlightColor?: string
  /** Content rendered on top of the grid. */
  children?: React.ReactNode
}

function DotGridSpotlight({
  className,
  dotSize = 1,
  dotSpacing = 24,
  spotlightSize = 300,
  spotlightColor,
  children,
  style,
  ...props
}: DotGridSpotlightProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = React.useState({ x: -9999, y: -9999 })
  const rafRef = React.useRef<number | null>(null)

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          })
        }
        rafRef.current = null
      })
    },
    []
  )

  const handleMouseLeave = React.useCallback(() => {
    setMousePos({ x: -9999, y: -9999 })
  }, [])

  React.useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const dotColor = "var(--muted-foreground)"
  const spotlightBg = spotlightColor ?? "var(--accent)"

  return (
    <div
      ref={containerRef}
      data-slot="dot-grid-spotlight"
      className={cn("relative overflow-hidden", className)}
      style={
        {
          "--mouse-x": `${mousePos.x}px`,
          "--mouse-y": `${mousePos.y}px`,
          "--dot-size": `${dotSize}px`,
          "--dot-spacing": `${dotSpacing}px`,
          "--spotlight-size": `${spotlightSize}px`,
          ...style,
        } as React.CSSProperties
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Layer 1: Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${dotColor} var(--dot-size), transparent var(--dot-size))`,
          backgroundSize: `var(--dot-spacing) var(--dot-spacing)`,
        }}
      />

      {/* Layer 2: Spotlight mask that reveals dots on hover */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          backgroundColor: spotlightBg,
          maskImage: `radial-gradient(circle var(--spotlight-size) at var(--mouse-x) var(--mouse-y), black, transparent)`,
          WebkitMaskImage: `radial-gradient(circle var(--spotlight-size) at var(--mouse-x) var(--mouse-y), black, transparent)`,
          opacity: mousePos.x < 0 ? 0 : 0.15,
        }}
      />

      {/* Layer 3: Content */}
      {children && (
        <div className="relative z-10">{children}</div>
      )}
    </div>
  )
}

export { DotGridSpotlight }
