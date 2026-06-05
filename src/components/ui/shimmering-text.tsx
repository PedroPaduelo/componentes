import * as React from "react"
import { cn } from "@/lib/utils"

export type ShimmeringTextProps = React.HTMLAttributes<HTMLSpanElement> & {
  children: React.ReactNode
  duration?: number
  as?: "h1" | "h2" | "span" | "p"
}

function ShimmeringText({
  children,
  duration = 2,
  as: Tag = "span",
  className,
  ...props
}: ShimmeringTextProps) {
  const text = typeof children === "string" ? children : String(children)

  return (
    <Tag
      data-slot="shimmering-text"
      className={cn(
        "relative inline-block bg-clip-text text-transparent",
        "bg-gradient-to-r from-muted-foreground/50 via-foreground to-muted-foreground/50",
        "bg-[length:200%_auto] animate-shimmer",
        className
      )}
      style={{ animationDuration: `${duration}s` }}
      {...props}
    >
      {text}
    </Tag>
  )
}

export { ShimmeringText }
