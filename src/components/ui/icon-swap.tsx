"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface IconSwapProps {
  /** Ícone exibido quando active=true (ex.: Sun). */
  iconOn: LucideIcon
  /** Ícone exibido quando active=false (ex.: Moon). */
  iconOff: LucideIcon
  /** Controla qual ícone está visível. */
  active: boolean
  /** Classes adicionais no container. */
  className?: string
  /** Duração da transição em ms (default 300). */
  duration?: number
  /** Tamanho do ícone em classes Tailwind (default "size-4"). */
  iconClassName?: string
}

export function IconSwap({
  iconOn: IconOn,
  iconOff: IconOff,
  active,
  className,
  duration = 300,
  iconClassName = "size-4",
}: IconSwapProps) {
  const transitionStyle: React.CSSProperties = {
    transitionProperty: "opacity, transform",
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  }

  return (
    <span
      data-slot="icon-swap"
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
      style={{ transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)` }}
    >
      <IconOn
        className={cn(
          "absolute inset-0 m-auto transition-all",
          iconClassName,
          active
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-50 rotate-90"
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
            : "opacity-0 scale-50 -rotate-90"
        )}
        style={transitionStyle}
        aria-hidden={active}
      />
      {/* Placeholder pra manter o tamanho do container */}
      <span className={cn("invisible", iconClassName)} aria-hidden="true">
        <IconOn className={iconClassName} />
      </span>
    </span>
  )
}

export { IconSwap as default }
