/**
 * TraceWaterfall — cascata (waterfall) de spans de um trace distribuído.
 *
 * Cada span vira uma linha: rótulo indentado por profundidade (`depth`), uma
 * barra posicionada/dimensionada por `start`/`duration` (em fração de `total`)
 * e um valor à direita. A barra é tingida pelo `status` do span (verde/âmbar/
 * vermelho) com glow — um "heatmap" de latência p95 por span, lendo de relance
 * onde o tempo é gasto e o que está degradado.
 *
 * As porcentagens são derivadas de `start`/`duration` sobre `total` (a escala);
 * se `total` é omitido, é inferido do maior `start + duration`. A largura da
 * barra tem um mínimo visível (`minWidthPct`) para spans muito curtos. Quando há
 * ≤1 span, `leafLabel` (opcional) sinaliza "serviço folha".
 *
 * Extraído da composição `observability-center` (Pulse), com API genérica e sem
 * estado. O elemento raiz é um <div> com `data-slot="trace-waterfall"`. As cores
 * de status são severidade de data-viz, não tokens de tema.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TraceWaterfallSpan {
  /** Id estável (key); default = índice. */
  id?: string | number
  /** Rótulo do span. */
  label: React.ReactNode
  /** Início do span (mesma unidade de `total`). */
  start: number
  /** Duração/comprimento do span (mesma unidade de `total`). */
  duration: number
  /** Serviço de origem (informativo). */
  service?: string
  /** Status do span — define a cor da barra. */
  status?: string
  /** Nível de indentação do rótulo (0 = raiz). */
  depth?: number
  /** Rótulo de valor à direita (ex.: "62ms"). Default: duração formatada. */
  valueLabel?: React.ReactNode
}

export interface TraceWaterfallProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Spans do trace, na ordem de exibição. */
  spans: TraceWaterfallSpan[]
  /** Escala total. Default: max(start + duration) dos spans. */
  total?: number
  /** Cores por status. Default cobre healthy/degraded/critical. */
  statusColors?: Record<string, string>
  /** Largura mínima visível da barra, em %. Default: 2. */
  minWidthPct?: number
  /** Formata a duração quando `valueLabel` é omitido. Default: `${round}ms`. */
  formatValue?: (n: number) => string
  /** Mensagem exibida quando há ≤1 span (serviço folha). */
  leafLabel?: React.ReactNode
}

const DEFAULT_STATUS_COLORS: Record<string, string> = {
  healthy: "#10b981",
  degraded: "#f59e0b",
  critical: "#f43f5e",
}

function clampPct(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v
}

function TraceWaterfall({
  spans,
  total,
  statusColors = DEFAULT_STATUS_COLORS,
  minWidthPct = 2,
  formatValue = (n) => `${Math.round(n)}ms`,
  leafLabel,
  className,
  ...props
}: TraceWaterfallProps) {
  const scale = total ?? spans.reduce((m, s) => Math.max(m, s.start + s.duration), 0)
  const denom = scale > 0 ? scale : 100
  const colorOf = (status?: string) =>
    statusColors[status ?? "healthy"] ?? DEFAULT_STATUS_COLORS.healthy

  return (
    <div data-slot="trace-waterfall" className={cn("flex flex-col gap-1.5", className)} {...props}>
      {spans.map((span, i) => {
        const color = colorOf(span.status)
        const startPct = clampPct((span.start / denom) * 100, 0, 100)
        const widthPct = clampPct((span.duration / denom) * 100, minWidthPct, 100)
        return (
          <div key={span.id ?? i} className="flex items-center gap-2">
            <div
              className="w-24 shrink-0 truncate text-[11px] text-muted-foreground"
              style={{ paddingLeft: (span.depth ?? 0) * 8 }}
            >
              {span.label}
            </div>
            <div className="relative h-4 flex-1 overflow-hidden rounded bg-muted/50">
              <div
                className="absolute inset-y-0 rounded transition-all duration-500"
                style={{
                  left: `${startPct}%`,
                  width: `${widthPct}%`,
                  backgroundColor: color,
                  opacity: 0.85,
                  boxShadow: `0 0 6px ${color}`,
                }}
              />
            </div>
            <div className="w-12 shrink-0 text-right font-mono text-[10px] tabular-nums text-muted-foreground">
              {span.valueLabel ?? formatValue(span.duration)}
            </div>
          </div>
        )
      })}
      {spans.length <= 1 && leafLabel != null && (
        <p className="py-3 text-center text-xs text-muted-foreground">{leafLabel}</p>
      )}
    </div>
  )
}

export { TraceWaterfall }
