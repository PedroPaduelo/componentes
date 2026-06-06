import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface IconSwapProps {
  iconOn: LucideIcon
  iconOff: LucideIcon
  active: boolean
  className?: string
  duration?: number
  iconClassName?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  type?: "button" | "submit" | "reset"
  "aria-label"?: string
  "aria-hidden"?: boolean
}

export function IconSwap({
  iconOn: IconOn,
  iconOff: IconOff,
  active,
  className,
  duration = 300,
  iconClassName = "size-4",
  onClick,
  type = "button",
  "aria-label": ariaLabel = "Toggle icon",
  "aria-hidden": ariaHidden,
}: IconSwapProps) {
  const transitionStyle: React.CSSProperties = {
    transitionProperty: "opacity, transform",
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  }

  return (
    <button
      data-slot="icon-swap"
      type={type}
      onClick={onClick}
      aria-label={ariaHidden ? undefined : ariaLabel}
      aria-hidden={ariaHidden}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)` }}
    >
      <IconOn
        className={cn(
          "absolute inset-0 m-auto transition-all",
          iconClassName,
          active
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-50 rotate-90",
        )}
        style={transitionStyle}
        aria-hidden={!active}
      />
      <IconOff
        className={cn(
          "absolute inset-0 m-auto transition-all",
          iconClassName,
          !active
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-50 -rotate-90",
        )}
        style={transitionStyle}
        aria-hidden={active}
      />
      <span className={cn("invisible", iconClassName)} aria-hidden="true">
        <IconOn className={iconClassName} />
      </span>
    </button>
  )
}
