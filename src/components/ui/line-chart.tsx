/**
 * LineChart — gráfico de linha em SVG com eixos, grid, área, legenda e tooltip.
 *
 * Desenha uma ou mais séries temporais como polylines sobre um par de eixos
 * (X com labels, Y com valores normalizados). Oferece grid tracejado opcional,
 * preenchimento de área translúcida por série, legenda com indicadores de
 * cor e um tooltip interativo no hover (linha-guia vertical + marcadores nos
 * pontos + cartão com os valores de cada série no índice ativo). A escala
 * vertical é normalizada ao min/max global de todas as séries, garantindo
 * proporção consistente entre linhas concorrentes. Cores via classes Tailwind
 * em cada série (ou `stroke-primary` como default).
 *
 * Sem dependências externas. O <svg> carrega `data-slot="line-chart"`; o
 * tooltip vive numa camada HTML sobreposta (posicionada em % do container,
 * já que o SVG usa `preserveAspectRatio="none"`).
 *
 * Segue a mesma filosofia do Sparkline (SVG puro, classes Tailwind para cores,
 * normalização local min/max), adicionando eixos, grid, múltiplas séries,
 * legenda e tooltip.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

export interface LineSeries {
  /** Rótulo exibido na legenda. */
  label: string
  /** Série de valores numéricos. */
  data: number[]
  /** Classe Tailwind da cor da linha. Default: "stroke-primary". */
  className?: string
}

export interface LineChartProps
  extends Omit<
    React.SVGProps<SVGSVGElement>,
    "children" | "width" | "height"
  > {
  /** Série(s) de valores a traçar. Cada uma vira uma polyline. */
  series: LineSeries[]
  /** Rótulos do eixo X (comprimento deve bater com `series[].data.length`). */
  xLabels?: string[]
  /** Altura renderizada via className. Default: "h-48". */
  height?: string
  /** Se true, preenche área abaixo de cada linha. Default: true. */
  showArea?: boolean
  /** Se true, desenha linhas de grid tracejadas. Default: true. */
  showGrid?: boolean
  /** Se true, renderiza bloco de legenda abaixo do SVG. Default: true. */
  showLegend?: boolean
  /** Se true, mostra tooltip interativo no hover. Default: true. */
  showTooltip?: boolean
  /** Formata o valor exibido no tooltip. Default: `String(v)`. */
  valueFormatter?: (value: number) => string
  /** Largura do viewBox (sistema de coordenadas). Default: 600. */
  width?: number
  /** Altura do viewBox (sistema de coordenadas). Default: 200. */
  viewBoxHeight?: number
}

/* -------------------------------------------------------------------------- */
/* Helpers internos                                                            */
/* -------------------------------------------------------------------------- */

const PADDING_LEFT = 36
const PADDING_BOTTOM = 24
const PADDING_TOP = 12
const PADDING_RIGHT = 12

function buildPoints(
  data: number[],
  min: number,
  span: number,
  w: number,
  h: number,
): string[] {
  const innerW = w - PADDING_LEFT - PADDING_RIGHT
  const innerH = h - PADDING_TOP - PADDING_BOTTOM
  const step = data.length > 1 ? innerW / (data.length - 1) : innerW
  return data.map((p, i) => {
    const x = PADDING_LEFT + i * step
    const y = PADDING_TOP + innerH - ((p - min) / span) * innerH
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
}

function yAxisTicks(min: number, max: number, count = 4): number[] {
  const span = Math.max(max - min, 1)
  const step = span / count
  return Array.from({ length: count + 1 }, (_, i) =>
    Math.round((min + step * i) * 100) / 100,
  )
}

/* -------------------------------------------------------------------------- */
/* Componente                                                                  */
/* -------------------------------------------------------------------------- */

function LineChart({
  series,
  xLabels,
  height = "h-48",
  showArea = true,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  valueFormatter = (v) => String(v),
  width = 600,
  viewBoxHeight = 200,
  className,
  ...props
}: LineChartProps) {
  const w = width
  const h = viewBoxHeight
  const innerW = w - PADDING_LEFT - PADDING_RIGHT
  const innerH = h - PADDING_TOP - PADDING_BOTTOM

  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  // Normalização global: min/max de todas as séries juntas
  const allValues = series.flatMap((s) => s.data)
  const max = allValues.length > 0 ? Math.max(...allValues) : 0
  const min = allValues.length > 0 ? Math.min(...allValues) : 0
  const span = Math.max(max - min, 1)

  const ticks = yAxisTicks(min, max)

  // Comprimento "principal" (1ª série) governa o eixo X e o índice ativo.
  const lenMain = series[0]?.data.length ?? 0
  const stepMain = lenMain > 1 ? innerW / (lenMain - 1) : innerW

  /** Posição X (em % do container) do ponto de índice `i`. */
  const xPctAt = (i: number) => ((PADDING_LEFT + i * stepMain) / w) * 100

  /** Posição (em % do container) de cada ponto de cada série, p/ os markers. */
  const seriesPct = series.map((s) => {
    const step = s.data.length > 1 ? innerW / (s.data.length - 1) : innerW
    return s.data.map((p, i) => ({
      x: ((PADDING_LEFT + i * step) / w) * 100,
      y: ((PADDING_TOP + innerH - ((p - min) / span) * innerH) / h) * 100,
    }))
  })

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!showTooltip || lenMain === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    if (rect.width === 0) return
    const relX = (e.clientX - rect.left) / rect.width
    const leftFrac = PADDING_LEFT / w
    const rightFrac = (w - PADDING_RIGHT) / w
    const t = (relX - leftFrac) / Math.max(rightFrac - leftFrac, 1e-6)
    const idx = Math.max(0, Math.min(lenMain - 1, Math.round(t * (lenMain - 1))))
    setActiveIndex(idx)
  }

  const tooltipActive = showTooltip && activeIndex !== null
  // Mantém o cartão dentro do container (evita corte nas bordas).
  const tooltipLeft =
    activeIndex !== null ? Math.min(94, Math.max(6, xPctAt(activeIndex))) : 0

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn("relative", height)}
        onMouseMove={handleMove}
        onMouseLeave={() => setActiveIndex(null)}
      >
        <svg
          data-slot="line-chart"
          viewBox={`0 0 ${w} ${h}`}
          className={cn("h-full w-full", className)}
          preserveAspectRatio="none"
          role="img"
          aria-label="Gráfico de linha"
          {...props}
        >
          {/* Grid horizontal tracejado + ticks do eixo Y */}
          {showGrid &&
            ticks.map((tick, i) => {
              const y =
                PADDING_TOP + innerH - ((tick - min) / span) * innerH
              return (
                <g key={`grid-${i}`}>
                  <line
                    x1={PADDING_LEFT}
                    y1={y}
                    x2={w - PADDING_RIGHT}
                    y2={y}
                    className="stroke-border"
                    strokeWidth={0.5}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={PADDING_LEFT - 6}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-muted-foreground text-[8px]"
                  >
                    {tick}
                  </text>
                </g>
              )
            })}

          {/* Eixo X labels */}
          {xLabels &&
            xLabels.map((label, i) => {
              const seriesLen = series[0]?.data.length ?? xLabels.length
              const step =
                seriesLen > 1 ? innerW / (seriesLen - 1) : innerW
              const x = PADDING_LEFT + i * step
              return (
                <text
                  key={`xlabel-${i}`}
                  x={x}
                  y={h - 6}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[8px]"
                >
                  {label}
                </text>
              )
            })}

          {/* Linha do eixo X */}
          <line
            x1={PADDING_LEFT}
            y1={PADDING_TOP + innerH}
            x2={w - PADDING_RIGHT}
            y2={PADDING_TOP + innerH}
            className="stroke-border"
            strokeWidth={0.5}
          />

          {/* Linha do eixo Y */}
          <line
            x1={PADDING_LEFT}
            y1={PADDING_TOP}
            x2={PADDING_LEFT}
            y2={PADDING_TOP + innerH}
            className="stroke-border"
            strokeWidth={0.5}
          />

          {/* Séries (polylines + área) */}
          {series.map((s, si) => {
            const pts = buildPoints(s.data, min, span, w, h)
            const linePoints = pts.join(" ")
            const strokeClass = s.className ?? "stroke-primary"
            const areaPoints = `${PADDING_LEFT},${PADDING_TOP + innerH} ${linePoints} ${PADDING_LEFT + innerW},${PADDING_TOP + innerH}`
            const areaFillClass = strokeClass.replace(
              "stroke-",
              "fill-",
            )
            return (
              <g key={`series-${si}`}>
                {showArea && (
                  <polygon points={areaPoints} className={cn(areaFillClass, "opacity-10")} />
                )}
                <polyline
                  points={linePoints}
                  fill="none"
                  className={cn(strokeClass)}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )
          })}
        </svg>

        {/* Camada de tooltip (HTML sobreposto). pointer-events-none: o hover é
            capturado pelo wrapper, não pelos elementos do tooltip. */}
        {tooltipActive && activeIndex !== null && (
          <div className="pointer-events-none absolute inset-0">
            {/* Linha-guia vertical no índice ativo */}
            <div
              className="absolute w-px bg-border"
              style={{
                left: `${xPctAt(activeIndex)}%`,
                top: `${(PADDING_TOP / h) * 100}%`,
                height: `${(innerH / h) * 100}%`,
              }}
            />

            {/* Marcadores nos pontos de cada série */}
            {seriesPct.map((pts, si) => {
              const pt = pts[activeIndex]
              if (!pt) return null
              const dotClass =
                series[si].className?.replace("stroke-", "bg-") ?? "bg-primary"
              return (
                <span
                  key={`dot-${si}`}
                  className={cn(
                    "absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background",
                    dotClass,
                  )}
                  style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                />
              )
            })}

            {/* Cartão de tooltip */}
            <div
              className="absolute top-1 -translate-x-1/2"
              style={{ left: `${tooltipLeft}%` }}
            >
              <div className="min-w-28 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
                {xLabels?.[activeIndex] && (
                  <div className="mb-1 font-medium text-popover-foreground">
                    {xLabels[activeIndex]}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  {series.map((s, si) => (
                    <div key={`tt-${si}`} className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "inline-block size-2 shrink-0 rounded-full",
                          s.className?.replace("stroke-", "bg-") ?? "bg-primary",
                        )}
                      />
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="ml-auto pl-3 font-medium tabular-nums text-popover-foreground">
                        {valueFormatter(s.data[activeIndex] ?? 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legenda */}
      {showLegend && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1">
          {series.map((s, i) => (
            <div
              key={`legend-${i}`}
              className="flex items-center gap-1.5"
            >
              <span
                className={cn(
                  "inline-block h-2 w-2 rounded-full",
                  s.className?.replace("stroke-", "bg-") ?? "bg-primary",
                )}
              />
              <span className="text-muted-foreground text-xs">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { LineChart }
