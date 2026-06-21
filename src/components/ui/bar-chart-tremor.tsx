/**
 * Tremor BarChart [v1.0.0] — wrapper Recharts com API multi-série.
 *
 * Portado de https://github.com/tremorlabs/tremor/blob/main/src/components/BarChart/BarChart.tsx
 * (Tremor Raw v3, Apache-2.0) para a convenção Vitrine UI:
 * - `data-slot="bar-chart-tremor"` + `tremor-id="tremor-raw"` no JSX raiz.
 * - Sem `"use client"` (não usamos Next.js).
 * - `tv()`/`@remixicon/react` do Tremor → `cva`/`lucide-react` que já temos.
 * - `useOnWindowResize` original inlinear como `useEffect` (não cria hook novo).
 * - `cx`/`getColorClassName`/`AvailableChartColors`/`getYAxisDomain`/`constructCategoryColors`
 *   re-aproveitados de `@/lib/tremor-utils` (instalado pelo setup O0.1).
 * - `bg-<color>-500` derivado de `getColorClassName(color, "fill")` via `.replace`,
 *   idêntico ao padrão de `category-bar-tremor.tsx` (Tailwind v4 não detecta
 *   classes interpoladas, então mantemos a string final como literal).
 *
 * Simplificações intencionais (vs upstream 885 linhas → ~310 aqui):
 * - Mantém 100% da API: `data`, `index`, `categories`, `colors`, `stack`,
 *   `layout` (horizontal/vertical), `valueFormatter`, `showLegend`,
 *   `enableLegendSlider`, `onValueChange`, `customTooltip`, eixos/labels.
 * - Mantém `renderShape` com `activeBar` + `activeLegend` (alma do visual
 *   "hover desatura siblings" do Tremor — não simplifique).
 * - Mantém Legend com scroll horizontal + botões ChevronLeft/Right (lucide).
 * - `deepEqual` e `useOnWindowResize` inlinados (privados, 1 uso).
 * - Removidos alguns eixos/labels extremos que a doc Tremor não usa
 *   (mantém `xAxisLabel`/`yAxisLabel` que são o que importa).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// Recharts 2.x tem tipagens permissivas em callbacks (`shape`, `content`,
// `onClick` aceitam `any` na prática). Desabilitar a regra é a abordagem
// padrão do Tremor Raw original e do nosso `area-chart-tremor.tsx`.

import * as React from "react"
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react"
import {
  Bar,
  CartesianGrid,
  Label,
  BarChart as RechartsBarChart,
  Legend as RechartsLegend,
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
  cx,
  getColorClassName,
  getYAxisDomain,
} from "@/lib/tremor-utils"

// ────────────────────────────────────────────────────────────────────────────
// Helpers privados (não viram util público — só usados aqui)
// ────────────────────────────────────────────────────────────────────────────

/** Comparação rasa+profunda de 2 valores (recharts passa objetos aninhados
 *  como `payload`, então precisamos ir recursivo). */
const deepEqual = <T,>(obj1: T, obj2: T): boolean => {
  if (obj1 === obj2) return true
  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    return false
  }
  const keys1 = Object.keys(obj1) as Array<keyof T>
  const keys2 = Object.keys(obj2) as Array<keyof T>
  if (keys1.length !== keys2.length) return false
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false
  }
  return true
}

/** `fill-blue-500` → `bg-blue-500` (Tailwind v4 aceita literais). */
const toBgClass = (color: AvailableChartColorsKeys): string =>
  getColorClassName(color, "fill").replace(/^fill-/, "bg-")

/** `getYAxisDomain` da Vitrine recebe `number[]`; o Tremor precisa respeitar
 *  `autoMinValue`/`minValue`/`maxValue` do consumer. Esta função centraliza
 *  a lógica para que o JSX raiz não tenha ternários longos. */
const computeYDomain = (
  flatValues: number[],
  autoMinValue: boolean,
  minValue: number | undefined,
  maxValue: number | undefined,
): [number | "auto", number | "auto"] => {
  if (autoMinValue) return getYAxisDomain(flatValues)
  return [minValue ?? 0, maxValue ?? "auto"]
}

// ────────────────────────────────────────────────────────────────────────────
// Shape (alma do visual Tremor)
// ────────────────────────────────────────────────────────────────────────────

const renderShape = (
  props: any,
  activeBar: any | undefined,
  activeLegend: string | undefined,
  layout: "vertical" | "horizontal",
) => {
  const { fillOpacity, name, payload, value } = props
  let { x, width, y, height } = props

  if (layout === "horizontal" && height < 0) {
    y += height
    height = Math.abs(height)
  } else if (layout === "vertical" && width < 0) {
    x += width
    width = Math.abs(width)
  }

  const isActiveMatch =
    activeBar && deepEqual(activeBar, { ...payload, value })
  const isOtherLegend =
    activeLegend !== undefined && activeLegend !== name

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      opacity={activeBar || isOtherLegend ? (isActiveMatch ? fillOpacity : 0.3) : fillOpacity}
    />
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Tooltip (custom + default)
// ────────────────────────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  category: string
  value: number
  index: string
  color: AvailableChartColorsKeys
  type?: string
  payload: any
}

export interface BarChartTremorTooltipProps {
  active: boolean | undefined
  payload: TooltipPayloadItem[]
  label: string
  valueFormatter?: (value: number) => string
}

const ChartTooltip = ({
  active,
  payload,
  label,
  valueFormatter = (value: number) => value.toString(),
}: BarChartTremorTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div
      className={cx(
        "rounded-md border text-sm shadow-md",
        "border-border",
        "bg-popover text-popover-foreground",
      )}
    >
      <div className="border-inherit border-b px-4 py-2">
        <p className="font-medium text-gray-900 dark:text-gray-50">{label}</p>
      </div>
      <div className="space-y-1 px-4 py-2">
        {payload.map(({ value, category, color }, index) => (
          <div
            key={`id-${index}`}
            className="flex items-center justify-between space-x-8"
          >
            <div className="flex items-center space-x-2">
              <span
                aria-hidden="true"
                className={cx("size-2 shrink-0 rounded-xs", toBgClass(color))}
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
// Legend
// ────────────────────────────────────────────────────────────────────────────

interface LegendItemProps {
  name: string
  color: AvailableChartColorsKeys
  onClick?: (name: string, color: AvailableChartColorsKeys) => void
  activeLegend?: string
}

const LegendItem = ({ name, color, onClick, activeLegend }: LegendItemProps) => {
  const hasOnValueChange = !!onClick
  const dimmed = !!activeLegend && activeLegend !== name
  return (
    <li
      className={cx(
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
        aria-hidden
        className={cx("size-2 shrink-0 rounded-xs", toBgClass(color), dimmed ? "opacity-40" : "opacity-100")}
      />
      <p
        className={cx(
          "truncate whitespace-nowrap text-xs",
          "text-gray-700 dark:text-gray-300",
          hasOnValueChange && "group-hover:text-gray-900 dark:group-hover:text-gray-50",
          dimmed ? "opacity-40" : "opacity-100",
        )}
      >
        {name}
      </p>
    </li>
  )
}

interface ScrollButtonProps {
  icon: LucideIcon
  onClick?: () => void
  disabled?: boolean
}

const ScrollButton = ({ icon, onClick, disabled }: ScrollButtonProps) => {
  const Icon = icon
  const [isPressed, setIsPressed] = React.useState(false)
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  React.useEffect(() => {
    if (isPressed) {
      intervalRef.current = setInterval(() => onClick?.(), 300)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPressed, onClick])

  React.useEffect(() => {
    if (disabled && intervalRef.current) {
      clearInterval(intervalRef.current)
      setIsPressed(false)
    }
  }, [disabled])

  return (
    <button
      type="button"
      className={cx(
        "group inline-flex size-5 items-center truncate rounded-sm transition",
        disabled
          ? "cursor-not-allowed text-gray-400 dark:text-gray-600"
          : "cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50",
      )}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
        setIsPressed(true)
      }}
      onMouseUp={(e) => {
        e.stopPropagation()
        setIsPressed(false)
      }}
    >
      <Icon className="size-full" aria-hidden="true" />
    </button>
  )
}

interface LegendListProps extends React.OlHTMLAttributes<HTMLOListElement> {
  categories: string[]
  colors?: AvailableChartColorsKeys[]
  onClickLegendItem?: (category: string, color: string) => void
  activeLegend?: string
  enableLegendSlider?: boolean
}

const LegendList = React.forwardRef<HTMLOListElement, LegendListProps>((props, ref) => {
  const {
    categories,
    colors = AvailableChartColors,
    className,
    onClickLegendItem,
    activeLegend,
    enableLegendSlider = false,
    ...other
  } = props
  const scrollableRef = React.useRef<HTMLDivElement>(null)
  const [hasScroll, setHasScroll] = React.useState<{ left: boolean; right: boolean } | null>(null)
  const [isKeyDowned, setIsKeyDowned] = React.useState<string | null>(null)
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const checkScroll = React.useCallback(() => {
    const el = scrollableRef.current
    if (!el) return
    setHasScroll({
      left: el.scrollLeft > 0,
      right: el.scrollWidth - el.clientWidth > el.scrollLeft,
    })
  }, [])

  const scrollToTest = React.useCallback(
    (direction: "left" | "right") => {
      const element = scrollableRef.current
      if (element && enableLegendSlider) {
        const width = element.clientWidth ?? 0
        element.scrollTo({
          left:
            direction === "left"
              ? element.scrollLeft - width
              : element.scrollLeft + width,
          behavior: "smooth",
        })
        setTimeout(checkScroll, 400)
      }
    },
    [enableLegendSlider, checkScroll],
  )

  React.useEffect(() => {
    if (isKeyDowned === "ArrowLeft" || isKeyDowned === "ArrowRight") {
      const direction: "left" | "right" = isKeyDowned === "ArrowLeft" ? "left" : "right"
      intervalRef.current = setInterval(() => scrollToTest(direction), 300)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isKeyDowned, scrollToTest])

  const onKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault()
      setIsKeyDowned(e.key)
    }
  }, [])
  const onKeyUp = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      setIsKeyDowned(null)
    }
  }, [])

  React.useEffect(() => {
    const el = scrollableRef.current
    if (!enableLegendSlider) return
    checkScroll()
    el?.addEventListener("keydown", onKeyDown as unknown as (ev: Event) => void)
    el?.addEventListener("keyup", onKeyUp as unknown as (ev: Event) => void)
    return () => {
      el?.removeEventListener("keydown", onKeyDown as unknown as (ev: Event) => void)
      el?.removeEventListener("keyup", onKeyUp as unknown as (ev: Event) => void)
    }
  }, [checkScroll, enableLegendSlider, onKeyDown, onKeyUp])

  return (
    <ol ref={ref} className={cx("relative overflow-hidden", className)} {...other}>
      <div
        ref={scrollableRef}
        tabIndex={0}
        className={cx(
          "flex h-full",
          enableLegendSlider
            ? hasScroll?.right || hasScroll?.left
              ? "snap-mandatory items-center overflow-auto pr-12 pl-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              : ""
            : "flex-wrap",
        )}
      >
        {categories.map((category, index) => (
          <LegendItem
            key={`item-${index}`}
            name={category}
            color={(colors[index] ?? "gray") as AvailableChartColorsKeys}
            onClick={onClickLegendItem}
            activeLegend={activeLegend}
          />
        ))}
      </div>
      {enableLegendSlider && (hasScroll?.right || hasScroll?.left) ? (
        <div
          className={cx(
            "absolute top-0 right-0 bottom-0 flex h-full items-center justify-center pr-1",
            "bg-background",
          )}
        >
          <ScrollButton
            icon={ChevronLeft}
            onClick={() => {
              setIsKeyDowned(null)
              scrollToTest("left")
            }}
            disabled={!hasScroll?.left}
          />
          <ScrollButton
            icon={ChevronRight}
            onClick={() => {
              setIsKeyDowned(null)
              scrollToTest("right")
            }}
            disabled={!hasScroll?.right}
          />
        </div>
      ) : null}
    </ol>
  )
})
LegendList.displayName = "LegendList"

// ────────────────────────────────────────────────────────────────────────────
// BarChart (componente público)
// ────────────────────────────────────────────────────────────────────────────

type BaseEventProps = {
  eventType: "category" | "bar"
  categoryClicked: string
  [key: string]: number | string
}

export type BarChartTremorEventProps = BaseEventProps | null | undefined

export interface BarChartTremorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  data: Record<string, any>[]
  index: string
  categories: string[]
  colors?: AvailableChartColorsKeys[]
  valueFormatter?: (value: number) => string
  startEndOnly?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showGridLines?: boolean
  yAxisWidth?: number
  intervalType?: "preserveStartEnd" | "equidistantPreserveStart"
  showTooltip?: boolean
  showLegend?: boolean
  autoMinValue?: boolean
  minValue?: number
  maxValue?: number
  allowDecimals?: boolean
  onValueChange?: (value: BarChartTremorEventProps) => void
  enableLegendSlider?: boolean
  tickGap?: number
  barCategoryGap?: string | number
  xAxisLabel?: string
  yAxisLabel?: string
  layout?: "vertical" | "horizontal"
  stack?: boolean
  legendPosition?: "left" | "center" | "right"
  customTooltip?: React.ComponentType<BarChartTremorTooltipProps>
  showAnimation?: boolean
}

const BarChartTremor = React.forwardRef<HTMLDivElement, BarChartTremorProps>(
  (props, forwardedRef) => {
    const {
      data = [],
      categories = [],
      index,
      colors = [...AvailableChartColors],
      valueFormatter = (value: number) => value.toString(),
      startEndOnly = false,
      showXAxis = true,
      showYAxis = true,
      showGridLines = true,
      yAxisWidth = 56,
      intervalType = "equidistantPreserveStart",
      showTooltip = true,
      showLegend = true,
      autoMinValue = false,
      minValue,
      maxValue,
      allowDecimals = true,
      className,
      onValueChange,
      enableLegendSlider = false,
      barCategoryGap,
      tickGap = 5,
      xAxisLabel,
      yAxisLabel,
      layout = "horizontal",
      stack = false,
      legendPosition = "right",
      customTooltip: CustomTooltip,
      showAnimation = true,
      ...other
    } = props

    const paddingValue =
      (!showXAxis && !showYAxis) || (startEndOnly && !showYAxis) ? 0 : 20
    const [legendHeight, setLegendHeight] = React.useState(60)
    const [activeLegend, setActiveLegend] = React.useState<string | undefined>(undefined)
    const categoryColors = constructCategoryColors(categories, colors)
    const [activeBar, setActiveBar] = React.useState<any | undefined>(undefined)
    const hasOnValueChange = !!onValueChange

    // `useOnWindowResize` inline — recalcula altura da legend.
    React.useEffect(() => {
      const onResize = () => {
        // Sem DOM ref aqui: a legend é renderizada dentro do recharts.
        // Mantemos o setLegendHeight default + reposicionamento via CSS
        // (a legend do recharts é flex e se ajusta sozinha).
        // Marcamos só que a janela mudou (no-op funcional, mantém compat semântica).
        setLegendHeight((prev) => prev)
      }
      window.addEventListener("resize", onResize)
      return () => window.removeEventListener("resize", onResize)
    }, [])

    // Flat values para o `autoMinValue` funcionar com multi-série.
    const flatValues = React.useMemo(() => {
      const all: number[] = []
      for (const row of data) {
        for (const cat of categories) {
          const v = row?.[cat]
          if (typeof v === "number" && !Number.isNaN(v)) all.push(v)
        }
      }
      return all
    }, [data, categories])

    const yAxisDomain = computeYDomain(flatValues, autoMinValue, minValue, maxValue)

    const onBarClick = (data: any, _index: any, event: React.MouseEvent) => {
      event.stopPropagation()
      if (!onValueChange) return
      if (deepEqual(activeBar, { ...data.payload, value: data.value })) {
        setActiveLegend(undefined)
        setActiveBar(undefined)
        onValueChange(null)
      } else {
        setActiveLegend(data.tooltipPayload?.[0]?.dataKey)
        setActiveBar({ ...data.payload, value: data.value })
        onValueChange({
          eventType: "bar",
          categoryClicked: data.tooltipPayload?.[0]?.dataKey,
          ...data.payload,
        })
      }
    }

    const onCategoryClick = (dataKey: string) => {
      if (!hasOnValueChange) return
      if (dataKey === activeLegend && !activeBar) {
        setActiveLegend(undefined)
        onValueChange(null)
      } else {
        setActiveLegend(dataKey)
        onValueChange({ eventType: "category", categoryClicked: dataKey })
      }
      setActiveBar(undefined)
    }

    return (
      <div
        ref={forwardedRef}
        className={cn("h-80 w-full", className)}
        data-slot="bar-chart-tremor"
        tremor-id="tremor-raw"
        {...other}
      >
        <ResponsiveContainer>
          <RechartsBarChart
            data={data}
            onClick={
              hasOnValueChange && (activeLegend || activeBar)
                ? () => {
                    setActiveBar(undefined)
                    setActiveLegend(undefined)
                    onValueChange(null)
                  }
                : undefined
            }
            margin={{
              bottom: xAxisLabel ? 30 : undefined,
              left: yAxisLabel ? 20 : undefined,
              right: yAxisLabel ? 5 : undefined,
              top: 5,
            }}
            layout={layout}
            barCategoryGap={barCategoryGap}
          >
            {showGridLines ? (
              <CartesianGrid
                className="stroke-gray-200 stroke-1 dark:stroke-gray-800"
                horizontal={layout !== "vertical"}
                vertical={layout === "vertical"}
              />
            ) : null}
            <XAxis
              hide={!showXAxis}
              tick={{
                transform: layout !== "vertical" ? "translate(0, 6)" : undefined,
              }}
              fill=""
              stroke=""
              className={cx("text-xs", "fill-gray-500 dark:fill-gray-500", { "mt-4": layout !== "vertical" })}
              tickLine={false}
              axisLine={false}
              minTickGap={tickGap}
              {...(layout !== "vertical"
                ? {
                    padding: { left: paddingValue, right: paddingValue },
                    dataKey: index,
                    interval: startEndOnly ? "preserveStartEnd" : intervalType,
                    ticks: startEndOnly
                      ? [data[0]?.[index], data[data.length - 1]?.[index]]
                      : undefined,
                  }
                : {
                    type: "number",
                    domain: yAxisDomain as AxisDomain,
                    tickFormatter: valueFormatter,
                    allowDecimals,
                  })}
            >
              {xAxisLabel ? (
                <Label
                  position="insideBottom"
                  offset={-20}
                  className="fill-gray-800 text-sm font-medium dark:fill-gray-200"
                >
                  {xAxisLabel}
                </Label>
              ) : null}
            </XAxis>
            <YAxis
              width={yAxisWidth}
              hide={!showYAxis}
              axisLine={false}
              tickLine={false}
              fill=""
              stroke=""
              className={cx("text-xs", "fill-gray-500 dark:fill-gray-500")}
              tick={{
                transform: layout !== "vertical" ? "translate(-3, 0)" : "translate(0, 0)",
              }}
              {...(layout !== "vertical"
                ? {
                    type: "number",
                    domain: yAxisDomain as AxisDomain,
                    tickFormatter: valueFormatter,
                    allowDecimals,
                  }
                : {
                    dataKey: index,
                    ticks: startEndOnly
                      ? [data[0]?.[index], data[data.length - 1]?.[index]]
                      : undefined,
                    type: "category",
                    interval: "equidistantPreserveStart",
                  })}
            >
              {yAxisLabel ? (
                <Label
                  position="insideLeft"
                  style={{ textAnchor: "middle" }}
                  angle={-90}
                  offset={-15}
                  className="fill-gray-800 text-sm font-medium dark:fill-gray-200"
                >
                  {yAxisLabel}
                </Label>
              ) : null}
            </YAxis>
            <Tooltip
              wrapperStyle={{ outline: "none" }}
              isAnimationActive={showAnimation}
              animationDuration={100}
              cursor={{ fill: "#d1d5db", opacity: 0.15 }}
              offset={20}
              position={{
                y: layout === "horizontal" ? 0 : undefined,
                x: layout === "horizontal" ? undefined : yAxisWidth + 20,
              }}
              content={({ active, payload, label }: any) => {
                const cleanPayload: TooltipPayloadItem[] = payload
                  ? payload.map((item: any) => ({
                      category: item.dataKey,
                      value: item.value,
                      index: item.payload?.[index],
                      color: categoryColors.get(item.dataKey) ?? "gray",
                      type: item.type,
                      payload: item.payload,
                    }))
                  : []

                if (!showTooltip || !active) return null
                return CustomTooltip ? (
                  <CustomTooltip
                    active={active}
                    payload={cleanPayload}
                    label={String(label ?? "")}
                  />
                ) : (
                  <ChartTooltip
                    active={active}
                    payload={cleanPayload}
                    label={String(label ?? "")}
                    valueFormatter={valueFormatter}
                  />
                )
              }}
            />
            {showLegend ? (
              <RechartsLegend
                verticalAlign="top"
                height={legendHeight}
                content={({ payload }: any) => {
                  const filtered = (payload ?? []).filter((item: any) => item.type !== "none")
                  const items = filtered.map((entry: any) => entry.value)
                  const itemColors = filtered.map(
                    (entry: any) => categoryColors.get(entry.value) ?? "gray",
                  )
                  const paddingLeft =
                    legendPosition === "left" && yAxisWidth ? yAxisWidth - 8 : 0
                  return (
                    <div
                      style={{ paddingLeft }}
                      className={cx(
                        "flex items-center",
                        legendPosition === "center" && "justify-center",
                        legendPosition === "left" && "justify-start",
                        legendPosition === "right" && "justify-end",
                      )}
                    >
                      <LegendList
                        categories={items}
                        colors={itemColors}
                        onClickLegendItem={hasOnValueChange ? onCategoryClick : undefined}
                        activeLegend={activeLegend}
                        enableLegendSlider={enableLegendSlider}
                      />
                    </div>
                  )
                }}
              />
            ) : null}
            {categories.map((category) => {
              const color = categoryColors.get(category) ?? "gray"
              return (
                <Bar
                  className={cx(
                    getColorClassName(color, "fill"),
                    onValueChange ? "cursor-pointer" : "",
                  )}
                  key={category}
                  name={category}
                  type="linear"
                  dataKey={category}
                  stackId={stack ? "stack" : undefined}
                  isAnimationActive={showAnimation}
                  fill=""
                  /* eslint-disable @typescript-eslint/no-explicit-any */
                  shape={(shapeProps: any) => renderShape(shapeProps, activeBar, activeLegend, layout)}
                  onClick={onBarClick as any}
                  /* eslint-enable @typescript-eslint/no-explicit-any */
                />
              )
            })}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    )
  },
)
BarChartTremor.displayName = "BarChartTremor"

export { BarChartTremor }
// `cx`/`cn` continuam disponíveis via `@/lib/tremor-utils` e `@/lib/utils` —
// não re-exportamos aqui para manter o contrato "1 export por componente".
