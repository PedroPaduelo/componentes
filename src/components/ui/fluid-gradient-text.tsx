import * as React from "react"
import { cn } from "@/lib/utils"

type HeadingTag = "h1" | "h2" | "h3" | "span" | "p"

export interface FluidGradientTextProps {
  /** Text content rendered with the animated gradient. */
  children: React.ReactNode
  /**
   * Tailwind gradient color stops (from / via / to).
   * Default: purple → blue → cyan (shadcn-friendly, visible in both themes).
   * Colors use `color-mix` with `--foreground` for readability in light mode.
   */
  colors?: string[]
  /** Animation speed. */
  speed?: "slow" | "normal" | "fast"
  /** Additional class names on the wrapper. */
  className?: string
  /** HTML tag to render. Default: "span". */
  as?: HeadingTag
}

const speedMap: Record<string, string> = {
  slow: "8s",
  normal: "4s",
  fast: "2s",
}

const defaultColors = [
  "var(--foreground)",
  "oklch(0.65 0.25 265)",    // purple
  "oklch(0.6 0.2 200)",      // cyan
  "var(--foreground)",
]

function FluidGradientText({
  children,
  colors = defaultColors,
  speed = "normal",
  className,
  as: Tag = "span",
}: FluidGradientTextProps) {
  const gradientColors = colors.join(", ")
  const duration = speedMap[speed] ?? speedMap.normal

  return (
    <Tag
      data-slot="fluid-gradient-text"
      className={cn(
        "inline-block",
        "bg-clip-text text-transparent",
        "animate-gradient-shift",
        className
      )}
      style={{
        backgroundImage: `linear-gradient(90deg, ${gradientColors})`,
        backgroundSize: "200% 100%",
        // @ts-expect-error CSS custom property for animation duration
        "--gradient-duration": duration,
      }}
    >
      {children}
    </Tag>
  )
}

export { FluidGradientText }
