/**
 * Sparkline — mini-gráfico de linha em SVG (polyline + área preenchida).
 *
 * Desenha uma série de valores como uma linha suave com uma área translúcida
 * por baixo. A escala vertical é normalizada ao mínimo/máximo locais da série,
 * então qualquer faixa de valores se acomoda na altura disponível. Cores da
 * linha (`stroke`) e da área (`fill`) são classes Tailwind; o tamanho real é
 * controlado por className (default ocupa a largura total, altura `h-14`).
 *
 * Extraído da composição `saas-dashboard-pro`, com API genérica para reuso em
 * dashboards/observability. Sem dependências novas, sem estado. O elemento
 * raiz é o próprio <svg> com `data-slot="sparkline"`, aceitando className/props
 * padrão de um SVG. `width`/`height` controlam apenas o sistema de coordenadas
 * do viewBox (não o tamanho renderizado, que vem do className).
 */

import * as React from "react"

import { cn } from "@/lib/utils"

export interface SparklineProps
  extends Omit<React.SVGProps<SVGSVGElement>, "children" | "width" | "height"> {
  /** Série de valores. A escala vertical é normalizada ao min/max local. */
  data: number[]
  /** Classe Tailwind da cor da linha. Default: "stroke-primary". */
  stroke?: string
  /** Classe Tailwind do preenchimento da área. Default: "fill-primary/10". */
  fill?: string
  /** Espessura da linha. Default: 2. */
  strokeWidth?: number
  /** Largura do viewBox (sistema de coordenadas). Default: 240. */
  width?: number
  /** Altura do viewBox (sistema de coordenadas). Default: 56. */
  height?: number
  /**
   * Habilita tooltip interativo (marcador + valor no hover). Default: `false`
   * — mantém o uso decorativo em cards inalterado. Quando `true`, o root vira
   * um `<span>` posicionado contendo o `<svg>` + overlay HTML.
   */
  showTooltip?: boolean
  /** Formata o valor exibido no tooltip. Default: `String(value)`. */
  valueFormatter?: (value: number) => string
}

function Sparkline({
  data,
  stroke = "stroke-primary",
  fill = "fill-primary/10",
  strokeWidth = 2,
  width = 240,
  height = 56,
  showTooltip = false,
  valueFormatter = (value: number) => String(value),
  className,
  ...props
}: SparklineProps) {
  const w = width
  const h = height
  const max = Math.max(...data)
  const min = Math.min(...data)
  const span = Math.max(max - min, 1)
  const step = data.length > 1 ? w / (data.length - 1) : w
  const pts = data.map((p, i) => {
    const x = i * step
    const y = h - ((p - min) / span) * (h - 8) - 4
    return { x, y }
  })
  const linePoints = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  const areaPoints = `0,${h} ${linePoints} ${w},${h}`

  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null)

  const svg = (
    <svg
      data-slot={showTooltip ? undefined : "sparkline"}
      viewBox={`0 0 ${w} ${h}`}
      className={showTooltip ? "block h-full w-full" : cn("h-14 w-full", className)}
      preserveAspectRatio="none"
      role="img"
      aria-label="Tendência"
      {...props}
    >
      <polygon points={areaPoints} className={cn(fill)} />
      <polyline
        points={linePoints}
        fill="none"
        className={cn(stroke)}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  if (!showTooltip) return svg

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const rel = (e.clientX - rect.left) / Math.max(rect.width, 1)
    const idx = Math.round(rel * (data.length - 1))
    setHoverIdx(Math.min(Math.max(idx, 0), data.length - 1))
  }

  const active = hoverIdx != null ? pts[hoverIdx] : null
  const xPct = active ? (active.x / w) * 100 : 0
  const yPct = active ? (active.y / h) * 100 : 0
  // stroke-<x> → bg-<x> (classes literais; consumidores passam cores literais).
  const dotBg = stroke.replace("stroke-", "bg-")

  return (
    <span
      data-slot="sparkline"
      className={cn("relative block h-14 w-full", className)}
      onMouseMove={onMove}
      onMouseLeave={() => setHoverIdx(null)}
    >
      {svg}
      {active && hoverIdx != null ? (
        <>
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute z-10 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background",
              dotBg,
            )}
            style={{ left: `${xPct}%`, top: `${yPct}%` }}
          />
          <span
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium tabular-nums text-popover-foreground shadow-md"
            style={{ left: `${xPct}%`, top: `${yPct}%` }}
          >
            {valueFormatter(data[hoverIdx])}
          </span>
        </>
      ) : null}
    </span>
  )
}

export { Sparkline }
