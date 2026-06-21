/**
 * BarChart — gráfico de barras VERTICAIS minimalista, feito só com divs.
 *
 * Cada barra tem altura proporcional ao maior valor da série (normalização
 * local), com a cor de preenchimento controlável via `accent` (classe
 * Tailwind, ex.: "bg-primary" / "bg-emerald-500"). A altura é aplicada por
 * `style` inline (nunca classe interpolada), garantindo qualquer percentual.
 * No hover, mostra um tooltip com o rótulo + valor da barra sob o cursor
 * (`showTooltip`, default true; só aparece na interação, sem alterar o
 * render estático).
 *
 * Extraído da composição `saas-dashboard-pro`. Sem dependências novas. O
 * elemento raiz expõe `data-slot="bar-chart"` e aceita className/props padrão
 * de um <div>.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/** Um ponto da série: rótulo do eixo + valor numérico. */
export interface BarChartDatum {
  label: string
  value: number
}

export interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Série de barras (rótulo + valor). O maior valor define o topo (100%). */
  series: BarChartDatum[]
  /** Classe Tailwind de cor de preenchimento das barras. Default: "bg-primary". */
  accent?: string
  /** Se true, mostra tooltip (rótulo + valor) no hover. Default: true. */
  showTooltip?: boolean
  /** Formata o valor exibido no tooltip. Default: `String(v)`. */
  valueFormatter?: (value: number) => string
}

function BarChart({
  series,
  accent = "bg-primary",
  showTooltip = true,
  valueFormatter = (v) => String(v),
  className,
  ...props
}: BarChartProps) {
  const max = Math.max(...series.map((s) => s.value), 1)
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  return (
    <div
      data-slot="bar-chart"
      // items-stretch (não items-end): as colunas precisam esticar até a altura
      // do root (h-40) para o wrapper flex-1 ter altura DEFINIDA — só assim o
      // `height: <pct>%` das barras resolve. Com items-end a coluna ficava com
      // altura "auto", o flex-1 colapsava e as barras saíam com 0px.
      className={cn("relative flex h-40 items-stretch gap-1.5", className)}
      onMouseLeave={() => setActiveIndex(null)}
      {...props}
    >
      {series.map((s, i) => {
        const pct = (s.value / max) * 100
        const isActive = activeIndex === i
        const dimmed = activeIndex !== null && !isActive
        return (
          <div
            key={s.label}
            className="relative flex min-w-0 flex-1 flex-col items-center gap-1.5"
            onMouseEnter={
              showTooltip ? () => setActiveIndex(i) : undefined
            }
          >
            <div className="flex w-full flex-1 items-end">
              <div
                className={cn(
                  "w-full rounded-t-md transition-opacity",
                  accent,
                  dimmed && "opacity-40",
                )}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className="w-full truncate text-center text-[10px] text-muted-foreground">
              {s.label}
            </span>

            {showTooltip && isActive && (
              <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
                <div className="whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-md">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="ml-2 font-medium tabular-nums text-popover-foreground">
                    {valueFormatter(s.value)}
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

export { BarChart }
