/**
 * LineChartTremor — Recharts LineChart (versão Tremor Raw).
 *
 * Diferente do `line-chart.tsx` interno (SVG puro, sem deps), esta versão
 * usa a lib Recharts e entrega features que o SVG puro não tem:
 *   - Legend interativa clicável (item.onClick → toggle categoria)
 *   - Tooltip formatado com valueFormatter
 *   - Gradient stroke fill por série (`showGradient`)
 *   - Curva configurável (`curveType`: linear | monotone | step)
 *   - Animação de entrada opcional (`showAnimation`)
 *   - Conexão de nulos opcional (`connectNulls`)
 *
 * Porta simplificada do https://github.com/tremorlabs/tremor (Tremor Raw v3)
 * `src/components/LineChart/LineChart.tsx` (~907 linhas → ~280 aqui),
 * mantendo a API canônica do Tremor (data, index, categories, colors,
 * valueFormatter) e descartando features fora do escopo desta task
 * (enableLegendSlider, xAxisLabel/yAxisLabel, onValueChange, customTooltip,
 * autoMinValue/minValue/maxValue, etc.).
 *
 * Adaptações para Vitrine UI:
 *   - `"use client"` REMOVIDO (não usamos Next.js).
 *   - `@remixicon/react` → lucide-react (ChevronLeft, ChevronRight).
 *   - `tv()` (tailwind-variants) → `cva()`/strings literais (nada de template
 *     literals — Tailwind v4 não detecta classes interpoladas).
 *   - `cx` → `cn` de `@/lib/utils` (mesma semântica: clsx + twMerge).
 *   - Helpers de cor/domínio de `tremor-utils` (já portados em O0.1).
 *
 * Tokens Tremor (`stroke-gray-200/800`, `bg-white/dark:bg-gray-950`,
 * `text-gray-700/300`, `border-gray-200/800`, `fill-blue-500`, etc.) são
 * mantidos por design: o visual é o do https://www.tremor.so e o validador
 * Playwright compara pixel-a-pixel contra o site de referência.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  CartesianGrid,
  Dot,
  Line,
  Legend as RechartsLegend,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { AxisDomain } from "recharts/types/util/types"

import { cn } from "@/lib/utils"
import {
  AvailableChartColors,
  type AvailableChartColorsKeys,
  constructCategoryColors,
  getColorClassName,
  getYAxisDomain,
} from "@/lib/tremor-utils"

/* -------------------------------------------------------------------------- */
/* Public API                                                                  */
/* -------------------------------------------------------------------------- */

export type LineChartTremorCurveType = "linear" | "monotone" | "step"

export interface LineChartTremorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "data"> {
  /**
   * Dataset em formato "long-format" (uma linha por ponto do eixo X).
   * Cada row deve conter `index` + uma chave por categoria em `categories`.
   */
  data: Record<string, unknown>[]
  /** Chave da row que representa o valor do eixo X. */
  index: string
  /** Nomes das categorias (cada uma vira uma série/linha). */
  categories: string[]
  /** Cores Tremor por categoria. Default: pool completo (cíclico). */
  colors?: AvailableChartColorsKeys[]
  /** Formatador do valor exibido em tooltips/axes. */
  valueFormatter?: (value: number) => string
  /** Exibe a legenda interativa acima do chart. Default: true. */
  showLegend?: boolean
  /** Aplica gradient stroke (fill com a mesma cor em opacity decrescente). */
  showGradient?: boolean
  /** Anima a entrada das linhas (Recharts). Default: true. */
  showAnimation?: boolean
  /** Curva da linha. Default: "linear". */
  curveType?: LineChartTremorCurveType
  /** Conecta pontos com valor null em vez de quebrar a linha. */
  connectNulls?: boolean
  /** Largura fixa do eixo Y (px). Default: 56 (igual ao Tremor). */
  yAxisWidth?: number
  /** Mostra linhas de grid horizontais. Default: true. */
  showGridLines?: boolean
  /** Mostra eixo X. Default: true. */
  showXAxis?: boolean
  /** Mostra eixo Y. Default: true. */
  showYAxis?: boolean
  /** Altura do container. Default: "h-80" (mesmo do Tremor). */
  height?: string
}

/* -------------------------------------------------------------------------- */
/* Legend                                                                     */
/* -------------------------------------------------------------------------- */

interface LegendItemProps {
  name: string
  color: AvailableChartColorsKeys
  onClick?: (name: string, color: AvailableChartColorsKeys) => void
  activeLegend?: string
}

const LegendItem = ({
  name,
  color,
  onClick,
  activeLegend,
}: LegendItemProps) => {
  const hasOnValueChange = !!onClick
  const isDimmed = !!activeLegend && activeLegend !== name
  return (
    <li
      className={cn(
        "group inline-flex flex-nowrap items-center gap-1.5 whitespace-nowrap rounded-sm px-2 py-1 transition",
        hasOnValueChange
          ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
          : "cursor-default",
      )}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(name, color)
      }}
    >
      <span
        className={cn(
          "h-[3px] w-3.5 shrink-0 rounded-full",
          getColorClassName(color, "fill").replace("fill-", "bg-"),
          isDimmed ? "opacity-40" : "opacity-100",
        )}
        aria-hidden={true}
      />
      <p
        className={cn(
          "truncate whitespace-nowrap text-xs text-gray-700 dark:text-gray-300",
          hasOnValueChange &&
            "group-hover:text-gray-900 dark:group-hover:text-gray-50",
          isDimmed ? "opacity-40" : "opacity-100",
        )}
      >
        {name}
      </p>
    </li>
  )
}

interface LegendProps extends React.OlHTMLAttributes<HTMLOListElement> {
  categories: string[]
  colors?: AvailableChartColorsKeys[]
  onClickLegendItem?: (category: string, color: string) => void
  activeLegend?: string
  enableLegendSlider?: boolean
}

type HasScrollProps = { left: boolean; right: boolean }

const Legend = React.forwardRef<HTMLOListElement, LegendProps>(
  (props, ref) => {
    const {
      categories,
      colors = [...AvailableChartColors],
      className,
      onClickLegendItem,
      activeLegend,
      enableLegendSlider = false,
      ...other
    } = props
    const scrollableRef = React.useRef<HTMLOListElement>(null)
    const [hasScroll, setHasScroll] = React.useState<HasScrollProps | null>(
      null,
    )

    const checkScroll = React.useCallback(() => {
      const scrollable = scrollableRef?.current
      if (!scrollable) return
      const hasLeftScroll = scrollable.scrollLeft > 0
      const hasRightScroll =
        scrollable.scrollWidth - scrollable.clientWidth > scrollable.scrollLeft
      setHasScroll({ left: hasLeftScroll, right: hasRightScroll })
    }, [])

    React.useEffect(() => {
      if (enableLegendSlider) checkScroll()
    }, [checkScroll, enableLegendSlider])

    return (
      <ol
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        {...other}
      >
        <div
          ref={scrollableRef as unknown as React.RefObject<HTMLDivElement>}
          className={cn(
            "flex h-full",
            enableLegendSlider
              ? "snap-mandatory items-center overflow-auto pl-4 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              : "flex-wrap",
          )}
        >
          {categories.map((category, index) => (
            <LegendItem
              key={`item-${index}`}
              name={category}
              color={colors[index] as AvailableChartColorsKeys}
              onClick={onClickLegendItem}
              activeLegend={activeLegend}
            />
          ))}
        </div>
        {enableLegendSlider && (hasScroll?.right || hasScroll?.left) ? (
          <div className="absolute top-0 right-0 bottom-0 flex h-full items-center justify-center bg-background pr-1">
            <button
              type="button"
              aria-label="Scroll legend left"
              className="group inline-flex size-5 cursor-pointer items-center truncate rounded-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50"
              disabled={!hasScroll?.left}
              onClick={(e) => {
                e.stopPropagation()
                const el = scrollableRef.current
                if (el) el.scrollTo({ left: el.scrollLeft - 200, behavior: "smooth" })
              }}
            >
              <ChevronLeft className="size-full" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Scroll legend right"
              className="group inline-flex size-5 cursor-pointer items-center truncate rounded-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50"
              disabled={!hasScroll?.right}
              onClick={(e) => {
                e.stopPropagation()
                const el = scrollableRef.current
                if (el) el.scrollTo({ left: el.scrollLeft + 200, behavior: "smooth" })
              }}
            >
              <ChevronRight className="size-full" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </ol>
    )
  },
)
Legend.displayName = "Legend"

/* -------------------------------------------------------------------------- */
/* Tooltip                                                                     */
/* -------------------------------------------------------------------------- */

interface ChartTooltipPayloadItem {
  category: string
  value: number
  index: string
  color: AvailableChartColorsKeys
  type?: string
  payload: Record<string, unknown>
}

interface ChartTooltipProps {
  active: boolean | undefined
  payload: ChartTooltipPayloadItem[]
  label: string
  valueFormatter: (value: number) => string
}

const ChartTooltip = ({
  active,
  payload,
  label,
  valueFormatter,
}: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const filtered = payload.filter((item) => item.type !== "none")
    return (
      <div className="rounded-md border border-border bg-popover text-popover-foreground text-sm shadow-md">
        <div className="border-inherit border-b px-4 py-2">
          <p className="font-medium text-gray-900 dark:text-gray-50">{label}</p>
        </div>
        <div className="space-y-1 px-4 py-2">
          {filtered.map(({ value, category, color }, index) => (
            <div
              key={`id-${index}`}
              className="flex items-center justify-between space-x-8"
            >
              <div className="flex items-center space-x-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-[3px] w-3.5 shrink-0 rounded-full",
                    getColorClassName(color, "fill").replace("fill-", "bg-"),
                  )}
                />
                <p className="whitespace-nowrap text-right text-gray-700 dark:text-gray-300">
                  {category}
                </p>
              </div>
              <p className="whitespace-nowrap text-right font-medium text-gray-900 tabular-nums dark:text-gray-50">
                {valueFormatter(value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

/* -------------------------------------------------------------------------- */
/* Gradient defs (per-line)                                                   */
/* -------------------------------------------------------------------------- */

/**
 * IDs estáveis para os <defs><linearGradient> por categoria. Usamos hash
 * determinístico (djb2) sobre o nome da categoria para garantir que cada
 * linha tenha um ID único E estável entre renders (Recharts usa o ID
 * referenciado em `stroke="url(#<id>)"`).
 */
const gradientId = (slug: string, idx: number) =>
  `lc-tremor-grad-${idx}-${djb2(slug)}`

function djb2(str: string): string {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i)
  }
  // unsigned 32-bit, em hex
  return (h >>> 0).toString(16)
}

const GradientDefs = ({
  categories,
  categoryColors,
}: {
  categories: string[]
  categoryColors: Map<string, AvailableChartColorsKeys>
}) => (
  <defs>
    {categories.map((category, i) => (
      <linearGradient
        key={`grad-${i}-${category}`}
        id={gradientId(category, i)}
        // text-<cor>-500 (literal) faz o `currentColor` dos stops resolver na
        // cor da série; sem isso a linha herdava a cor de texto padrão.
        className={getColorClassName(
          categoryColors.get(category) ?? "gray",
          "text",
        )}
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop offset="0%" stopColor="currentColor" stopOpacity={0.35} />
        <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
      </linearGradient>
    ))}
  </defs>
)

/* -------------------------------------------------------------------------- */
/* Componente                                                                  */
/* -------------------------------------------------------------------------- */

const LineChartTremor = React.forwardRef<HTMLDivElement, LineChartTremorProps>(
  (props, ref) => {
    const {
      data = [],
      categories = [],
      index,
      colors = [...AvailableChartColors],
      valueFormatter = (value: number) => value.toString(),
      showLegend = true,
      showGradient = false,
      showAnimation = true,
      curveType = "linear",
      connectNulls = false,
      showGridLines = true,
      showXAxis = true,
      showYAxis = true,
      yAxisWidth = 56,
      height = "h-80",
      className,
      ...other
    } = props

    const categoryColors = constructCategoryColors(categories, colors)

    // Domínio do eixo Y: usa helper Tremor portado em O0.1
    const allValues = data.flatMap((row) =>
      categories.map((c) => Number(row[c])).filter((v) => !Number.isNaN(v)),
    )
    const yAxisDomain = getYAxisDomain(allValues) as AxisDomain

    // Estado: legenda ativa (item clicado → dim outras categorias)
    const [activeLegend, setActiveLegend] = React.useState<string | undefined>(
      undefined,
    )

    const handleClickLegendItem = React.useCallback(
      (category: string) => {
        setActiveLegend((prev) => (prev === category ? undefined : category))
      },
      [],
    )

    const strokeOpacity = (category: string) =>
      activeLegend && activeLegend !== category ? 0.3 : 1

    return (
      <div
        ref={ref}
        className={cn("w-full", height, className)}
        data-slot="line-chart-tremor"
        tremor-id="tremor-raw"
        {...other}
      >
        <ResponsiveContainer>
          <RechartsLineChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            {/* defs inline (chamada de função, NÃO <GradientDefs/>): o Recharts
                descarta componentes custom como filhos — só renderiza elementos
                DOM/reconhecidos. Sem isso a <defs> não entra no SVG e a linha
                referencia um gradiente inexistente (fica invisível). */}
            {showGradient
              ? GradientDefs({ categories, categoryColors })
              : null}
            {showGridLines ? (
              <CartesianGrid
                className="stroke-1 stroke-gray-200 dark:stroke-gray-800"
                horizontal={true}
                vertical={false}
              />
            ) : null}
            <XAxis
              hide={!showXAxis}
              dataKey={index}
              tick={{ transform: "translate(0, 6)" }}
              fill=""
              stroke=""
              className="fill-gray-500 text-xs dark:fill-gray-500"
              tickLine={false}
              axisLine={false}
              minTickGap={5}
            />
            <YAxis
              width={yAxisWidth}
              hide={!showYAxis}
              axisLine={false}
              tickLine={false}
              type="number"
              domain={yAxisDomain}
              tick={{ transform: "translate(-3, 0)" }}
              fill=""
              stroke=""
              className="fill-gray-500 text-xs dark:fill-gray-500"
              tickFormatter={valueFormatter}
              allowDecimals={true}
            />
            <Tooltip
              wrapperStyle={{ outline: "none" }}
              isAnimationActive={showAnimation}
              animationDuration={100}
              cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
              offset={20}
              position={{ y: 0 }}
              content={({ active, payload, label }: any) => {
                const cleanPayload: ChartTooltipPayloadItem[] = payload
                  ? payload.map((item: any) => ({
                      category: String(item.dataKey),
                      value: Number(item.value),
                      index: String(item.payload?.[index] ?? ""),
                      color:
                        (categoryColors.get(String(item.dataKey)) ??
                          "gray") as AvailableChartColorsKeys,
                      type: item.type,
                      payload: item.payload as Record<string, unknown>,
                    }))
                  : []
                return showLegend && active ? (
                  <ChartTooltip
                    active={active}
                    payload={cleanPayload}
                    label={String(label)}
                    valueFormatter={valueFormatter}
                  />
                ) : null
              }}
            />
            {showLegend ? (
              <RechartsLegend
                verticalAlign="top"
                height={60}
                content={({ payload }: any) => {
                  const filtered = (payload ?? []).filter(
                    (item: any) => item.type !== "none",
                  )
                  return (
                    <div className="flex items-center justify-end">
                      <Legend
                        categories={filtered.map((entry: any) =>
                          String(entry.value),
                        )}
                        colors={filtered.map(
                          (entry: any) =>
                            (categoryColors.get(String(entry.value)) ??
                              "gray") as AvailableChartColorsKeys,
                        )}
                        onClickLegendItem={handleClickLegendItem}
                        activeLegend={activeLegend}
                      />
                    </div>
                  )
                }}
              />
            ) : null}
            {categories.map((category, i) => {
              const colorKey = categoryColors.get(category) ?? "gray"
              const gradId = showGradient ? gradientId(category, i) : null
              return (
                <Line
                  key={category}
                  className={getColorClassName(colorKey, "stroke")}
                  strokeOpacity={strokeOpacity(category)}
                  dot={(dotProps: any) => {
                    const stroke = dotProps.stroke as string
                    const strokeLinecap = dotProps.strokeLinecap as
                      | "round"
                      | "butt"
                      | "square"
                      | "inherit"
                    const strokeLinejoin = dotProps.strokeLinejoin as
                      | "round"
                      | "bevel"
                      | "miter"
                      | "inherit"
                    const cxCoord = dotProps.cx as number
                    const cyCoord = dotProps.cy as number
                    const dataKey = dotProps.dataKey as string
                    const dotIndex = dotProps.index as number
                    // Só desenha dot no ponto ativo (igual ao Tremor) ou
                    // quando a categoria tem 1 único valor.
                    const isOnlyValue =
                      data.filter((row) => row[category] != null).length === 1
                    const isActive =
                      activeLegend === dataKey ||
                      (isOnlyValue && !activeLegend)
                    if (!isActive) {
                      return <React.Fragment key={dotIndex} />
                    }
                    return (
                      <Dot
                        key={dotIndex}
                        cx={cxCoord}
                        cy={cyCoord}
                        r={5}
                        stroke={stroke}
                        fill=""
                        strokeLinecap={strokeLinecap}
                        strokeLinejoin={strokeLinejoin}
                        strokeWidth={dotProps.strokeWidth}
                        className={cn(
                          "stroke-white dark:stroke-gray-950",
                          getColorClassName(colorKey, "fill"),
                        )}
                      />
                    )
                  }}
                  activeDot={(activeDotProps: any) => {
                    const cxCoord = activeDotProps.cx as number
                    const cyCoord = activeDotProps.cy as number
                    const stroke = activeDotProps.stroke as string
                    const strokeLinecap = activeDotProps.strokeLinecap as
                      | "round"
                      | "butt"
                      | "square"
                      | "inherit"
                    const strokeLinejoin = activeDotProps.strokeLinejoin as
                      | "round"
                      | "bevel"
                      | "miter"
                      | "inherit"
                    return (
                      <Dot
                        cx={cxCoord}
                        cy={cyCoord}
                        r={5}
                        fill=""
                        stroke={stroke}
                        strokeLinecap={strokeLinecap}
                        strokeLinejoin={strokeLinejoin}
                        strokeWidth={activeDotProps.strokeWidth}
                        className={cn(
                          "stroke-white dark:stroke-gray-950",
                          getColorClassName(colorKey, "fill"),
                        )}
                      />
                    )
                  }}
                  name={category}
                  type={curveType}
                  dataKey={category}
                  stroke={gradId ? `url(#${gradId})` : ""}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  isAnimationActive={showAnimation}
                  connectNulls={connectNulls}
                />
              )
            })}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    )
  },
)
LineChartTremor.displayName = "LineChartTremor"

export { LineChartTremor }
