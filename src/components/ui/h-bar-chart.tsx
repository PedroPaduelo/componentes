/**
 * HBarChart — gráfico de barras HORIZONTAIS minimalista, feito só com divs.
 *
 * Cada linha mostra o rótulo à esquerda, uma trilha (track) com a barra
 * preenchida proporcional ao maior valor da série, e o valor numérico à
 * direita. A largura da barra é aplicada por `style` inline (nunca classe
 * interpolada). Ótimo para rankings/comparações (ex.: canais de aquisição).
 * No hover, mostra um tooltip com rótulo + valor + participação no total
 * (`showTooltip`, default true; só na interação, sem alterar o render
 * estático).
 *
 * Extraído da composição `saas-dashboard-pro`. Sem dependências novas. O
 * elemento raiz expõe `data-slot="h-bar-chart"` e aceita className/props
 * padrão de um <div>.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/** Um ponto da série: rótulo + valor numérico. */
export interface HBarChartDatum {
  label: string
  value: number
}

export interface HBarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Série de barras (rótulo + valor). O maior valor define a barra cheia (100%). */
  series: HBarChartDatum[]
  /** Se true, mostra tooltip (rótulo + valor + %) no hover. Default: true. */
  showTooltip?: boolean
  /** Formata o valor exibido no tooltip. Default: `String(v)`. */
  valueFormatter?: (value: number) => string
}

function HBarChart({
  series,
  showTooltip = true,
  valueFormatter = (v) => String(v),
  className,
  ...props
}: HBarChartProps) {
  const max = Math.max(...series.map((s) => s.value), 1)
  const total = series.reduce((acc, s) => acc + s.value, 0) || 1
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  return (
    <div
      data-slot="h-bar-chart"
      className={cn("flex flex-col gap-3", className)}
      onMouseLeave={() => setActiveIndex(null)}
      {...props}
    >
      {series.map((s, i) => {
        const pct = (s.value / max) * 100
        const share = Math.round((s.value / total) * 100)
        const isActive = activeIndex === i
        const dimmed = activeIndex !== null && !isActive
        return (
          <div
            key={s.label}
            className="relative flex items-center gap-3"
            onMouseEnter={showTooltip ? () => setActiveIndex(i) : undefined}
          >
            <span className="w-20 shrink-0 truncate text-xs text-muted-foreground">
              {s.label}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full bg-primary transition-opacity",
                  dimmed && "opacity-40",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-xs font-medium text-foreground">
              {s.value}
            </span>

            {showTooltip && isActive && (
              <div className="pointer-events-none absolute left-20 top-0 z-10 -translate-y-[calc(100%+4px)]">
                <div className="whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-md">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="ml-2 font-medium tabular-nums text-popover-foreground">
                    {valueFormatter(s.value)}
                  </span>
                  <span className="ml-1.5 text-muted-foreground tabular-nums">
                    ({share}%)
                  </span>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export { HBarChart }
