/**
 * DonutChartTremor — donut/anel de pizza baseado em Recharts.
 *
 * Portado do Tremor Raw (https://github.com/tremorlabs/tremor/blob/main/src/components/DonutChart/DonutChart.tsx).
 *
 * DIFERENÇAS em relação ao nosso `donut-chart` (SVG puro):
 *  - Recharts Pie + Sector + Tooltip (em vez de `<circle>` + `strokeDasharray`).
 *  - Cores por categoria via `colors?: AvailableChartColorsKeys[]` (Tremor) em
 *    vez de classe Tailwind por segmento.
 *  - Sector ativo via click (`activeIndex` + `inactiveShape`) com fade dos outros.
 *  - Label central opcional (default = soma dos `value`, ou `label` custom).
 *  - Variant `"pie"` remove o buraco central.
 *
 * Helpers Tremor (cx, AvailableChartColors, constructCategoryColors,
 * getColorClassName) estão em `@/lib/tremor-utils` — portados na onda 0.
 *
 * Mantém `tremor-id="tremor-raw"` no JSX raiz para distinguir Tremor vs nossos
 * charts durante validação Playwright.
 */

import * as React from "react"
import {
  Pie,
  PieChart as ReChartsDonutChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from "recharts"

import {
  AvailableChartColors,
  type AvailableChartColorsKeys,
  constructCategoryColors,
  cx,
  getColorClassName,
} from "@/lib/tremor-utils"

// ────────────────────────────────────────────────────────────────────────────
// Tipos
// ────────────────────────────────────────────────────────────────────────────

export type DonutChartTremorVariant = "donut" | "pie"

export interface DonutChartTremorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Linhas da série: cada item deve ter ao menos `category` e `value`. */
  data: Record<string, unknown>[]
  /** Chave da categoria (rótulo do segmento). */
  category: string
  /** Chave numérica (valor/peso do segmento). */
  value: string
  /** Pool de cores Tremor usadas ciclicamente para colorir as categorias. */
  colors?: AvailableChartColorsKeys[]
  /** "donut" (com buraco) ou "pie" (cheia). Default: "donut". */
  variant?: DonutChartTremorVariant
  /** Formatador do valor numérico (usado no label central e no Tooltip). */
  valueFormatter?: (value: number) => string
  /** Label central customizado. Default: soma de `value` formatada. */
  label?: string
  /** Exibe o label central (só para `variant="donut"`). */
  showLabel?: boolean
  /** Exibe o Tooltip ao passar o mouse sobre um setor. */
  showTooltip?: boolean
  /** Habilita a animação de entrada do Recharts. */
  showAnimation?: boolean
  /** Altura/largura do container. Default: `h-40 w-40`. */
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers internos
// ────────────────────────────────────────────────────────────────────────────

const sumNumericArray = (arr: number[]): number =>
  arr.reduce((sum, num) => sum + num, 0)

const calculateDefaultLabel = (data: Record<string, unknown>[], valueKey: string): number =>
  sumNumericArray(
    data.map((dataPoint) => Number(dataPoint[valueKey]) || 0),
  )

const parseLabelInput = (
  labelInput: string | undefined,
  valueFormatter: (value: number) => string,
  data: Record<string, unknown>[],
  valueKey: string,
): string =>
  labelInput ?? valueFormatter(calculateDefaultLabel(data, valueKey))

type ParsedDataPoint = Record<string, unknown> & {
  color: AvailableChartColorsKeys
  className: string
}

const parseData = (
  data: Record<string, unknown>[],
  categoryColors: Map<string, AvailableChartColorsKeys>,
  category: string,
): ParsedDataPoint[] =>
  data.map((dataPoint) => {
    const color = categoryColors.get(String(dataPoint[category])) ?? AvailableChartColors[0]
    return {
      ...dataPoint,
      color,
      className: getColorClassName(color, "fill"),
    }
  })

// Tooltip payload exposto pelo nosso renderer (independente do tipo do Recharts)
type TooltipItem = {
  category: string
  value: number
  color: AvailableChartColorsKeys
}

interface RenderTooltipProps {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: Record<string, unknown>; value?: number | string }>
}

// ────────────────────────────────────────────────────────────────────────────
// Tooltip interno (estilo Tremor)
// ────────────────────────────────────────────────────────────────────────────

const ChartTooltip = ({
  active,
  payload,
  valueFormatter,
}: {
  active: boolean | undefined
  payload: TooltipItem[]
  valueFormatter: (value: number) => string
}) => {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div
      className={cx(
        "rounded-md border text-sm shadow-md",
        "border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-gray-950",
      )}
    >
      <div className="space-y-1 px-4 py-2">
        {payload.map(({ value, category, color }, index) => (
          <div
            key={`item-${index}`}
            className="flex items-center justify-between space-x-8"
          >
            <div className="flex items-center space-x-2">
              <span
                aria-hidden="true"
                className={cx(
                  "size-2 shrink-0 rounded-full",
                  getColorClassName(color, "fill"),
                )}
              />
              <p className="whitespace-nowrap text-right text-gray-700 dark:text-gray-300">
                {category}
              </p>
            </div>
            <p className="whitespace-nowrap text-right font-medium tabular-nums text-gray-900 dark:text-gray-50">
              {valueFormatter(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Renderiza setores inativos (com fade) quando há um setor ativo
// ────────────────────────────────────────────────────────────────────────────

type InactiveShapeProps = {
  cx?: number
  cy?: number
  innerRadius?: number
  outerRadius?: number
  startAngle?: number
  endAngle?: number
  className?: string
}

const renderInactiveShape = (props: InactiveShapeProps) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, className } = props
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      className={className}
      fill=""
      opacity={0.3}
      style={{ outline: "none" }}
    />
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Componente
// ────────────────────────────────────────────────────────────────────────────

const DonutChartTremor = React.forwardRef<HTMLDivElement, DonutChartTremorProps>(
  (
    {
      data = [],
      value,
      category,
      colors = [...AvailableChartColors],
      variant = "donut",
      valueFormatter = (v: number) => v.toString(),
      label,
      showLabel = false,
      showTooltip = true,
      showAnimation = false,
      className,
      ...other
    },
    forwardedRef,
  ) => {
    const isDonut = variant === "donut"
    const parsedLabelInput = parseLabelInput(label, valueFormatter, data, value)

    const categories = Array.from(
      new Set(data.map((item) => String(item[category]))),
    )
    const categoryColors = constructCategoryColors(categories, colors)

    const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined)

    const handleShapeClick = (
      _dataPoint: { payload?: Record<string, unknown> },
      index: number,
      event: React.MouseEvent,
    ) => {
      event.stopPropagation()
      if (activeIndex === index) {
        setActiveIndex(undefined)
      } else {
        setActiveIndex(index)
      }
    }

    return (
      <div
        ref={forwardedRef}
        className={cx("h-40 w-40", className)}
        data-slot="donut-chart-tremor"
        tremor-id="tremor-raw"
        {...other}
      >
        <ResponsiveContainer className="size-full">
          <ReChartsDonutChart
            onClick={
              activeIndex !== undefined
                ? () => setActiveIndex(undefined)
                : undefined
            }
            margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
          >
            {showLabel && isDonut && (
              <text
                className="fill-gray-700 dark:fill-gray-300"
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {parsedLabelInput}
              </text>
            )}
            <Pie
              className={cx(
                "stroke-white dark:stroke-gray-950 [&_.recharts-pie-sector]:outline-hidden",
                "cursor-pointer",
              )}
              data={parseData(data, categoryColors, category)}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius={isDonut ? "75%" : "0%"}
              outerRadius="100%"
              stroke=""
              strokeLinejoin="round"
              dataKey={value}
              nameKey={category}
              isAnimationActive={showAnimation}
              onClick={handleShapeClick}
              activeIndex={activeIndex}
              inactiveShape={renderInactiveShape}
              style={{ outline: "none" }}
            />
            {showTooltip && (
              <Tooltip
                wrapperStyle={{ outline: "none" }}
                isAnimationActive={false}
                content={({ active, payload }: RenderTooltipProps) => {
                  if (!active) return null
                  const cleanPayload: TooltipItem[] = payload
                    ? payload.map((item) => {
                        const raw = item.payload ?? {}
                        const cat = String(raw[category] ?? "")
                        return {
                          category: cat,
                          value: Number(item.value ?? 0),
                          color: categoryColors.get(cat) ?? AvailableChartColors[0],
                        }
                      })
                    : []
                  return (
                    <ChartTooltip
                      active={active}
                      payload={cleanPayload}
                      valueFormatter={valueFormatter}
                    />
                  )
                }}
              />
            )}
          </ReChartsDonutChart>
        </ResponsiveContainer>
      </div>
    )
  },
)

DonutChartTremor.displayName = "DonutChartTremor"

export { DonutChartTremor }