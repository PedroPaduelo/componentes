/**
 * Tremor Raw CategoryBar — barra horizontal segmentada por categoria.
 *
 * Portado de https://github.com/tremorlabs/tremor/blob/main/src/components/CategoryBar/CategoryBar.tsx
 * (Tremor Raw v3). Cada segmento da barra representa uma categoria, em uma cor
 * Tremor (`bg-<color>-500`). Suporta marker opcional (linha vertical com tooltip),
 * labels cumulativos no topo e animação suave do marker.
 *
 * Diferenças em relação ao upstream:
 * - Sem `"use client"` (não usamos Next.js).
 * - `values` aceita `[{ name, value, color? }]` em vez de `number[]` + `colors[]`
 *   paralelos (API mais ergonômica; cores podem ser declaradas por item).
 * - `color` por item (opcional) sobrepõe `colors?` e o fallback cíclico.
 * - `valueFormatter?` para formatar números exibidos (labels e tooltip).
 * - Tooltip usa o shadcn/Tooltip do projeto (Radix) em vez do Tooltip do Tremor.
 * - Tailwind v4: classes literais (NÃO interpolar — `bg-${color}-500` não gera utility).
 *
 * Sem dependência de Recharts — CategoryBar é puro flex/divs.
 */

import * as React from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  AvailableChartColors,
  type AvailableChartColorsKeys,
  getColorClassName,
} from "@/lib/tremor-utils"

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

/** Um segmento da barra. `value` é o tamanho (será normalizado pela soma total). */
export interface CategoryBarTremorValue {
  name: string
  value: number
  /** Cor opcional por item — sobrescreve o pool `colors?` e o fallback cíclico. */
  color?: AvailableChartColorsKeys
}

/** Marker (linha vertical com tooltip) destacando um valor absoluto na barra. */
export interface CategoryBarTremorMarker {
  value: number
  tooltip?: string
  showAnimation?: boolean
}

export interface CategoryBarTremorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Segmentos da barra. `value` é o tamanho relativo. */
  values: CategoryBarTremorValue[]
  /** Pool de cores para fallback cíclico quando `value.color` não é definido. */
  colors?: AvailableChartColorsKeys[]
  /** Marker opcional (linha vertical com tooltip). */
  marker?: CategoryBarTremorMarker
  /** Mostra labels cumulativos no topo (0, prefixos intermediários, soma). */
  showLabels?: boolean
  /** Mantido para simetria com outros charts Tremor (não há animação de entrada na barra). */
  showAnimation?: boolean
  /** Formatter para os números exibidos em labels/tooltip. Default: formatNumber. */
  valueFormatter?: (value: number) => string
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

/** Cor efetiva de cada valor: explícita > pool cíclico. */
const resolveColor = (
  value: CategoryBarTremorValue,
  index: number,
  pool: AvailableChartColorsKeys[],
): AvailableChartColorsKeys => {
  if (value.color) return value.color
  return pool[index % pool.length] ?? "gray"
}

const sumNumericArray = (arr: number[]): number =>
  arr.reduce((acc, num) => acc + num, 0)

/** Formatador padrão (Tremor style): inteiros sem casa, fracionários com 1 casa. */
const formatNumber = (num: number): string => {
  if (Number.isInteger(num)) return num.toString()
  return num.toFixed(1)
}

const getPositionLeft = (
  value: number | undefined,
  maxValue: number,
): number => (value ? (value / maxValue) * 100 : 0)

const getMarkerBgColor = (
  marker: number | undefined,
  values: number[],
  colors: AvailableChartColorsKeys[],
): string => {
  if (marker === undefined) return ""

  if (marker === 0) {
    for (let index = 0; index < values.length; index++) {
      if (values[index] > 0) return getColorClassName(colors[index] ?? "gray", "fill")
        .replace(/^fill-/, "bg-")
    }
  }

  let prefixSum = 0
  for (let index = 0; index < values.length; index++) {
    prefixSum += values[index]
    if (prefixSum >= marker) {
      return getColorClassName(colors[index] ?? "gray", "fill").replace(/^fill-/, "bg-")
    }
  }

  return getColorClassName(colors[values.length - 1] ?? "gray", "fill").replace(
    /^fill-/,
    "bg-",
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

/** Labels cumulativos no topo da barra (0, prefixos intermediários, soma). */
const BarLabels = ({
  values,
  format,
}: {
  values: number[]
  format: (n: number) => string
}) => {
  const sumValues = React.useMemo(() => sumNumericArray(values), [values])
  let prefixSum = 0
  let sumConsecutiveHiddenLabels = 0

  return (
    <div
      className={cn(
        "relative mb-2 flex h-5 w-full text-sm font-medium",
        "text-gray-700 dark:text-gray-300",
      )}
    >
      <div className="absolute bottom-0 left-0 flex items-center">0</div>
      {values.map((widthPercentage, index) => {
        prefixSum += widthPercentage

        const showLabel =
          (widthPercentage >= 0.1 * sumValues ||
            sumConsecutiveHiddenLabels >= 0.09 * sumValues) &&
          sumValues - prefixSum >= 0.1 * sumValues &&
          prefixSum >= 0.1 * sumValues &&
          prefixSum < 0.9 * sumValues

        sumConsecutiveHiddenLabels = showLabel
          ? 0
          : (sumConsecutiveHiddenLabels += widthPercentage)

        const widthPositionLeft = getPositionLeft(widthPercentage, sumValues)

        return (
          <div
            key={`item-${index}`}
            className="flex items-center justify-end pr-0.5"
            style={{ width: `${widthPositionLeft}%` }}
          >
            {showLabel ? (
              <span className="block translate-x-1/2 text-sm tabular-nums">
                {format(prefixSum)}
              </span>
            ) : null}
          </div>
        )
      })}
      <div className="absolute bottom-0 right-0 flex items-center">
        {format(sumValues)}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

const CategoryBarTremor = React.forwardRef<
  HTMLDivElement,
  CategoryBarTremorProps
>(
  (
    {
      values = [],
      colors = [...AvailableChartColors],
      marker,
      showLabels = true,
      className,
      valueFormatter = formatNumber,
      ...props
    },
    forwardedRef,
  ) => {
    const numericValues = React.useMemo(
      () => values.map((v) => v.value),
      [values],
    )
    const effectiveColors = React.useMemo(
      () => values.map((v, i) => resolveColor(v, i, colors)),
      [values, colors],
    )

    const markerBgColor = React.useMemo(
      () => getMarkerBgColor(marker?.value, numericValues, effectiveColors),
      [marker, numericValues, effectiveColors],
    )

    const maxValue = React.useMemo(() => sumNumericArray(numericValues), [numericValues])

    const adjustedMarkerValue = React.useMemo(() => {
      if (marker === undefined) return undefined
      if (marker.value < 0) return 0
      if (marker.value > maxValue) return maxValue
      return marker.value
    }, [marker, maxValue])

    const markerPositionLeft = React.useMemo(
      () => getPositionLeft(adjustedMarkerValue, maxValue),
      [adjustedMarkerValue, maxValue],
    )

    return (
      <div
        ref={forwardedRef}
        className={cn(className)}
        aria-label="Category bar"
        aria-valuenow={marker?.value}
        data-slot="category-bar-tremor"
        tremor-id="tremor-raw"
        {...props}
      >
        {showLabels ? <BarLabels values={numericValues} format={valueFormatter} /> : null}
        <div className="relative flex h-2 w-full items-center">
          <div className="flex h-full flex-1 items-center gap-0.5 overflow-hidden rounded-full">
            {values.map((item, index) => {
              const barColor = effectiveColors[index] ?? "gray"
              const percentage = maxValue === 0 ? 0 : (item.value / maxValue) * 100

              // `bg-<color>-500` por classe literal — mapeamento explícito para
              // satisfazer Tailwind v4 (que não detecta classes interpoladas).
              const bgClass =
                item.color !== undefined
                  ? getColorClassName(item.color, "fill").replace(/^fill-/, "bg-")
                  : getColorClassName(barColor, "fill").replace(/^fill-/, "bg-")

              const segment = (
                <div
                  key={`item-${index}`}
                  className={cn(
                    "h-full",
                    bgClass,
                    percentage === 0 && "hidden",
                  )}
                  style={{ width: `${percentage}%` }}
                />
              )

              return (
                <TooltipProvider key={`provider-${index}`} delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {/* Wrapper invisível para o Tooltip ter um alvo full-width */}
                      {/* mesmo quando o segmento renderizado tem width 0%. */}
                      <div
                        className={cn(
                          "flex h-full",
                          percentage === 0 && "hidden",
                        )}
                        style={{ width: `${percentage}%` }}
                      >
                        {segment}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-xs opacity-80 tabular-nums">
                          {valueFormatter(item.value)}
                          {maxValue > 0 && (
                            <>
                              {" "}
                              ({((item.value / maxValue) * 100).toFixed(1)}%)
                            </>
                          )}
                        </span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>

          {marker !== undefined ? (
            <div
              className={cn(
                "absolute w-2 -translate-x-1/2",
                marker.showAnimation &&
                  "transform-gpu transition-all duration-300 ease-in-out",
              )}
              style={{ left: `${markerPositionLeft}%` }}
            >
              {marker.tooltip ? (
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        aria-hidden="true"
                        className={cn(
                          "relative mx-auto h-4 w-1 rounded-full ring-2",
                          "ring-white dark:ring-gray-950",
                          markerBgColor,
                        )}
                      >
                        <div
                          aria-hidden
                          className="absolute size-7 -translate-x-[45%] -translate-y-[15%]"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{marker.tooltip}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <div
                  className={cn(
                    "mx-auto h-4 w-1 rounded-full ring-2",
                    "ring-white dark:ring-gray-950",
                    markerBgColor,
                  )}
                />
              )}
            </div>
          ) : null}
        </div>
      </div>
    )
  },
)

CategoryBarTremor.displayName = "CategoryBarTremor"

export { CategoryBarTremor }
