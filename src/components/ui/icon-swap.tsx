"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface IconSwapProps extends Omit<React.HTMLAttributes<HTMLElement>, "type"> {
  /** Ícone exibido quando active=true (ex.: Sun). */
  iconOn: LucideIcon
  /** Ícone exibido quando active=false (ex.: Moon). */
  iconOff: LucideIcon
  /** Controla qual ícone está visível. */
  active: boolean
  /**
   * Elemento do wrapper. Default: `"button"` — o wrapper é focável, anunciável
   * por screen readers e responsivo a Enter/Space por padrão:
   *
   *   <IconSwap
   *     onClick={toggle}
   *     aria-label="Alternar tema"
   *     iconOn={Sun}
   *     iconOff={Moon}
   *     active={dark}
   *   />
   *
   * Para usar como decoração de um botão externo, passe `as="span"` + `aria-hidden`:
   *
   *   <Button onClick={toggle} aria-label="Alternar">
   *     <IconSwap as="span" aria-hidden iconOn={Sun} iconOff={Moon} active={dark} />
   *   </Button>
   */
  as?: React.ElementType
  /** Tipo do botão quando `as="button"` (default `"button"`, nunca submit acidental). */
  type?: "button" | "submit" | "reset"
  /** Rótulo acessível do wrapper (default `"Toggle icon"`). */
  "aria-label"?: string
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
  as: Comp = "button",
  type = "button",
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

  const isButton = Comp === "button"
  const ariaLabel = hostProps["aria-label"] ?? "Toggle icon"
  const ariaHidden = hostProps["aria-hidden"]
  // Para wrappers NÃO interativos (ex.: span) que recebem um aria-label e não
  // foram marcados como decorativos, promovemos a role="img" para que screen
  // readers o anunciem como gráfico rotulado. Um <button> já tem role próprio.
  const role = !isButton && !ariaHidden && ariaLabel ? "img" : undefined

  return (
    <Comp
      data-slot="icon-swap"
      type={isButton ? type : undefined}
      role={role}
      aria-label={ariaHidden ? undefined : ariaLabel}
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
