/**
 * DonutBreakdown — donut de distribuição + legenda, com rótulo central opcional.
 *
 * Combina o `DonutChart` (anel proporcional) com uma legenda de itens (bolinha
 * de cor + rótulo + valor). O vão central do anel pode receber um rótulo (ex.:
 * total) via `centerLabel`/`centerSublabel`. Ideal para "Distribuição de planos",
 * "Mix de receita por categoria" e afins.
 *
 * Extraído da composição `saas-dashboard-pro`. Reusa o `DonutChart` do barrel
 * (vira registryDependency), sem estado próprio. O elemento raiz expõe
 * `data-slot="donut-breakdown"` e aceita className/props padrão de um <div>.
 *
 * Cada segmento traz a classe de cor do arco (`className`, ex.: "stroke-primary").
 * A bolinha da legenda usa `dotClassName` quando informada; senão é derivada do
 * `className` trocando o prefixo `stroke-` por `bg-`.
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { DonutChart } from "@/components/ui/donut-chart"

/** Um segmento da distribuição. */
export interface DonutBreakdownSegment {
  /** Rótulo exibido na legenda. */
  label: string
  /** Valor (peso do arco no donut e número na legenda). */
  value: number
  /** Classe Tailwind da cor do arco (ex.: "stroke-primary"). */
  className?: string
  /**
   * Classe Tailwind da cor da bolinha na legenda (ex.: "bg-primary"). Default:
   * derivada de `className` (`stroke-` → `bg-`).
   */
  dotClassName?: string
}

export interface DonutBreakdownProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Segmentos da distribuição. */
  segments: DonutBreakdownSegment[]
  /** Título opcional acima do bloco. */
  title?: React.ReactNode
  /** Rótulo central, dentro do anel (ex.: total). */
  centerLabel?: React.ReactNode
  /** Sub-rótulo central, abaixo do `centerLabel`. */
  centerSublabel?: React.ReactNode
  /** Diâmetro do donut em px. Default: 168. */
  size?: number
  /**
   * Posição da legenda: "horizontal" (à direita, padrão; empilha no mobile) ou
   * "vertical" (sempre abaixo do donut).
   */
  orientation?: "horizontal" | "vertical"
}

const FALLBACK_ARC = "stroke-primary"
const FALLBACK_DOT = "bg-primary"

function dotClass(className?: string, dotClassName?: string) {
  if (dotClassName) return dotClassName
  if (className) return className.replace(/\bstroke-/g, "bg-")
  return FALLBACK_DOT
}

function DonutBreakdown({
  segments,
  title,
  centerLabel,
  centerSublabel,
  size = 168,
  orientation = "horizontal",
  className,
  ...props
}: DonutBreakdownProps) {
  const hasCenter = centerLabel != null || centerSublabel != null
  return (
    <div
      data-slot="donut-breakdown"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      {title ? (
        <p className="text-sm font-medium text-foreground">{title}</p>
      ) : null}
      <div
        className={cn(
          "flex flex-col items-center gap-4",
          orientation === "horizontal" && "sm:flex-row sm:items-center sm:gap-6"
        )}
      >
        <div
          className="relative shrink-0"
          style={{ width: size, height: size }}
        >
          <DonutChart
            size={size}
            segments={segments.map((s) => ({
              label: s.label,
              value: s.value,
              className: s.className ?? FALLBACK_ARC,
            }))}
          />
          {hasCenter ? (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              {centerLabel != null ? (
                <span className="text-2xl font-semibold text-foreground">
                  {centerLabel}
                </span>
              ) : null}
              {centerSublabel != null ? (
                <span className="text-[11px] text-muted-foreground">
                  {centerSublabel}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        <ul className="flex w-full flex-col gap-2">
          {segments.map((s) => (
            <li
              key={s.label}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2 text-foreground">
                <span
                  className={cn(
                    "size-2.5 rounded-full",
                    dotClass(s.className, s.dotClassName)
                  )}
                />
                {s.label}
              </span>
              <span className="font-medium text-foreground">{s.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export { DonutBreakdown }
