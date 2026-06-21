/**
 * DonutChart — donut/anel genérico em SVG, montado a partir de arcos.
 *
 * Desenha uma trilha de fundo (`stroke-muted`) e, por cima, um arco por
 * segmento cujo comprimento é proporcional ao seu `value` sobre o total. A
 * cor de cada arco vem da classe Tailwind em `segment.className` (ex.:
 * "stroke-primary"). As dimensões (`size`/`thickness`) controlam o diâmetro
 * e a espessura do anel; o vão central fica livre para um rótulo absoluto.
 *
 * No hover sobre um arco, mostra um tooltip (rótulo + valor + participação)
 * seguindo o cursor (`showTooltip`, default true). Quando o tooltip está
 * desativado, o componente retorna exatamente o `<svg>` de antes (sem wrapper),
 * preservando usos decorativos.
 *
 * Extraído da composição `saas-dashboard-pro`. Sem dependências novas. O
 * elemento raiz é o <svg> com `data-slot="donut-chart"` (mantido mesmo quando
 * envolto pela camada de tooltip), aceitando className/props padrão de um SVG.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/** Um segmento do donut: rótulo, valor e classe Tailwind de cor do arco. */
export interface DonutSegment {
  label: string
  value: number
  /** Classe Tailwind da cor do arco (ex.: "stroke-primary", "stroke-emerald-500"). */
  className: string
}

export interface DonutChartProps
  extends Omit<React.SVGProps<SVGSVGElement>, "children"> {
  /** Segmentos do anel. O comprimento de cada arco é proporcional ao total. */
  segments: DonutSegment[]
  /** Diâmetro do SVG em px. Default: 168. */
  size?: number
  /** Espessura do anel em px. Default: 24. */
  thickness?: number
  /** Se true, mostra tooltip (rótulo + valor + %) no hover. Default: true. */
  showTooltip?: boolean
  /** Formata o valor exibido no tooltip. Default: `String(v)`. */
  valueFormatter?: (value: number) => string
}

function DonutChart({
  segments,
  size = 168,
  thickness = 24,
  showTooltip = true,
  valueFormatter = (v) => String(v),
  className,
  style,
  ...props
}: DonutChartProps) {
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius

  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const [pos, setPos] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 })

  let cursor = 0
  const svg = (
    <svg
      data-slot="donut-chart"
      viewBox={`0 0 ${size} ${size}`}
      className={cn(className)}
      style={{ width: size, height: size, ...style }}
      role="img"
      aria-label="Distribuição"
      {...props}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className="stroke-muted"
        strokeWidth={thickness}
      />
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {segments.map((seg, i) => {
          const frac = seg.value / total
          const dash = frac * circumference
          const dimmed = activeIndex !== null && activeIndex !== i
          const node = (
            <circle
              key={seg.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              className={cn(
                seg.className,
                "transition-opacity",
                dimmed && "opacity-30",
              )}
              strokeWidth={thickness}
              strokeDasharray={`${dash.toFixed(2)} ${(circumference - dash).toFixed(2)}`}
              strokeDashoffset={(-cursor).toFixed(2)}
              strokeLinecap="butt"
              onMouseEnter={
                showTooltip ? () => setActiveIndex(i) : undefined
              }
            />
          )
          cursor += dash
          return node
        })}
      </g>
    </svg>
  )

  if (!showTooltip) return svg

  const active = activeIndex !== null ? segments[activeIndex] : null

  return (
    <span
      className="relative inline-flex"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }}
      onMouseLeave={() => setActiveIndex(null)}
    >
      {svg}
      {active && (
        <span
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+10px)]"
          style={{ left: pos.x, top: pos.y }}
        >
          <span className="block whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-md">
            <span className="inline-flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-block size-2 shrink-0 rounded-full",
                  active.className.replace("stroke-", "bg-"),
                )}
              />
              <span className="text-muted-foreground">{active.label}</span>
              <span className="font-medium tabular-nums text-popover-foreground">
                {valueFormatter(active.value)}
              </span>
              <span className="text-muted-foreground tabular-nums">
                ({Math.round((active.value / total) * 100)}%)
              </span>
            </span>
          </span>
        </span>
      )}
    </span>
  )
}

export { DonutChart }
