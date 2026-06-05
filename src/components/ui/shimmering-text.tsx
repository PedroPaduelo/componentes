import * as React from "react"
import { cn } from "@/lib/utils"

export type ShimmeringTextProps = React.HTMLAttributes<HTMLSpanElement> & {
  children: React.ReactNode
  duration?: number
  as?: "h1" | "h2" | "span" | "p"
  /** Cor base do texto (geralmente muted-foreground). Default: color-mix(in oklab, var(--muted-foreground) 50%, transparent). */
  color?: string
  /** Cor do highlight (geralmente foreground). Default: var(--foreground). */
  shimmerColor?: string
}

function ShimmeringText({
  children,
  duration = 2,
  as: Tag = "span",
  color,
  shimmerColor,
  className,
  style,
  ...props
}: ShimmeringTextProps) {
  const text = typeof children === "string" ? children : String(children)

  return (
    <Tag
      data-slot="shimmering-text"
      className={cn(
        "relative inline-block bg-clip-text text-transparent",
        "bg-gradient-to-r from-[var(--shimmering-text-color)] via-[var(--shimmering-text-highlight)] to-[var(--shimmering-text-color)]",
        "bg-[length:200%_auto] animate-shimmer",
        className
      )}
      style={{
        ...style,
        animationDuration: `${duration}s`,
        "--shimmering-text-color":
          color ??
          "color-mix(in oklab, var(--muted-foreground) 50%, transparent)",
        "--shimmering-text-highlight": shimmerColor ?? "var(--foreground)",
      } as React.CSSProperties & Record<`--${string}`, string>}
      {...props}
    >
      {text}
    </Tag>
  )
}

export { ShimmeringText }
