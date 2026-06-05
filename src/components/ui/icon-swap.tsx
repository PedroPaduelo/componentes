"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface IconSwapProps extends React.HTMLAttributes<HTMLElement> {
  /** Ícone exibido quando active=true (ex.: Sun). */
  iconOn: LucideIcon
  /** Ícone exibido quando active=false (ex.: Moon). */
  iconOff: LucideIcon
  /** Controla qual ícone está visível. */
  active: boolean
  /**
   * Elemento do wrapper. Default: `"span"`. Use `"button"` (ou outro elemento
   * interativo) para tornar o wrapper focável, anunciável por screen readers e
   * responsivo a Enter/Space:
   *
   *   <IconSwap
   *     as="button"
   *     type="button"
   *     onClick={toggle}
   *     aria-label="Alternar tema"
   *     iconOn={Sun}
   *     iconOff={Moon}
   *     active={dark}
   *   />
   *
   * Para o caso comum (decore um botão externo), basta passar `aria-hidden`
   * e o wrapper continua sendo um `<span>` neutro:
   *
   *   <Button onClick={toggle} aria-label="Alternar">
   *     <IconSwap aria-hidden iconOn={Sun} iconOff={Moon} active={dark} />
   *   </Button>
   */
  as?: React.ElementType
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
  as: Comp = "span",
  className,
  duration = 300,
  iconClassName = "size-4",
  ...hostProps
}: IconSwapProps) {
  const transitionStyle: React.CSSProperties = {
    transitionProperty: "opacity, transform",
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  }

  const ariaLabel = hostProps["aria-label"]
  const ariaHidden = hostProps["aria-hidden"]
  // Semântica acessível: quando o consumidor fornece um aria-label e NÃO marcou
  // o wrapper como decorativo (aria-hidden), promovemos o wrapper a role="img"
  // para que screen readers o anunciem como um gráfico rotulado.
  const role = !ariaHidden && ariaLabel ? "img" : undefined

  return (
    <Comp
      data-slot="icon-swap"
      role={role}
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
      style={{ transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)` }}
      {...hostProps}
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
    </Comp>
  )
}

export { IconSwap as default }
